import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { locationService } from '../services/locationService';
import { OfficerNotificationBell } from './OfficerNotificationBell';
import '../styles/OfficerDashboard.css';

export const OfficerDashboard = ({ userId }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all'
  });
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const filterParams = { role: 'officer' };
      if (filters.status !== 'all') filterParams.status = filters.status;
      if (filters.category !== 'all') filterParams.category = filters.category;
      if (filters.priority !== 'all') filterParams.priority = filters.priority;

      const data = await complaintService.getComplaints(filterParams);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateMessage('');
    setUpdateStatus('');
  };

  const handleNotificationClick = async (complaintId) => {
    // Fetch the complaint and select it
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint) {
        handleSelectComplaint(complaint);
      } else {
        // If not in current list, fetch all complaints again
        await fetchComplaints();
        const refreshedComplaint = complaints.find(c => c.id === complaintId);
        if (refreshedComplaint) {
          handleSelectComplaint(refreshedComplaint);
        }
      }
    } catch (error) {
      console.error('Failed to open complaint from notification:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !updateStatus) return;

    try {
      await complaintService.updateComplaintStatus(
        selectedComplaint.id,
        updateStatus,
        updateMessage
      );

      // Refresh complaints
      await fetchComplaints();
      setSelectedComplaint(null);
      setUpdateMessage('');
      setUpdateStatus('');
    } catch (error) {
      console.error('Failed to update complaint:', error);
    }
  };

  const handleViewLocation = (complaint) => {
    const mapsUrl = locationService.generateMapsUrl(
      complaint.latitude,
      complaint.longitude
    );
    window.open(mapsUrl, '_blank');
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  const getPriorityBadgeClass = (priority) => {
    return `badge badge-priority-${priority}`;
  };

  return (
    <div className="officer-dashboard-container">
      <div className="dashboard-header">
        <h1>👮 Officer Dashboard</h1>
        <OfficerNotificationBell 
          officerId={userId} 
          onNotificationClick={handleNotificationClick}
        />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">All Assigned</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="traffic">Traffic</option>
            <option value="safety">Safety</option>
            <option value="utilities">Utilities</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority:</label>
          <select
            id="priority-filter"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Complaints List */}
        <div className="complaints-list">
          <h2>Assigned Complaints ({complaints.length})</h2>
          {loading ? (
            <p>Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p>No assigned complaints. Waiting for admin to assign emergency cases.</p>
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
                    <div className="badges">
                      <span className={getStatusBadgeClass(complaint.status)}>
                        {complaint.status}
                      </span>
                      <span className={getPriorityBadgeClass(complaint.priority)}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>
                  <p className="complaint-meta">
                    📍 {parseFloat(complaint.latitude).toFixed(6)}, {parseFloat(complaint.longitude).toFixed(6)}
                  </p>
                  <p className="complaint-meta">
                    📅 {complaint.date} {complaint.time}
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

            {/* Image */}
            <div className="detail-section">
              <h3>📸 Captured Image</h3>
              <img
                src={`http://localhost:5000${selectedComplaint.image_path}`}
                alt="Complaint evidence"
                className="complaint-image"
              />
            </div>

            {/* Title and Description */}
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
              <h3>📅 Date & Time</h3>
              <p>
                <strong>Date:</strong> {selectedComplaint.date}
              </p>
              <p>
                <strong>Time:</strong> {selectedComplaint.time}
              </p>
            </div>

            {/* Category and Priority */}
            <div className="detail-section">
              <p>
                <strong>Category:</strong> {selectedComplaint.category}
              </p>
              <p>
                <strong>Priority:</strong> {selectedComplaint.priority}
              </p>
              <p>
                <strong>Status:</strong> {selectedComplaint.status}
              </p>
            </div>

            {/* Update Status */}
            <div className="detail-section update-section">
              <h3>Update Status</h3>
              <div className="form-group">
                <label htmlFor="new-status">New Status:</label>
                <select
                  id="new-status"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  <option value="">Select status...</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="update-message">Message:</label>
                <textarea
                  id="update-message"
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="Add a message for the citizen..."
                  rows="3"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={!updateStatus}
                className="btn btn-primary"
              >
                ✓ Update Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
