# Camera Capture - Troubleshooting Guide

## Issue: Black Screen When Opening Camera

### Common Causes

1. **Camera not ready yet** - Video stream takes time to initialize
2. **Browser permissions** - Camera access blocked
3. **Camera in use** - Another app is using the camera
4. **HTTPS required** - Some browsers require secure connection
5. **Browser compatibility** - Older browsers may not support getUserMedia

## Solutions

### Solution 1: Wait for Camera to Load
The camera stream needs 1-2 seconds to initialize. Look for:
- "Loading camera..." message
- Video should appear after a moment
- If black screen persists > 3 seconds, try refreshing

### Solution 2: Check Browser Permissions
1. Click the lock icon (🔒) or info icon (ℹ️) in address bar
2. Find "Camera" permission
3. Make sure it's set to "Allow"
4. Refresh the page

**Chrome/Edge:**
- Settings → Privacy and security → Site settings → Camera
- Find localhost:5173 and set to "Allow"

**Firefox:**
- Click the camera icon in address bar
- Select "Allow" for camera access

### Solution 3: Close Other Apps Using Camera
Camera can only be used by one app at a time:
- Close Zoom, Teams, Skype, etc.
- Close other browser tabs using camera
- Restart browser if needed

### Solution 4: Use File Upload Instead
If camera doesn't work, use the upload option:
1. Click "📁 Upload Photo" button
2. Select an image from your device
3. Works the same as camera capture

### Solution 5: Check Browser Console
Open browser console (F12) and look for errors:

**Common errors:**
```
NotAllowedError: Permission denied
→ Allow camera in browser settings

NotFoundError: No camera found
→ Check if camera is connected/enabled

NotReadableError: Camera already in use
→ Close other apps using camera

SecurityError: Requires HTTPS
→ Use localhost or HTTPS
```

### Solution 6: Try Different Browser
If camera doesn't work in one browser, try another:
- ✅ Chrome (recommended)
- ✅ Edge (recommended)
- ✅ Firefox
- ⚠️ Safari (may have issues)
- ❌ Internet Explorer (not supported)

## Testing Camera Access

### Test 1: Check Camera Permissions
```javascript
// Open browser console (F12) and run:
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✓ Camera access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('✗ Camera error:', err));
```

### Test 2: List Available Cameras
```javascript
// Open browser console (F12) and run:
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log('Available cameras:', cameras);
  });
```

## Improvements Made

### 1. Better Loading State
- Shows "Loading camera..." message
- Hides video until stream is ready
- Prevents black screen confusion

### 2. Error Handling
- Specific error messages for different issues
- Console logs for debugging
- Fallback timeout (2 seconds)

### 3. Video Ready Detection
- Waits for `onloadedmetadata` event
- Ensures video is playing before showing
- Timeout fallback if metadata doesn't load

## Code Changes

### CameraCapture.jsx
```javascript
const handleOpenCamera = async () => {
  setLoading(true);
  setCameraError(null);
  
  try {
    const result = await cameraService.requestCameraAccess();

    if (result.success) {
      cameraService.attachStreamToVideo(videoRef.current);
      
      // Wait for video to be ready
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              console.log('Camera started successfully');
              setCameraActive(true);
              setLoading(false);
            })
            .catch(err => {
              console.error('Play error:', err);
              setCameraError('Failed to start camera preview');
              setLoading(false);
            });
        };
        
        // Fallback timeout
        setTimeout(() => {
          if (!cameraActive) {
            console.log('Camera timeout - activating anyway');
            setCameraActive(true);
            setLoading(false);
          }
        }, 2000);
      }
    } else {
      setCameraError(result.error);
      onError(result.error);
      setLoading(false);
    }
  } catch (error) {
    console.error('Camera open error:', error);
    setCameraError('Failed to open camera: ' + error.message);
    setLoading(false);
  }
};
```

### UI Changes
```jsx
{cameraActive ? (
  <div className="camera-preview">
    {loading && (
      <div className="camera-loading">
        <p>Loading camera...</p>
      </div>
    )}
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="video-stream"
      style={{ display: loading ? 'none' : 'block' }}
    />
    <button
      onClick={handleCapturePhoto}
      className="btn btn-primary"
      disabled={loading}
    >
      📸 Capture Photo
    </button>
  </div>
) : (
  // ... camera options
)}
```

## Expected Behavior

### Normal Flow
1. Click "📷 Open Camera"
2. Browser asks for camera permission (first time only)
3. Click "Allow"
4. See "Loading camera..." for 1-2 seconds
5. Camera feed appears
6. Click "📸 Capture Photo"
7. Photo preview shows
8. Can retake or proceed with submission

### With Black Screen
1. Click "📷 Open Camera"
2. See black screen with "Loading camera..."
3. Wait 2-3 seconds
4. Camera feed should appear
5. If still black after 3 seconds:
   - Check browser console for errors
   - Try refreshing page
   - Try different browser
   - Use "📁 Upload Photo" instead

## Browser Console Logs

### Successful Camera Access
```
Camera started successfully
```

### Camera Timeout (but working)
```
Camera timeout - activating anyway
```

### Camera Error
```
Camera access error: NotAllowedError
Failed to start camera preview
```

## Alternative: Use File Upload

If camera continues to have issues, the file upload option works perfectly:

1. Click "📁 Upload Photo"
2. Select any image from your device
3. Image preview shows immediately
4. Continue with complaint submission

This is especially useful for:
- Desktop computers without webcam
- Browsers with camera issues
- Testing with existing images
- Privacy-conscious users

## Files Modified

1. `frontend/src/components/CameraCapture.jsx` - Better loading and error handling
2. `frontend/src/styles/CameraCapture.css` - Loading indicator styles

## Status

✅ **Improved** - Better camera loading detection
✅ **Loading indicator** - Shows "Loading camera..." message
✅ **Error handling** - Specific error messages
✅ **Fallback** - File upload always available

---

**Quick Fix**: If camera shows black screen, wait 2-3 seconds or use "📁 Upload Photo" button instead!
