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
    category: 'infrastructure'
  });
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionMode, setResolutionMode] = useState(false);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const filterParams = { 
        role: 'officer',
        category: filters.category
      };
      if (filters.status !== 'all') filterParams.status = filters.status;

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

  const handleResolveComplaint = async () => {
    if (!selectedComplaint || !beforeImage || !afterImage) {
      alert('Please upload both before and after images');
      return;
    }

    setSubmittingResolution(true);
    try {
      // Convert images to base64 if they're File objects
      const beforeBase64 = typeof beforeImage === 'string' 
        ? beforeImage 
        : await fileToBase64(beforeImage);
      
      const afterBase64 = typeof afterImage === 'string' 
        ? afterImage 
        : await fileToBase64(afterImage);

      // Call resolve endpoint
      const response = await fetch(`http://localhost:5000/api/complaints/${selectedComplaint.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          officer_id: userId,
          before_image: beforeBase64,
          after_image: afterBase64,
          resolution_notes: resolutionNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve complaint');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Complaint resolved successfully!');
        // Refresh complaints
        await fetchComplaints();
        setSelectedComplaint(null);
        setResolutionMode(false);
        setBeforeImage(null);
        setAfterImage(null);
        setResolutionNotes('');
      }
    } catch (error) {
      console.error('Failed to resolve complaint:', error);
      alert('Failed to resolve complaint: ' + error.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
            <option value="infrastructure">Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="traffic">Traffic</option>
            <option value="safety">Safety</option>
            <option value="utilities">Utilities</option>
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

            {/* Category and Status */}
            <div className="detail-section">
              <p>
                <strong>Category:</strong> {selectedComplaint.category}
              </p>
              <p>
                <strong>Status:</strong> {selectedComplaint.status}
              </p>
            </div>

            {/* Update Status */}
            <div className="detail-section update-section">
              <h3>Update Status</h3>
              
              {!resolutionMode ? (
                <>
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

                  {updateStatus === 'resolved' ? (
                    <button
                      onClick={() => setResolutionMode(true)}
                      className="btn btn-success"
                    >
                      📸 Upload Resolution Images
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdateStatus}
                      disabled={!updateStatus}
                      className="btn btn-primary"
                    >
                      ✓ Update Status
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h4>📸 Work Progress Documentation</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                    ⚠️ Upload images to document your work. Both images are required to mark as resolved.
                  </p>

                  {/* STEP 1: BEFORE WORK */}
                  <div className="resolution-step">
                    <div className="step-header">
                      <span className="step-number">1️⃣</span>
                      <h5>BEFORE WORK - Upload Issue Image</h5>
                      {beforeImage && <span className="step-complete">✓ Complete</span>}
                    </div>
                    <p className="step-description">
                      Take a photo showing the issue BEFORE you start working on it
                    </p>
                    <div className="form-group">
                      <label htmlFor="before-image">📷 Upload Image (Before Work):</label>
                      <input
                        id="before-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBeforeImage(e.target.files[0])}
                        className="file-input"
                      />
                      {beforeImage && (
                        <div className="image-preview">
                          <img 
                            src={URL.createObjectURL(beforeImage)} 
                            alt="Before" 
                            style={{ maxWidth: '250px', marginTop: '10px', borderRadius: '6px' }}
                          />
                          <p style={{ fontSize: '0.85rem', color: '#28a745', marginTop: '8px', fontWeight: '600' }}>
                            ✓ Before image uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 2: AFTER WORK */}
                  <div className="resolution-step">
                    <div className="step-header">
                      <span className="step-number">2️⃣</span>
                      <h5>AFTER WORK - Upload Completed Image</h5>
                      {afterImage && <span className="step-complete">✓ Complete</span>}
                    </div>
                    <p className="step-description">
                      Take a photo showing the issue AFTER you have completed the work
                    </p>
                    <div className="form-group">
                      <label htmlFor="after-image">📷 Upload Image (After Work):</label>
                      <input
                        id="after-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAfterImage(e.target.files[0])}
                        className="file-input"
                      />
                      {afterImage && (
                        <div className="image-preview">
                          <img 
                            src={URL.createObjectURL(afterImage)} 
                            alt="After" 
                            style={{ maxWidth: '250px', marginTop: '10px', borderRadius: '6px' }}
                          />
                          <p style={{ fontSize: '0.85rem', color: '#28a745', marginTop: '8px', fontWeight: '600' }}>
                            ✓ After image uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 3: NOTES */}
                  <div className="resolution-step">
                    <div className="step-header">
                      <span className="step-number">3️⃣</span>
                      <h5>WORK NOTES (Optional)</h5>
                    </div>
                    <p className="step-description">
                      Describe what you did to resolve the issue
                    </p>
                    <div className="form-group">
                      <label htmlFor="resolution-notes">📝 Work Description:</label>
                      <textarea
                        id="resolution-notes"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Example: Fixed pothole with asphalt, smoothed edges, cleaned area..."
                        rows="3"
                      />
                    </div>
                  </div>

                  {/* PROGRESS INDICATOR */}
                  <div className="progress-indicator">
                    <div className={`progress-item ${beforeImage ? 'complete' : 'pending'}`}>
                      <span>Before Image</span>
                    </div>
                    <div className={`progress-item ${afterImage ? 'complete' : 'pending'}`}>
                      <span>After Image</span>
                    </div>
                  </div>

                  {/* SUBMIT SECTION */}
                  <div className="button-group">
                    <button
                      onClick={handleResolveComplaint}
                      disabled={!beforeImage || !afterImage || submittingResolution}
                      className="btn btn-success"
                      title={!beforeImage || !afterImage ? 'Both before and after images are required' : ''}
                    >
                      {submittingResolution ? '⏳ Submitting...' : '✓ Submit Resolution'}
                    </button>
                    <button
                      onClick={() => {
                        setResolutionMode(false);
                        setBeforeImage(null);
                        setAfterImage(null);
                        setResolutionNotes('');
                      }}
                      className="btn btn-secondary"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
