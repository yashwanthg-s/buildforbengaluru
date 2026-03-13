// Location Service - Handles GPS location capture
export const locationService = {
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          success: false,
          error: 'Geolocation is not supported by your browser'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            success: true,
            latitude: parseFloat(latitude.toFixed(8)),
            longitude: parseFloat(longitude.toFixed(8)),
            accuracy: Math.round(accuracy),
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access is required to submit a complaint. Please enable location permissions.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information is unavailable. Please try again.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out. Please try again.';
          }

          reject({
            success: false,
            error: errorMessage,
            code: error.code
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  generateMapsUrl(latitude, longitude) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
};
