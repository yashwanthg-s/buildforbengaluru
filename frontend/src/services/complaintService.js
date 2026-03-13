// Complaint Service - Handles API communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const complaintService = {
  async submitComplaint(complaintData) {
    try {
      const formData = new FormData();
      formData.append('user_id', complaintData.userId); // Add user_id
      formData.append('title', complaintData.title);
      formData.append('description', complaintData.description);
      formData.append('category', complaintData.category);
      formData.append('priority', complaintData.priority);
      formData.append('latitude', complaintData.latitude);
      formData.append('longitude', complaintData.longitude);
      formData.append('date', complaintData.date);
      formData.append('time', complaintData.time);
      formData.append('image', complaintData.imageBlob, 'complaint.jpg');

      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit complaint');
      }

      const result = await response.json();
      console.log('Complaint submission response:', result);
      return result;
    } catch (error) {
      console.error('Complaint submission error:', error);
      throw error;
    }
  },

  async getComplaints(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/complaints?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      return data.complaints || [];
    } catch (error) {
      console.error('Fetch complaints error:', error);
      throw error;
    }
  },

  async getComplaintById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch complaint');
      return await response.json();
    } catch (error) {
      console.error('Fetch complaint error:', error);
      throw error;
    }
  },

  async updateComplaintStatus(id, status, message = '', adminId = null) {
    try {
      const body = { status, message };
      if (adminId) {
        body.admin_id = adminId;
      }
      
      const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to update complaint');
      return await response.json();
    } catch (error) {
      console.error('Update complaint error:', error);
      throw error;
    }
  },

  async submitFeedback(complaintId, rating, feedbackText = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, feedback_text: feedbackText })
      });

      if (!response.ok) throw new Error('Failed to submit feedback');
      return await response.json();
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  },

  async getAdminStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.stats || {};
    } catch (error) {
      console.error('Fetch stats error:', error);
      throw error;
    }
  },

  async getEmergencyComplaints() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/emergency`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch emergency complaints');
      const data = await response.json();
      return data.complaints || [];
    } catch (error) {
      console.error('Fetch emergency complaints error:', error);
      throw error;
    }
  },

  async getAllFeedbacks() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      const data = await response.json();
      return data.feedbacks || [];
    } catch (error) {
      console.error('Fetch feedbacks error:', error);
      throw error;
    }
  },

  async getAllComplaintsForAdmin() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/all-complaints`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch all complaints');
      const data = await response.json();
      return data.complaints || [];
    } catch (error) {
      console.error('Fetch all complaints error:', error);
      throw error;
    }
  }
};
