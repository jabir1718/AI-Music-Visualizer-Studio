# Android APK build

The GitHub Actions workflow builds a debug APK from the browser-based WaveForge app using Capacitor.

## Build it
1. Open the repository's **Actions** tab.
2. Select **Build Android APK** in the left workflow list.
3. Tap **Run workflow** → choose the `main` branch → **Run workflow**.
4. Open the new run and wait for the green success check.
5. At the bottom of the run page, find **Artifacts** and download **WaveForge-Studio-debug-apk**.
6. Extract the downloaded ZIP; install `app-debug.apk` on your Android device.

A push to main that changes the app or build files also triggers the workflow.

## Notes
This is a debug APK for testing, not a Play Store release. A signed release build needs a signing key and secure GitHub Actions secrets. The app currently wraps the web studio; it does not turn browser-only features into native AI services. Browser recording, media codec support and device performance can vary.

## Microphone recording
WaveForge adds Android `RECORD_AUDIO` permission to the generated APK for optional MediaRecorder capture. Android may ask for microphone access when recording starts. If access is denied, allow microphone permission in Android app settings or use Import audio. Recording is local, limited to 3 minutes / 30 MB per take, and device codec behavior must be tested.
