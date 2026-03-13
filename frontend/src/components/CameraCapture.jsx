import React, { useRef, useState } from 'react';
import '../styles/CameraCapture.css';

export const CameraCapture = ({ onPhotoCapture, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const handleOpenCamera = async () => {
    setLoading(true);
    setCameraReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Try to wait for metadata
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            console.log('Camera ready via metadata:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            setCameraReady(true);
            setLoading(false);
          }).catch(err => {
            console.error('Play error:', err);
            // Still mark as ready even if play fails
            setCameraReady(true);
            setLoading(false);
          });
        };
        
        // Fallback: Force ready after 2 seconds
        setTimeout(() => {
          if (!cameraReady) {
            console.log('Camera ready via timeout');
            setCameraReady(true);
            setLoading(false);
            // Try to play video
            if (videoRef.current) {
              videoRef.current.play().catch(err => console.log('Play error:', err));
            }
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setLoading(false);
      setShowCamera(false);
      alert('Unable to access camera. Please use Upload Photo option.');
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make sure video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Camera not ready. Please wait a moment and try again.');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    
    console.log('Photo captured, base64 length:', base64.length);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to capture photo. Please try again.');
        return;
      }
      
      console.log('Blob created, size:', blob.size);
      
      setCapturedPhoto(base64);
      onPhotoCapture({
        base64: base64,
        blob: blob,
        timestamp: new Date().toISOString()
      });
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setShowCamera(false);
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setCapturedPhoto(base64);
        onPhotoCapture({
          base64: base64,
          blob: file,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  return (
    <div className="camera-capture-container">
      <h3>📸 Photo Evidence</h3>
      
      {!capturedPhoto && !showCamera && (
        <div className="camera-options">
          <button
            onClick={handleOpenCamera}
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? '⏳ Loading...' : '📷 Take Photo'}
          </button>
          
          <div className="divider">OR</div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn btn-secondary btn-large"
          >
            📁 Upload Photo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <p className="info-text">
            📷 Take Photo: Opens webcam to capture new photo<br/>
            📁 Upload Photo: Select existing photo from device
          </p>
        </div>
      )}

      {showCamera && (
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-stream"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {!cameraReady && (
            <div className="camera-loading-overlay">
              <p>📷 Camera loading...</p>
            </div>
          )}
          <div className="camera-controls">
            <button
              onClick={handleCapturePhoto}
              className="btn btn-primary btn-large"
              disabled={!cameraReady}
            >
              {cameraReady ? '📸 Capture Photo' : '⏳ Loading...'}
            </button>
            <button
              onClick={handleCloseCamera}
              className="btn btn-secondary"
            >
              ✕ Close Camera
            </button>
          </div>
        </div>
      )}

      {capturedPhoto && (
        <div className="photo-preview">
          <img 
            src={capturedPhoto} 
            alt="Captured complaint evidence" 
            onError={(e) => {
              console.error('Image failed to load');
              e.target.style.display = 'none';
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully');
            }}
          />
          <div className="photo-actions">
            <button
              onClick={handleRetake}
              className="btn btn-secondary"
            >
              🔄 Change Photo
            </button>
          </div>
          <p className="success-message">✓ Photo ready</p>
        </div>
      )}
    </div>
  );
};
