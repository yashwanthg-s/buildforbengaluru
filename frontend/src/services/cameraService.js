// Camera Service - Handles live camera capture
export const cameraService = {
  stream: null,
  video: null,

  async requestCameraAccess() {
    try {
      // Try with environment camera first (back camera on mobile)
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (e) {
        // Fallback to any available camera
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      return { success: true, stream: this.stream };
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Unable to access camera.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access requires HTTPS or localhost.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  attachStreamToVideo(videoElement) {
    if (this.stream && videoElement) {
      videoElement.srcObject = this.stream;
      this.video = videoElement;
      
      // Wait for video to be ready
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(err => console.error('Play error:', err));
      };
    }
  },

  capturePhoto() {
    if (!this.video || !this.stream) {
      return { success: false, error: 'Video stream not available' };
    }

    try {
      // Wait a bit for video to have dimensions
      if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
        return { success: false, error: 'Camera not ready. Please wait a moment and try again.' };
      }

      const canvas = document.createElement('canvas');
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(this.video, 0, 0);

      // Convert to base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
      
      // Also get blob for file upload
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve({
            success: true,
            base64: imageBase64,
            blob: blob,
            timestamp: new Date().toISOString()
          });
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Photo capture error:', error);
      return { success: false, error: 'Failed to capture photo: ' + error.message };
    }
  },

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.video = null;
    }
  }
};
