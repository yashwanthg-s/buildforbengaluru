import React, { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import '../styles/LocationDisplay.css';

export const LocationDisplay = ({ onLocationCapture, onError }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    captureLocation();
  }, []);

  const captureLocation = async () => {
    setLoading(true);
    try {
      const result = await locationService.getCurrentLocation();
      setLocation({
        latitude: result.latitude,
        longitude: result.longitude
      });
      setAccuracy(result.accuracy);
      onLocationCapture({
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy
      });
    } catch (error) {
      onError(error.error);
    }
    setLoading(false);
  };

  const handleViewOnMap = () => {
    if (location) {
      const mapsUrl = locationService.generateMapsUrl(
        location.latitude,
        location.longitude
      );
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="location-display-container">
      <h3>📍 Location Information</h3>
      
      {location ? (
        <div className="location-info">
          <div className="location-details">
            <p>
              <strong>Latitude:</strong> {location.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {location.longitude}
            </p>
            {accuracy && (
              <p className="accuracy-info">
                <strong>Accuracy:</strong> ±{accuracy}m
              </p>
            )}
          </div>
          <button
            onClick={handleViewOnMap}
            className="btn btn-secondary"
          >
            🗺️ View on Google Maps
          </button>
          <button
            onClick={captureLocation}
            className="btn btn-outline"
          >
            🔄 Refresh Location
          </button>
          <p className="success-message">✓ Location captured</p>
        </div>
      ) : (
        <button
          onClick={captureLocation}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Detecting Location...' : '📍 Capture Location'}
        </button>
      )}
    </div>
  );
};
