# WaveForge — Music Visualizer Studio

A browser-based, local-first music visualizer editor. Version 1.0 foundation.

## Included in this starter
- Import a local audio track (browser-supported audio formats).
- Add a photo or video as the visual background.
- Live canvas visualizer: equalizer bars, waveform, circular spectrum and neon pulse.
- Local audio playback, seeking and volume.
- Text, subtitle, color, font and PNG logo overlays.
- Manual captions and basic SRT/VTT text import.
- 9:16, 16:9 and 1:1 preview canvases.
- Real-time canvas recording using MediaRecorder; the browser's supported codec determines MP4 vs WebM.
- Browser-local autosave for editor settings (media files are not uploaded or persisted).
- Rights checklist reminder (not an automated copyright-detection service).

## Run
Open `index.html` in a modern browser. For best results, serve the folder from a local static web server (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

## Export limitations
- Export records in real time, approximately the length of the audio track.
- MP4 is used only if the browser reports a supported MP4 MediaRecorder codec; otherwise WebM is used. This is not a universal MP4 encoder.
- 1080p and frame rate depend on available device memory, browser support and performance. 4K/8K/16K are not promised in this foundation.
- The video recording path captures the canvas and audio track. Browser/device codec support varies.
- Fades are exposed as controls in this foundation; automated fade automation is not yet wired into the rendered audio output.

## Not included yet
Automatic speech recognition captions, robust beat-grid analysis and beat snapping, AI grading/background generation/thumbnails, project file import/export, multi-layer timeline, GPU acceleration, and advanced effects. These need dedicated implementation and/or optional models/services. Copyright risk is only a user checklist, not a copyright scan.

## Privacy
Media is handled in the browser and is not sent to a WaveForge server by this static application. Local browser storage contains editor settings only.
