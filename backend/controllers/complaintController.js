const Complaint = require('../models/Complaint');
const axios = require('axios');
const contentFilter = require('../utils/contentFilter');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class ComplaintController {
  static async createComplaint(req, res) {
    try {
      const { title, description, category, priority, latitude, longitude, date, time, user_id } = req.body;
      const userId = user_id || req.user?.id || 1; // Use provided user_id, or auth user, or default to 1

      console.log('Creating complaint for user ID:', userId);

      // Validate required fields
      if (!title || !description || !latitude || !longitude || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Check content for inappropriate material
      const contentCheck = contentFilter.checkContent(title, description);
      if (contentCheck.isBlocked) {
        // Log the blocked attempt
        contentFilter.logBlockedAttempt(userId, title, description, contentCheck.reason);
        
        return res.status(400).json({
          success: false,
          message: contentCheck.reason,
          blocked: true
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      // Validate coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }

      // Prepare complaint data
      let complaintData = {
        user_id: userId,
        title,
        description,
        image_path: `/uploads/${req.file.filename}`,
        latitude: lat,
        longitude: lng,
        date,
        time,
        category: category || 'other',
        priority: priority || 'medium'
      };

      let aiCategory = category || 'other';
      let aiPriority = priority || 'medium';

      // Send to Gemini API for image analysis
      try {
        const geminiVisionService = require('../services/geminiVisionService');
        const fs = require('fs');
        
        // Read image file
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        
        // Analyze with Gemini
        const geminiResponse = await geminiVisionService.analyzeComplaintImage(
          base64Image,
          title,
          description
        );

        // Check if image is blocked (contains human)
        if (geminiResponse && geminiResponse.is_blocked) {
          console.warn('Image blocked by Gemini:', geminiResponse.block_reason);
          return res.status(400).json({
            success: false,
            message: geminiResponse.block_reason || 'Image contains blocked content',
            blocked: true
          });
        }

        if (geminiResponse) {
          aiCategory = geminiResponse.category || category || 'other';
          aiPriority = geminiResponse.priority || priority || 'medium';
          complaintData.category = aiCategory;
          complaintData.priority = aiPriority;
          console.log('Gemini Analysis:', {
            category: geminiResponse.category,
            priority: geminiResponse.priority,
            confidence: geminiResponse.confidence,
            is_blocked: geminiResponse.is_blocked
          });
        }
      } catch (aiError) {
        console.warn('Gemini analysis failed, using text-only fallback:', aiError.message);
        
        // Fallback to text-only analysis
        try {
          const textResponse = await axios.post(`${AI_SERVICE_URL}/categorize`, {
            title,
            description
          }, { timeout: 5000 });

          if (textResponse.data.category) {
            aiCategory = textResponse.data.category;
            complaintData.category = aiCategory;
          }
        } catch (textError) {
          console.warn('Text categorization also failed, using default');
        }
      }

      // Check for duplicate complaints
      let duplicateInfo = null;
      try {
        console.log('Checking for duplicates...', { category: aiCategory, lat, lng });
        
        // Get recent complaints in same category and area
        const recentComplaints = await Complaint.getRecentInArea(
          aiCategory,
          lat,
          lng,
          30 // Last 30 days
        );

        console.log(`Found ${recentComplaints.length} recent complaints in area`);

        if (recentComplaints.length > 0) {
          console.log('Sending to AI for duplicate check...');
          const duplicateResponse = await axios.post(
            `${AI_SERVICE_URL}/check-duplicate`,
            {
              title,
              description,
              category: aiCategory,
              latitude: lat,
              longitude: lng,
              existing_complaints: recentComplaints
            },
            { timeout: 5000 }
          );

          console.log('Duplicate check response:', duplicateResponse.data);

          if (duplicateResponse.data && duplicateResponse.data.is_duplicate) {
            duplicateInfo = duplicateResponse.data;
            console.log('✓ Duplicate detected:', {
              similar_count: duplicateInfo.similar_complaints.length,
              similarity: duplicateInfo.similarity_score,
              message: duplicateInfo.message
            });
          } else {
            console.log('No duplicate found');
          }
        } else {
          console.log('No recent complaints in area to compare');
        }
      } catch (dupError) {
        console.error('Duplicate check failed:', dupError.message);
        if (dupError.response) {
          console.error('AI service error:', dupError.response.data);
        }
      }

      // Save to database
      const complaintId = await Complaint.create(complaintData);

      // If duplicate, link to cluster
      if (duplicateInfo && duplicateInfo.is_duplicate) {
        try {
          await Complaint.linkToCluster(
            complaintId,
            duplicateInfo.cluster_hash,
            duplicateInfo.similar_complaints[0].id,
            duplicateInfo.similarity_score
          );
        } catch (clusterError) {
          console.warn('Failed to link to cluster:', clusterError.message);
        }
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Complaint submitted successfully',
        id: complaintId,
        complaint: {
          id: complaintId,
          ...complaintData
        }
      };

      // Add duplicate notification if found
      if (duplicateInfo && duplicateInfo.is_duplicate) {
        response.duplicate_detected = true;
        response.duplicate_message = duplicateInfo.message;
        response.similar_complaints_count = duplicateInfo.similar_complaints.length;
      }

      res.status(201).json(response);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit complaint',
        error: error.message
      });
    }
  }

  static async getComplaints(req, res) {
    try {
      const filters = {
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        user_id: req.query.user_id || req.user?.id
      };

      // For officer dashboard, only show complaints that are under_review or resolved
      // (i.e., assigned by admin)
      const userRole = req.query.role || 'citizen';
      if (userRole === 'officer') {
        // Officers only see assigned complaints
        if (!filters.status) {
          filters.status = 'under_review,resolved';
        }
      }

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      console.log('Fetching complaints with filters:', filters);

      const complaints = await Complaint.findAll(filters);

      res.json({
        success: true,
        count: complaints.length,
        complaints
      });
    } catch (error) {
      console.error('Get complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaints',
        error: error.message
      });
    }
  }

  static async getComplaintById(req, res) {
    try {
      const { id } = req.params;
      const complaint = await Complaint.findById(id);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      res.json({
        success: true,
        complaint
      });
    } catch (error) {
      console.error('Get complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaint',
        error: error.message
      });
    }
  }

  static async updateComplaintStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, message, admin_id } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['submitted', 'under_review', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      await Complaint.updateStatus(id, status, message, admin_id);

      res.json({
        success: true,
        message: 'Complaint status updated',
        id
      });
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update complaint',
        error: error.message
      });
    }
  }

  static async deleteComplaint(req, res) {
    try {
      const { id } = req.params;

      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      await Complaint.delete(id);

      res.json({
        success: true,
        message: 'Complaint deleted'
      });
    } catch (error) {
      console.error('Delete complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete complaint',
        error: error.message
      });
    }
  }

  static async submitFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, feedback_text } = req.body;
      const userId = req.user?.id || 1;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      if (complaint.status !== 'resolved') {
        return res.status(400).json({
          success: false,
          message: 'Can only provide feedback for resolved complaints'
        });
      }

      await Complaint.addFeedback(id, userId, rating, feedback_text);

      res.json({
        success: true,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  }

  static async validateImage(req, res) {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({
          success: false,
          message: 'Image is required'
        });
      }

      // Remove data URI prefix if present
      let base64Image = image;
      if (image.includes(',')) {
        base64Image = image.split(',')[1];
      }

      // Use Gemini Vision API for validation
      const geminiVisionService = require('../services/geminiVisionService');
      const validationResult = await geminiVisionService.analyzeComplaintImage(
        base64Image,
        'Image validation',
        'Validating image for complaint submission'
      );

      // Check if image is blocked
      if (validationResult && validationResult.is_blocked) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: validationResult.block_reason || 'Invalid image',
          blocked: true
        });
      }

      // Image is valid
      return res.json({
        success: true,
        valid: true,
        message: 'Image validation successful',
        category: validationResult.category || 'other',
        priority: validationResult.priority || 'medium',
        confidence: validationResult.confidence || 0.5
      });

    } catch (error) {
      console.error('Image validation error:', error);
      // Allow submission if validation fails
      return res.json({
        success: true,
        valid: true,
        message: 'Image validation skipped (service unavailable)',
        category: 'other',
        priority: 'medium',
        confidence: 0.5
      });
    }
  }
}

module.exports = ComplaintController;
