# WaveForge — Music Visualizer Studio

A browser-based, local-first music visualizer editor. Version 1.0 foundation.

## Included in this starter
- Import a local audio track (browser-supported audio formats).
- Add a photo or video as the visual background.
- Live canvas visualizer: equalizer bars, waveform, circular spectrum and neon pulse.
- Local audio playback, seeking and volume.
- Text, subtitle, color, font and PNG logo overlays.
- On-device Whisper-based audio transcription into timed lyric lines (model downloads on first use).
- TikTok-style lyric/poetry templates, editable subtitle imports, and touch-drag text positioning.
- 9:16, 16:9 and 1:1 preview canvases.
- Real-time canvas recording using MediaRecorder; the browser's supported codec determines MP4 vs WebM.
- Browser-local autosave for editor settings (media files are not uploaded or persisted).
- Rights checklist reminder (not an automated copyright-detection service).

## Run
Open `index.html` in a modern browser. For best results, serve the folder from a local static web server (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

## Independent audio mixer (Phase 1)
- The mixer accepts additional local audio files as separate Voice, Ad-lib, Sound effect, Bass stem, Drums, Piano, Guitar, Instrumental or Other layers.
- Each added layer has independent volume, pitch/rate and start offset controls, plus mute/remove.
- Background music remains on its own gain path; changing a voice/effect layer's volume does not change the background music volume.
- Pitch shifting uses playback-rate changes and therefore also changes speed. This foundation mixes separately supplied stems; it does not split vocals/instruments out of one mixed song.
- Extra layers follow the main track timeline and are included in the mixed audio export stream. Real-device and exported-file verification is still required.

## Export limitations
- Export records in real time, approximately the length of the audio track.
- MP4 is used only if the browser reports a supported MP4 MediaRecorder codec; otherwise WebM is used. This is not a universal MP4 encoder.
- 1080p and frame rate depend on available device memory, browser support and performance. 4K/8K/16K are not promised in this foundation.
- The video recording path captures the canvas and audio track. Browser/device codec support varies.
- Fades are exposed as controls in this foundation; automated fade automation is not yet wired into the rendered audio output.

## Not included yet
Robust beat-grid analysis and beat snapping, AI grading/background generation/thumbnails, project file import/export, multi-layer timeline, GPU acceleration, and advanced effects. These need dedicated implementation and/or optional models/services. Copyright risk is only a user checklist, not a copyright scan.

## Automatic lyrics
- The app uses Transformers.js with an ONNX Whisper model downloaded from Hugging Face on first use; transcription runs in the browser/WebView and the selected audio is not uploaded to a WaveForge server.
- First model download requires an internet connection and can use significant storage, memory and processing time. The Tiny model is the faster option; Base may be slower.
- Speech recognition is not a guaranteed song-lyrics recognizer. Music, vocals, backing tracks, language, accents and audio quality can cause missing or incorrect words. Review and correct every lyric before publishing.
- Model files are cached by the browser when supported. If model download or WebAssembly execution is blocked by the device/browser, transcription will not run.

## Privacy
Media is handled in the browser and is not sent to a WaveForge server by this static application. Local browser storage contains editor settings only.
