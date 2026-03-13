import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { locationService } from '../services/locationService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    emergency: 0,
    submitted: 0,
    under_review: 0,
    resolved: 0,
    rejected: 0,
    avgRating: 0
  });
  const [allComplaints, setAllComplaints] = useState([]);
  const [displayedComplaints, setDisplayedComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaintFeedback, setComplaintFeedback] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, complaintsData, feedbackData] = await Promise.all([
        complaintService.getAdminStats().catch(() => ({})),
        complaintService.getAllComplaintsForAdmin().catch(() => []),
        complaintService.getAllFeedbacks().catch(() => [])
      ]);
      
      setStats({
        total: Number(statsData.total) || 0,
        emergency: Number(statsData.emergency) || 0,
        submitted: Number(statsData.submitted) || 0,
        under_review: Number(statsData.under_review) || 0,
        resolved: Number(statsData.resolved) || 0,
        rejected: Number(statsData.rejected) || 0,
        avgRating: Number(statsData.avgRating) || 0
      });
      setAllComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      setDisplayedComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
      setShowEmergencyOnly(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
  };

  const handleShowAllComplaints = () => {
    setDisplayedComplaints(allComplaints);
    setShowEmergencyOnly(false);
    setActiveFilter('all');
  };

  const handleFilterByStatus = (status) => {
    setActiveFilter(status);
    setShowEmergencyOnly(false);
    
    if (status === 'all') {
      setDisplayedComplaints(allComplaints);
    } else if (status === 'assigned') {
      // Show complaints that are under_review (assigned to officers)
      const assigned = allComplaints.filter(c => c.status === 'under_review');
      setDisplayedComplaints(assigned);
    } else {
      const filtered = allComplaints.filter(c => c.status === status);
      setDisplayedComplaints(filtered);
    }
  };

  const handleViewLocation = (complaint) => {
    const mapsUrl = locationService.generateMapsUrl(
      complaint.latitude,
      complaint.longitude
    );
    window.open(mapsUrl, '_blank');
  };

  const handleSelectComplaint = async (complaint) => {
    console.log('Selected complaint:', complaint);
    console.log('Before image path:', complaint.before_image_path);
    console.log('After image path:', complaint.after_image_path);
    setSelectedComplaint(complaint);
    // Fetch feedback for this complaint
    try {
      const allFeedback = feedbacks.find(f => f.complaint_id === complaint.id);
      setComplaintFeedback(allFeedback || null);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    }
  };

  const handleCloseComplaintDetail = () => {
    setSelectedComplaint(null);
    setComplaintFeedback(null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  const renderStarRating = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="admin-dashboard-container">
      <h1>🔐 Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div 
          className={`stat-card total ${activeFilter === 'all' ? 'active-card' : ''}`}
          onClick={() => handleFilterByStatus('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Complaints</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div 
          className={`stat-card pending ${activeFilter === 'submitted' ? 'active-card' : ''}`}
          onClick={() => handleFilterByStatus('submitted')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.submitted}</p>
          </div>
        </div>

        <div 
          className={`stat-card assigned ${activeFilter === 'assigned' ? 'active-card' : ''}`}
          onClick={() => handleFilterByStatus('assigned')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">👮</div>
          <div className="stat-content">
            <h3>Assigned</h3>
            <p className="stat-number">{stats.under_review}</p>
          </div>
        </div>

        <div 
          className={`stat-card resolved ${activeFilter === 'resolved' ? 'active-card' : ''}`}
          onClick={() => handleFilterByStatus('resolved')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <p className="stat-number">{stats.resolved}</p>
          </div>
        </div>

        <div className="stat-card rating">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Avg Rating</h3>
            <p className="stat-number">{(stats.avgRating || 0).toFixed(1)}/5</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          📋 All Complaints ({allComplaints.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          ⭐ Feedback ({feedbacks.length})
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'complaints' ? (
          <div className="complaints-section">
            <div className="section-header">
              <div className="header-left">
                <h2>📋 Complaints Management</h2>
                <p>Showing all {displayedComplaints.length} complaints</p>
              </div>
              <div className="header-actions">
              </div>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : displayedComplaints.length === 0 ? (
              <div className="empty-state">
                <p>No complaints found</p>
              </div>
            ) : (
              <div className="emergency-grid">
                {displayedComplaints.map(complaint => (
                  <div 
                    key={complaint.id} 
                    className={`emergency-card ${selectedComplaint?.id === complaint.id ? 'selected' : ''}`}
                    onClick={() => handleSelectComplaint(complaint)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="emergency-header">
                      <span 
                        className="priority-badge"
                        style={{ background: getPriorityColor(complaint.priority) }}
                      >
                        {complaint.priority.toUpperCase()}
                      </span>
                      <span className="complaint-id">#{complaint.id}</span>
                      {complaint.urgency_score && (
                        <span className="urgency-score" title="AI Urgency Score">
                          🔥 {complaint.urgency_score.toFixed(0)}
                        </span>
                      )}
                      {complaint.duplicate_count && complaint.duplicate_count > 1 && (
                        <span className="duplicate-badge" title={`Reported by ${complaint.duplicate_count} citizens`}>
                          👥 {complaint.duplicate_count} Reports
                        </span>
                      )}
                    </div>

                    <img
                      src={`http://localhost:5000${complaint.image_path}`}
                      alt="Complaint"
                      className="emergency-image"
                    />

                    <h3>{complaint.title}</h3>
                    <p className="description">{complaint.description.substring(0, 150)}...</p>

                    {/* Display Important Keywords */}
                    {complaint.keywords && complaint.keywords.length > 0 && (
                      <div className="keywords-section">
                        <span className="keywords-label">🔑 Key Issues:</span>
                        <div className="keywords-list">
                          {complaint.keywords.map((keyword, idx) => (
                            <span key={idx} className="keyword-tag">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="emergency-meta">
                      <div className="meta-item">
                        <span className="meta-label">📍 Location:</span>
                        <span>{parseFloat(complaint.latitude || 0).toFixed(4)}, {parseFloat(complaint.longitude || 0).toFixed(4)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">📅 Date:</span>
                        <span>{complaint.date} {complaint.time}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">🏷️ Category:</span>
                        <span>{complaint.category}</span>
                      </div>
                      {complaint.ai_confidence && (
                        <div className="meta-item">
                          <span className="meta-label">🤖 AI Confidence:</span>
                          <span>{(complaint.ai_confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>

                    <div className="emergency-actions">
                      <button
                        onClick={() => handleViewLocation(complaint)}
                        className="btn btn-secondary"
                      >
                        🗺️ View Location
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="feedback-section">
            <div className="section-header">
              <h2>⭐ Citizen Feedback</h2>
              <p>Feedback from resolved complaints</p>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : feedbacks.length === 0 ? (
              <div className="empty-state">
                <p>No feedback received yet</p>
              </div>
            ) : (
              <div className="feedback-list">
                {feedbacks.map(feedback => (
                  <div key={feedback.id} className="feedback-card">
                    <div className="feedback-header">
                      <div className="rating-display">
                        {renderStarRating(feedback.rating)}
                        <span className="rating-number">{feedback.rating}/5</span>
                      </div>
                      <span className="feedback-date">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="feedback-complaint">
                      <h4>Complaint: {feedback.complaint_title}</h4>
                      <p className="complaint-category">
                        🏷️ {feedback.complaint_category} • 
                        📍 {parseFloat(feedback.complaint_latitude).toFixed(4)}, {parseFloat(feedback.complaint_longitude).toFixed(4)}
                      </p>
                    </div>

                    {feedback.feedback_text && (
                      <div className="feedback-text">
                        <p>"{feedback.feedback_text}"</p>
                      </div>
                    )}

                    <div className="feedback-meta">
                      <span>Submitted by: {feedback.user_name || 'Citizen'}</span>
                      <span>Complaint ID: #{feedback.complaint_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={handleCloseComplaintDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Details - #{selectedComplaint.id}</h2>
              <button className="close-btn" onClick={handleCloseComplaintDetail}>✕</button>
            </div>

            <div className="modal-body">
              {/* Original Complaint Image */}
              <div className="detail-section">
                <h3>📸 Original Complaint Image</h3>
                <img
                  src={`http://localhost:5000${selectedComplaint.image_path}`}
                  alt="Complaint"
                  className="detail-image"
                />
              </div>

              {/* Complaint Details */}
              <div className="detail-section">
                <h3>📋 Complaint Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Title:</label>
                    <p>{selectedComplaint.title}</p>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <p>{selectedComplaint.description}</p>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <p>{selectedComplaint.category}</p>
                  </div>
                  <div className="detail-item">
                    <label>Priority:</label>
                    <p style={{ color: getPriorityColor(selectedComplaint.priority) }}>
                      {selectedComplaint.priority.toUpperCase()}
                    </p>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <p>{selectedComplaint.status}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date & Time:</label>
                    <p>{selectedComplaint.date} {selectedComplaint.time}</p>
                  </div>
                </div>
              </div>

              {/* Resolution Images - Only for resolved complaints */}
              {selectedComplaint.status === 'resolved' && selectedComplaint.resolution_id && (
                <div className="detail-section resolution-section">
                  <h3>✅ Resolution Proof</h3>
                  <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '15px' }}>
                    Officer has provided before and after images showing the resolution
                  </p>
                  <div className="resolution-images">
                    {selectedComplaint.before_image_path && (
                      <div className="resolution-image-container">
                        <h4>Before Work</h4>
                        <img
                          src={`http://localhost:5000${selectedComplaint.before_image_path}`}
                          alt="Before resolution"
                          className="resolution-image"
                        />
                      </div>
                    )}
                    {selectedComplaint.after_image_path && (
                      <div className="resolution-image-container">
                        <h4>After Work</h4>
                        <img
                          src={`http://localhost:5000${selectedComplaint.after_image_path}`}
                          alt="After resolution"
                          className="resolution-image"
                        />
                      </div>
                    )}
                  </div>
                  {selectedComplaint.resolution_notes && (
                    <div className="resolution-notes">
                      <h4>Resolution Notes</h4>
                      <p>{selectedComplaint.resolution_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Citizen Feedback - Only for resolved complaints */}
              {selectedComplaint.status === 'resolved' && complaintFeedback && (
                <div className="detail-section feedback-section">
                  <h3>⭐ Citizen Feedback</h3>
                  <div className="feedback-display">
                    <div className="feedback-rating">
                      <span className="stars">{renderStarRating(complaintFeedback.rating)}</span>
                      <span className="rating-text">{complaintFeedback.rating}/5 Stars</span>
                    </div>
                    {complaintFeedback.feedback_text && (
                      <div className="feedback-comment">
                        <p>"{complaintFeedback.feedback_text}"</p>
                      </div>
                    )}
                    <div className="feedback-meta">
                      <span>Submitted by: {complaintFeedback.user_name || 'Citizen'}</span>
                      <span>Date: {new Date(complaintFeedback.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedComplaint.status === 'resolved' && !complaintFeedback && (
                <div className="detail-section">
                  <p style={{ color: '#999', fontStyle: 'italic' }}>
                    No feedback received from citizen yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
