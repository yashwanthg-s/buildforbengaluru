import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { locationService } from '../services/locationService';
import '../styles/CitizenHistory.css';

const CitizenHistory = ({ userId = 1, selectedComplaintId = null, onComplaintViewed }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback_text: ''
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    fetchMyComplaints();
  }, [userId]);

  // Auto-select complaint when coming from notification
  useEffect(() => {
    if (selectedComplaintId && complaints.length > 0) {
      const complaint = complaints.find(c => c.id === selectedComplaintId);
      if (complaint) {
        handleSelectComplaint(complaint);
        // Notify parent that complaint was viewed
        if (onComplaintViewed) {
          onComplaintViewed();
        }
      }
    }
  }, [selectedComplaintId, complaints]);

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      console.log('Fetching complaints for user ID:', userId);
      // Pass user_id filter to only get this user's complaints
      const data = await complaintService.getComplaints({ user_id: userId });
      console.log('Fetched complaints:', data);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
    setLoading(false);
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowFeedbackForm(false);
    setFeedbackData({ rating: 0, feedback_text: '' });
  };

  const handleViewLocation = (complaint) => {
    const mapsUrl = locationService.generateMapsUrl(
      complaint.latitude,
      complaint.longitude
    );
    window.open(mapsUrl, '_blank');
  };

  const handleSubmitFeedback = async () => {
    if (!selectedComplaint || feedbackData.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    try {
      await complaintService.submitFeedback(
        selectedComplaint.id,
        feedbackData.rating,
        feedbackData.feedback_text
      );
      alert('Feedback submitted successfully!');
      setShowFeedbackForm(false);
      setFeedbackData({ rating: 0, feedback_text: '' });
      
      // Refresh complaints to update has_feedback flag
      await fetchMyComplaints();
      
      // Re-select the complaint to show updated state
      const updatedComplaint = complaints.find(c => c.id === selectedComplaint.id);
      if (updatedComplaint) {
        setSelectedComplaint({ ...updatedComplaint, has_feedback: true });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      submitted: '📝',
      under_review: '🔍',
      resolved: '✅',
      rejected: '❌'
    };
    return icons[status] || '📝';
  };

  return (
    <div className="citizen-history-container">
      <h1>📋 My Complaint History</h1>

      <div className="history-content">
        {/* Complaints List */}
        <div className="complaints-list">
          <h2>My Complaints ({complaints.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : complaints.length === 0 ? (
            <p>No complaints found. Submit your first complaint!</p>
          ) : (
            <div className="list">
              {complaints.map(complaint => (
                <div
                  key={complaint.id}
                  className={`complaint-item ${selectedComplaint?.id === complaint.id ? 'active' : ''}`}
                  onClick={() => handleSelectComplaint(complaint)}
                >
                  <div className="complaint-header">
                    <h3>{complaint.title}</h3>
                    <span className={getStatusBadgeClass(complaint.status)}>
                      {getStatusIcon(complaint.status)} {complaint.status}
                    </span>
                  </div>
                  <p className="complaint-meta">
                    📅 {complaint.date} {complaint.time}
                  </p>
                  <p className="complaint-meta">
                    🏷️ {complaint.category} • {complaint.priority}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaint Details */}
        {selectedComplaint && (
          <div className="complaint-details">
            <h2>Complaint Details</h2>

            {/* Status */}
            <div className="detail-section">
              <div className="status-display">
                <span className={getStatusBadgeClass(selectedComplaint.status)}>
                  {getStatusIcon(selectedComplaint.status)} {selectedComplaint.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="detail-section">
              <h3>📸 Evidence Photo</h3>
              <img
                src={`http://localhost:5000${selectedComplaint.image_path}`}
                alt="Complaint evidence"
                className="complaint-image"
              />
            </div>

            {/* Details */}
            <div className="detail-section">
              <h3>Title</h3>
              <p>{selectedComplaint.title}</p>
              <h3>Description</h3>
              <p>{selectedComplaint.description}</p>
            </div>

            {/* Location */}
            <div className="detail-section">
              <h3>📍 Location</h3>
              <p>
                <strong>Latitude:</strong> {selectedComplaint.latitude}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedComplaint.longitude}
              </p>
              <button
                onClick={() => handleViewLocation(selectedComplaint)}
                className="btn btn-secondary"
              >
                🗺️ View on Google Maps
              </button>
            </div>

            {/* Date and Time */}
            <div className="detail-section">
              <h3>📅 Submitted On</h3>
              <p>{selectedComplaint.date} at {selectedComplaint.time}</p>
            </div>

            {/* Feedback Section - Only for resolved complaints */}
            {selectedComplaint.status === 'resolved' && (
              <div className="detail-section feedback-section">
                <h3>⭐ Feedback</h3>
                {selectedComplaint.has_feedback ? (
                  <div className="feedback-submitted">
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                      ✅ Feedback Submitted
                    </p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '0.95rem' }}>
                      Thank you for your feedback! You have already submitted your rating for this complaint.
                    </p>
                  </div>
                ) : (
                  <>
                    {!showFeedbackForm ? (
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="btn btn-primary"
                      >
                        📝 Give Feedback
                      </button>
                    ) : (
                      <div className="feedback-form">
                        <div className="form-group">
                          <label>Rating:</label>
                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span
                                key={star}
                                className={`star ${feedbackData.rating >= star ? 'active' : ''}`}
                                onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="feedback-text">Comments (optional):</label>
                          <textarea
                            id="feedback-text"
                            value={feedbackData.feedback_text}
                            onChange={(e) => setFeedbackData({ ...feedbackData, feedback_text: e.target.value })}
                            placeholder="Share your experience..."
                            rows="4"
                          />
                        </div>

                        <div className="form-actions">
                          <button
                            onClick={handleSubmitFeedback}
                            disabled={feedbackData.rating === 0}
                            className="btn btn-primary"
                          >
                            ✓ Submit Feedback
                          </button>
                          <button
                            onClick={() => setShowFeedbackForm(false)}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenHistory;
