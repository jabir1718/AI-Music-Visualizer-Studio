# WaveForge Studio — Implementation Status

This file is the delivery checklist for the 31 groups in `ROADMAP.md`. It is deliberately conservative: **Partial** means some working code exists, not that the complete request is finished. **Not started** means there is no verified implementation in the current source.

Last source audit: 2026-11-04 (after editable object layers, image import, 50 filters, master-track effects, video audio extraction, word-sync karaoke, tap tempo and chroma key).

## Status definitions
- **Partial** — working foundation exists, but one or more requested capabilities are missing or unverified.
- **Not started** — no working implementation verified in the current source.
- **Complete** — every acceptance item has been implemented and tested. No group is marked complete yet.

## 31-group delivery tracker

| # | Feature group | Current status | Verified source-level foundation / remaining work |
|---:|---|---|---|
| 1 | Lyrics, transcription and karaoke | Partial | Whisper timed-line transcription, manual lyrics, SRT/VTT import/editing and a manual word-sync workflow now let users mark each word's start during playback; karaoke highlighting uses saved word timings. Automatic word-level alignment and robust transcription correction remain. |
| 2 | Fonts, typography and 3D text studio | Partial | Added a searchable 100-family typography studio with independent title/subtitle/lyrics font family, weight, scale, spacing, outline, glow and canvas extrusion-depth controls. Google Fonts load on demand; offline fallback remains. This is layered 2D canvas extrusion, not volumetric 3D text. |
| 3 | Advanced music visualizer | Partial | Four canvas visualizer modes, color/intensity/sensitivity controls and audio-energy reaction exist. Advanced 3D designs, true beat maps and broader object controls are missing. |
| 4 | Tempo, BPM and timing studio | Partial | Offline BPM estimation plus tap-tempo calculation now report tempo and rhythm consistency. Tapping while the song plays anchors a manual beat pulse grid to the song position; advanced beat-grid editing and automation remain. |
| 5 | Audio effects and processing | Partial | Original background track now has independent bass/treble EQ, stereo pan, echo feedback, convolution reverb and WaveShaper distortion; imported mixer layers retain their own EQ/pan/echo/reverb and six presets. Automation and independent pitch-preserving DSP remain. |
| 6 | YouTube video/effect workflow | Not started | No authorized YouTube provider integration or in-app clip workflow. |
| 7 | Green-screen and background removal | Partial | Added adjustable local chroma key for photo/video backgrounds: key color, tolerance, edge softness and green-spill reduction. It processes a reduced working canvas to limit mobile load; fine-edge AI segmentation and real-device performance checks remain. |
| 8 | PNG logo and artwork studio | Partial | PNG import and overlay exist. Full object transforms, masks, 3D depth, animation and beat sync remain. |
| 9 | Universal media import and audio extraction | Partial | Added a local video-to-audio extractor using Web Audio capture and audio-only MediaRecorder output, with progress/cancel, download, use-as-main-track and add-as-layer actions. Browser codec support, real video files and Android device playback need verification. More codecs and direct extraction fallback remain. |
| 10 | Voice changer and voice-style presets | Partial | Added per-mixer-layer Natural, Telephone, Radio, Monster, Chipmunk, Robot and Alien styles using independent EQ, echo, reverb and Waveshaper distortion. Monster/chipmunk styles use playback-rate changes and therefore also change speed; formant-preserving voice conversion and AI voice models remain missing. |
| 11 | Finger gestures, shapes and layer transforms | Partial | Canvas objects can be moved by touch and now have a visible selection outline with drag handles for scale and rotation. Shape masks, locking, duplication and full transform gizmos remain. |
| 12 | Direct canvas editing and selection | Partial | Native title, subtitle, current lyric and logo targets can be tapped/dragged; a DOM selection outline and touch resize/rotate handles open the object inspector. Hit areas are approximate; full visualizer/background selection and multi-select remain. |
| 13 | Studio navigation and panel layout | Partial | Nested Music Studio categories exist. Swipe navigation, movable/minimizable panels and full workspace navigation remain. |
| 14 | Advanced audio mixer and instrument studio | Partial | Separate imported layers support volume, mute, solo, rate/pitch, pan, EQ, echo, reverb, independent distortion and generic character styles. Layer clips now support in/out trimming, loop and split-at-playhead. Pitch shifting still changes speed; waveform editing, automation and automatic stem separation remain. |
| 15 | Searchable PNG/artwork library | Partial | Added in-app image search through Wikimedia Commons with preview, source/licence note and direct import as background or logo. Google API option is present but needs user-owned API key and Search Engine ID; curated local library remains. |
| 16 | Custom backgrounds, writing and lyrics | Partial | Local photo/video backgrounds, manual writing and audio transcription exist. Dedicated multi-layer text/art composition and template-to-layer workflows remain. |
| 17 | Smart template editing | Partial | Added a native editable canvas-object inspector for title, subtitle, lyric/caption and logo layers: per-object position, scale, rotation, opacity, visibility and text/color controls persist in projects and affect rendered/exported canvas. Flattened third-party template segmentation/OCR is still missing. |
| 18 | Decorative artwork, skulls, symbols and emoji collection | Not started | No curated 2,000+ asset library. |
| 19 | Voice character/effect studio | Partial | Added generic per-layer Natural, Telephone, Radio, Monster, Chipmunk, Robot and Alien processing presets. No generated character voice model, formant-preserving transformation or authorized real-person voice cloning is included. |
| 20 | Photo and video filters | Partial | Added 50 named canvas filter presets across Cinema, Vintage, Monochrome, Vibrant, Cool, Warm, Dreamy, Night, Analog and Editorial families. Filter strength is adjustable; selected filter and intensity persist in projects and are applied to imported photo/video backgrounds in preview and canvas export. This is color/blur processing, not AI retouching or upscaling; device performance and appearance need testing. |
| 21 | Vocal/instrument separation and noise removal | Not started | No verified AI source-separation or noise-removal engine. |
| 22 | Advanced sound-effects library | Partial | Added live Wikimedia Commons audio search with previews, source/licence metadata and direct import as mixer layers. A curated, bundled effects pack remains. |
| 23 | Searchable 5,000+ sound-effects collection | Partial | The open audio library can search and paginate Wikimedia Commons audio results; it is not a verified 5,000-file curated catalogue, and total matching results depend on the live index. |
| 24 | Clean racing-engine sound studio | Partial | Added an Engine sounds search workspace preset to find open engine/rev recordings; a curated clean racing-engine pack and licence-cleared isolated recordings remain. |
| 25 | Clean Joker-smile and character voice effects | Partial | Added a Character sounds search workspace for open laugh/character-style recordings; no branded Joker assets or generated character voice processor are included. |
| 26 | Realistic 3D scene, PNG and visualizer object studio | Partial | Editable 2D object transforms and canvas typography extrusion provide limited depth-style composition. A real 3D scene graph, volumetric model renderer, camera/light controls, XYZ movement and tracking are still missing. |
| 27 | Video project, timeline, autosave and export studio | Partial | Portable .waveforge files, local autosave, audio-layer offsets, clip trim/loop/split and bounded undo/redo for visual/editor settings are implemented. Undo history currently excludes media and mixer-layer add/remove actions; a full visual multi-track video timeline and crash recovery remain. |
| 28 | Visual effects, compositing, publishing aids and studio preferences | Partial | Added 50 canvas photo/video looks, adjustable chroma key and independent main-track audio effects; complete compositing, keyframes, advanced VFX and publishing tools remain. |
| 29 | Dedicated post-import Music Studio and nested editing workflow | Partial | A dedicated nested Music Studio area has Vocal, Ad-lib, Humming, Harmony, Instruments, Sound Effects, Voice FX, AI Separation and Cleanup categories. Some categories are import-only; generated processing and AI operations are not implemented. |
| 30 | In-app Google image search and smart template editing | Partial | Added a Google Custom Search image API configuration option plus a working no-key Wikimedia Commons search/import fallback. Google credentials are not supplied; flattened-template segmentation/OCR remains unimplemented. |
| 31 | Expanded voice characters and high-resolution filter pack | Partial | 50 canvas filter looks and the 100-family typography studio are implemented, with generic voice styles on mixer layers. AI voice models, true high-resolution source assets and 16K export are not included. |

## Current development checkpoint — 2026-11-04

- Added nested Music Studio category navigation in `app.js` and styling in `style.css`.
- Added independent per-layer Web Audio processing nodes for stereo pan, low/high shelf EQ, echo and convolution reverb in `audio-engine.js`.
- Added per-layer Solo/Mute and controls for volume, pitch/rate, start offset, pan, bass, treble, echo and reverb. Solo now routes the main background track through a dedicated mute gain node so it is actually silenced while a layer is soloed.
- Added local IndexedDB storage for the main audio file and added mixer layers; editor metadata is saved in localStorage. Restoration depends on the same browser profile retaining its site data and available storage quota.
- Fixed a missing main solo-gain node initialization that would have broken AudioContext setup, and normalized the HTML audio element volume to prevent double attenuation by the Web Audio master gain.
- Lyric text edits now preserve existing line timing and discard stale per-word timing for changed text; edited lines sync back to the manual lyrics field. Lyric position now persists.
- Hardened video export validation, recorder startup errors, empty-output detection and stream cleanup.
- Added a Node-based mocked AudioEngine regression test to the APK workflow (`npm test`); it checks master/solo routing, volume, layer EQ/pan/effects and removal.
- JavaScript syntax checks are run for `app.js`, `audio-engine.js`, `lyrics-engine.js` and `export.js`; the Android workflow now also runs `npm test` before building. A mocked Web Audio test is source-level verification only, not real playback.
- These are source-level checks, not Android device tests. The latest APK workflow must finish and publish its artifact before this checkpoint can be called build-verified.


- Added a portable `.waveforge` project-file workflow in `project-file.js`: exports editor settings plus the main audio and stored mixer-layer blobs from IndexedDB; imports validate the project format/version and media records, enforce a 250 MB unpacked-media limit, confirm before replacing saved media/settings, then reload the editor to restore the project.
- Added Save project / Open project controls to the export inspector and included `project-file.js` in the Android workflow's JavaScript syntax validation. This project-file feature is source-implemented but awaits CI and real-browser/device testing; browser storage quota and Android WebView file handling remain device-dependent.

- Added six per-layer audio effect presets in the mixer. Choosing Clean, Telephone, Radio, Small room, Echo or Dreamy immediately applies the preset's EQ, pan, delay and reverb values to that imported track and saves the selection.
- Added a native editable object inspector in the Text & Logo workspace. Select title, subtitle, lyrics/captions or logo; change each object's position, scale, rotation, opacity and visibility independently. Title/subtitle text and color are editable in the selected-object panel. Object settings are saved with editor settings and `.waveforge` projects and are applied to the canvas renderer used by preview/export. Uploaded logos and background media are now also stored in IndexedDB and included in portable project files. This supports app-native layers, not automatic separation of flattened downloaded artwork. Device interaction still needs testing.\n- Fixed downloaded image filename extensions so imported JPEG/WebP/GIF/SVG/PNG files retain a matching extension instead of being mislabeled as PNG.\n- Added an offline BPM analyser in `bpm-engine.js`; it decodes the imported audio, analyses its energy-onset envelope and estimates tempo. Music Studio exposes a Detect BPM action with an approximate result and rhythm-confidence indicator. This is not a guaranteed beat grid and needs device testing. The new engine is included in CI syntax checks.
- Added 50 named canvas photo/video filters with search, filter selection, adjustable strength and reset. They render onto imported photo/video backgrounds before visualizer overlays, so canvas recording includes the selected look. Filter settings are saved with `.waveforge` projects. A Node regression test checks catalogue size, unique names, numeric parameters, canvas application and state isolation.

## Important accuracy rules

- A roadmap entry or a UI category is not proof that the feature works.
- Pitch currently uses playback-rate shifting, so it changes speed too. Independent pitch-preserving DSP is still outstanding.
- A mixed MP3 does not contain separately editable vocal/instrument stems. Separation needs a real model/engine.
- “16K” must only be offered when source media, renderer, memory, GPU and encoder genuinely support it. Upscaling must be labelled as upscaling.
- Google image results cannot all be fetched; use authorized provider access and respect source terms/licensing.
- Keep every unimplemented item visible in this tracker until implementation and tests support changing its status.

- Added a dedicated background-music effect chain in `audio-engine.js`: independent bass/treble shelving EQ, stereo pan, echo feedback, convolution reverb and a controllable WaveShaper distortion node. Controls are in the Music Studio and do not alter imported mixer layers. Values persist in local settings and portable project files. Mocked Web Audio tests verify each effect node and setter; device sound quality still needs listening tests.

- Added a local video-to-audio extraction tool in `video-audio-extractor.js`. It captures the video's audio through Web Audio and MediaRecorder, shows extraction progress, supports cancellation, and offers the resulting audio as the main track, a mixer layer or a download. It runs in real time and is limited to 500 MB / 60 minutes; audio-only WebM/Opus or Ogg availability depends on the device browser. CI tests cover codec selection, file validation and output naming; actual device extraction still needs testing.

- Added manual word-by-word karaoke timing. Each lyric row has a Sync words action; play the song and tap Mark word at each word's start, undo a mark if needed, then finish. Per-word start/end values are saved with lyrics and `.waveforge` projects and drive the active-word karaoke highlight during playback/export. This is user-tapped timing, not automatic forced alignment.

- Added tap tempo to Music Studio. Three or more taps estimate BPM and consistency; tapping while the song is playing anchors a beat pulse grid to that song position. Manual tempo and grid offset persist with editor settings and portable projects. Automated tests cover steady 120 BPM taps and insufficient samples.

- Added a local chroma-key processor in `chroma-key.js` for imported photo/video backgrounds. Users can enable removal, pick a key color, adjust tolerance/edge softness and reduce color spill. The image is processed on a 540 px maximum working canvas before compositing so transparent pixels reveal the stage background; this is chroma keying, not AI segmentation. Node tests verify transparent key pixels, preserved foreground pixels, soft edges and spill reduction. Device performance/edge quality still need testing.

- Added a searchable open audio library in `sound-library.js` inside the Sound Effects, Engine Sounds and Character Sounds Music Studio workspaces. It searches and paginates Wikimedia Commons audio files, previews results, displays source/licence metadata and imports files as independent mixer layers. Files over 25 MB are excluded. This is a live external index, not a bundled or verified 5,000-file catalogue; source licences and clean recording quality must be checked. CI tests cover MIME filtering, search URL construction and licence metadata.


- Added a searchable 100-family typography studio with independent title, subtitle and lyric styles: family, weight, scale, letter spacing, outline, glow, and layered canvas extrusion depth. Styles persist in editor settings and portable .waveforge projects. Google Fonts are fetched only when selected; offline/system fallback is retained. The extrusion is a 2D canvas effect, not a volumetric 3D mesh.
- Added a direct canvas selection outline with touch resize and rotate handles for native title, subtitle, current lyric and logo layers. The inspector continues to expose numeric position/scale/rotation controls. Selection bounds are approximate; background/visualizer selection and multi-select remain.
- Added generic voice-character effects per imported mixer layer: Natural, Telephone, Radio, Monster/deep, Chipmunk/high, Robot and Alien. Each layer has an independent Waveshaper distortion node, EQ, echo, reverb and rate controls. Pitch-rate styles also change playback speed; this is not formant-preserving voice conversion.
- Added timeline clip in/out trimming, looping and split-at-playhead for independent mixer layers. Clip timing/trim settings persist in local editor settings and portable .waveforge projects. This is a practical audio-layer timeline foundation, not the full multi-track video timeline requested.

- Added bounded, debounced undo/redo history for text, captions/lyrics, object positions/transforms, typography, visual filters, chroma-key settings and master audio controls. History is capped at 50 snapshots and is saved only in memory during the editing session. Imported media and mixer-layer add/remove are deliberately excluded until their asset lifecycle can be restored safely.
