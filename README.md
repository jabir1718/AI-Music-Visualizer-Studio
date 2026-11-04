# WaveForge — Music Visualizer Studio

A browser-based, local-first music visualizer editor. Version 1.0 foundation.

## Included in this starter
- Import a local audio track (browser-supported audio formats).
- Add a photo or video as the visual background, then optionally remove a solid-color green/blue screen with adjustable tolerance, edge softness and spill reduction.
- Extract audio from a local video in real time, then use the extracted audio as the main track or an independent mixer layer, or download it.
- Live canvas visualizer: equalizer bars, waveform, circular spectrum and neon pulse.
- 50 adjustable photo/video color filters across cinema, vintage, monochrome, vibrant, cool, warm, dreamy, night, analog and editorial looks; filters are included in canvas export.
- Local audio playback, seeking and volume.
- Text, subtitle, color, font and PNG logo overlays.
- On-device Whisper-based audio transcription into timed lyric lines (model downloads on first use).
- Manual word-by-word karaoke timing: tap each word start during playback, then save the word-level highlight timings.
- TikTok-style lyric/poetry templates, editable subtitle imports, and touch-drag text positioning.
- 9:16, 16:9 and 1:1 preview canvases.
- Real-time canvas recording using MediaRecorder; the browser's supported codec determines MP4 vs WebM.
- Browser-local autosave for editor settings and imported audio assets using IndexedDB (subject to browser storage quota and user-cleared site data).
- Rights checklist reminder (not an automated copyright-detection service).

## Run
Open `index.html` in a modern browser. For best results, serve the folder from a local static web server (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

## Independent audio mixer (Phase 1)
- The mixer accepts additional local audio files as separate Voice, Ad-lib, Sound effect, Bass stem, Drums, Piano, Guitar, Instrumental or Other layers.
- Each added layer has independent volume, pitch/rate, start offset, stereo pan, bass/treble EQ, echo and reverb controls, plus mute, solo and remove.
- The original background music also has its own bass/treble EQ, stereo pan, echo, convolution reverb and distortion controls. These effects are separate from imported mixer layers and are included in the audio/video export path.
- Search Wikimedia Commons audio from the Sound Effects, Engine Sounds and Character Sounds Music Studio workspaces, preview results, review licence/source metadata and import them as independent mixer layers.
- BPM can be estimated offline from the audio or calculated from manual taps. Tapping while playback is running anchors a beat pulse grid to the current song position.
- Mixer settings and imported audio files are restored from local browser storage on the same browser installation when IndexedDB data remains available.
- Background music remains on its own gain path; changing a voice/effect layer's volume or per-layer effects does not change the background music path. Soloing a mixer layer also mutes the original background track, then restores it when Solo is turned off.
- Pitch shifting currently uses playback-rate changes and therefore also changes speed; independent pitch-preserving DSP is not implemented yet. This foundation mixes separately supplied stems; it does not split vocals/instruments out of one mixed song.
- Extra layers follow the main track timeline and are included in the mixed audio export stream. Real-device and exported-file verification is still required.

## Export limitations
- Export records in real time, approximately the length of the audio track.
- MP4 is used only if the browser reports a supported MP4 MediaRecorder codec; otherwise WebM is used. This is not a universal MP4 encoder.
- 1080p and frame rate depend on available device memory, browser support and performance. 4K/8K/16K are not promised in this foundation.
- The video recording path captures the canvas and audio track. Browser/device codec support varies.
- Main-track fade-in and fade-out controls are applied to the master audio gain during playback/export. More advanced automation curves are not included.

## Not included yet
AI vocal/instrument separation, generated humming/ad-libs, a full voice-character model suite, independent pitch-preserving DSP, a multi-track visual timeline, full 3D scene editing, AI background segmentation beyond solid-color chroma key, Google Images API credentials/provider access, a licensed 2,000+ artwork library, YouTube-authorized media integration, sound-effect catalogues, GPU acceleration and 4K/8K/16K export. These need dedicated implementation and/or optional models/services. Copyright risk is only a user checklist, not a copyright scan.

## Automatic lyrics
- The app uses Transformers.js with an ONNX Whisper model downloaded from Hugging Face on first use; transcription runs in the browser/WebView and the selected audio is not uploaded to a WaveForge server.
- First model download requires an internet connection and can use significant storage, memory and processing time. The Tiny model is the faster option; Base may be slower.
- Speech recognition is not a guaranteed song-lyrics recognizer. Music, vocals, backing tracks, language, accents and audio quality can cause missing or incorrect words. Review and correct every lyric before publishing.
- Model files are cached by the browser when supported. If model download or WebAssembly execution is blocked by the device/browser, transcription will not run.

## Privacy
Media is handled in the browser and is not sent to a WaveForge server by this static application. Local browser storage contains editor settings and user-selected audio assets for project restoration. Data may be removed by clearing site data or by browser storage management.
