# Camera Setup Guide

## What You're Seeing

The black box is the **video preview area** - it's normal and expected.

---

## Steps to Use Camera

### Step 1: Click "📷 Open Camera"
- Click the blue button that says "📷 Open Camera"
- Browser will ask for camera permission

### Step 2: Allow Camera Permission
- Click **"Allow"** when browser asks for camera access
- The black box will show your camera feed

### Step 3: Capture Photo
- Once camera is active, click **"📸 Capture Photo"**
- Your photo will be captured

### Step 4: Confirm or Retake
- See your captured photo
- Click **"🔄 Retake Photo"** if you want to try again
- Or continue with the form

---

## If Camera Doesn't Work

### Check Browser Permissions
1. Look at address bar (left side)
2. Click the camera icon
3. Make sure camera is "Allowed"

### Check Device
- Verify your device has a camera
- Make sure camera is not blocked by another app
- Try a different browser (Chrome, Firefox, Safari)

### Check HTTPS
- In production, camera requires HTTPS
- Localhost (development) works with HTTP

### Troubleshooting Steps
1. Refresh page (F5 or Cmd+R)
2. Close and reopen browser
3. Restart your device
4. Try different browser

---

## Expected Behavior

```
1. Page loads
   ↓
2. See "📷 Open Camera" button
   ↓
3. Click button
   ↓
4. Browser asks for permission
   ↓
5. Click "Allow"
   ↓
6. Black box shows camera feed
   ↓
7. Click "📸 Capture Photo"
   ↓
8. See your captured photo
   ↓
9. Continue with form
```

---

## Camera Not Showing?

If you still see black after clicking "Allow":

1. **Wait a few seconds** - camera takes time to initialize
2. **Check browser console** - Press F12, look for errors
3. **Try different browser** - Chrome works best
4. **Check camera is working** - Test with another app (Zoom, Skype)
5. **Restart browser** - Close and reopen

---

## Mobile Devices

On mobile:
- Camera will use back camera by default
- Allow camera permission when prompted
- Hold device steady for photo

---

## Desktop Computers

On desktop:
- Make sure webcam is connected
- Check webcam is not in use by another app
- Allow camera permission in browser

---

## Still Having Issues?

Check:
- ✅ Browser is up to date
- ✅ Camera is connected/working
- ✅ Camera permission is allowed
- ✅ No other app is using camera
- ✅ Frontend server is running (http://localhost:5173)

---

## Next Steps

1. Click "📷 Open Camera"
2. Allow permission
3. Click "📸 Capture Photo"
4. Fill rest of form
5. Submit complaint

The black box is normal - it will show your camera feed once you click "Open Camera"!
