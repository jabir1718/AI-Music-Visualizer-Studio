# WaveForge Studio — Implementation Status

This file is the delivery checklist for the 31 groups in `ROADMAP.md`. It is deliberately conservative: **Partial** means some working code exists, not that the complete request is finished. **Not started** means there is no verified implementation in the current source.

Last source audit: 2026-11-05 (after connecting image-search and OpenMoji imports to the native background, logo/artwork and text-decoration workflows).

## Status definitions
- **Partial** — working foundation exists, but one or more requested capabilities are missing or unverified.
- **Not started** — no working implementation verified in the current source.
- **Complete** — every acceptance item has been implemented and tested. No group is marked complete yet.

## 31-group delivery tracker

| # | Feature group | Current status | Verified source-level foundation / remaining work |
|---:|---|---|---|
| 1 | Lyrics, transcription and karaoke | Partial | Whisper transcription requests word-level timestamps and stores them per word for karaoke highlighting; manual word-sync can correct timing, and SRT/VTT import/editing is supported. Timestamp quality depends on Whisper output; forced alignment, robust transcription correction and singing-aware lyric recognition remain. |
| 2 | Fonts, typography and 3D text studio | Partial | Added a searchable 100-family 2D typography studio and true extruded Three.js 3D text with 8 selectable typeface variants, independent text/depth and material controls. The 3D font files load on demand; a broader 3D font catalogue and offline caching remain. |
| 3 | Advanced music visualizer | Partial | Four canvas visualizer modes, color/intensity/sensitivity controls and audio-energy reaction exist. Advanced 3D designs, true beat maps and broader object controls are missing. |
| 4 | Tempo, BPM and timing studio | Partial | Offline BPM estimation plus tap-tempo calculation now report tempo and rhythm consistency. Tapping while the song plays anchors a manual beat pulse grid to the song position; advanced beat-grid editing and automation remain. |
| 5 | Audio effects and processing | Partial | Main and mixer layers have independent EQ, pan, echo, reverb, distortion and dynamics compression. Optional SoundTouch pitch preservation separates semitone pitch from source speed; voice layers can also use LPC formant correction. Automation and advanced mastering remain. |
| 6 | YouTube video/effect workflow | Not started | No authorized YouTube provider integration or in-app clip workflow. |
| 7 | Green-screen and background removal | Partial | Solid-color chroma key remains available, and an optional on-device MediaPipe selfie-segmentation model now cuts out people in photos/videos. The model and library download on first use; it targets people, not arbitrary objects, and Android performance/edge quality need device testing. |
| 8 | PNG logo and artwork studio | Partial | PNG import and overlay exist. Full object transforms, masks, 3D depth, animation and beat sync remain. |
| 9 | Universal media import and audio extraction | Partial | Added a local video-to-audio extractor using Web Audio capture and audio-only MediaRecorder output, with progress/cancel, download, use-as-main-track and add-as-layer actions. Browser codec support, real video files and Android device playback need verification. More codecs and direct extraction fallback remain. |
| 10 | Voice changer and voice-style presets | Partial | Added Natural, Telephone, Radio, Monster, Chipmunk, Robot and Alien per-layer styles, independent pitch/speed and optional LPC formant-preserving pitch. A microphone recorder now creates separate Voice, Ad-lib, Humming, Harmony and Voice FX tracks. AI voice generation/person-specific cloning remain excluded. |
| 11 | Finger gestures, shapes and layer transforms | Partial | Canvas objects can be moved by touch and now have a visible selection outline with drag handles for scale and rotation. Shape masks, locking, duplication and full transform gizmos remain. |
| 12 | Direct canvas editing and selection | Partial | Native title, subtitle, current lyric and logo targets can be tapped/dragged; a DOM selection outline and touch resize/rotate handles open the object inspector. Hit areas are approximate; full visualizer/background selection and multi-select remain. |
| 13 | Studio navigation and panel layout | Partial | Nested Music Studio categories exist. Swipe navigation, movable/minimizable panels and full workspace navigation remain. |
| 14 | Advanced audio mixer and instrument studio | Partial | Separate layers support volume, mute, solo, independent pitch/speed, voice formant correction, pan, EQ, compression, echo, reverb, distortion, trim, loop, split, live recording and a draggable multitrack arrangement timeline. Waveform editing, automation and automatic stem separation remain. |
| 15 | Searchable PNG/artwork library | Partial | Added in-app image search through Wikimedia Commons with preview, source/licence note and direct import as background, logo, artwork placement or text-decoration placement. Google API option is present but requires an eligible Google Custom Search API project and Search Engine ID; new-customer availability is restricted. Artwork/text decoration currently reuse the app's single editable logo-image layer; a multi-image layer stack and curated local library remain. |
| 16 | Custom backgrounds, writing and lyrics | Partial | Local photo/video backgrounds, manual writing and audio transcription exist. Dedicated multi-layer text/art composition and template-to-layer workflows remain. |
| 17 | Smart template editing | Partial | Added a native editable canvas-object inspector for title, subtitle, lyric/caption and logo layers: per-object position, scale, rotation, opacity, visibility and text/color controls persist in projects and affect rendered/exported canvas. Flattened third-party template segmentation/OCR is still missing. |
| 18 | Curated 2,000+ artwork and symbol collection | Partial | Added a searchable 4,000+ OpenMoji symbol catalogue with SVG import into background, logo, artwork placement or text-decoration placement. The catalogue is fetched on demand and graphics are CC BY-SA 4.0; artwork/text decoration currently reuse the single editable logo-image layer, and a curated 2,000+ photo/artwork pack is still not bundled. |
| 19 | Voice character/effect studio | Partial | Added generic per-layer voice presets and optional LPC formant correction so pitch can change while retaining more natural vocal resonances. No generated character voice models or authorized real-person voice cloning are included. |
| 20 | Photo and video filters | Partial | Added 50 named canvas filter presets across Cinema, Vintage, Monochrome, Vibrant, Cool, Warm, Dreamy, Night, Analog and Editorial families. Filter strength is adjustable; selected filter and intensity persist in projects and are applied to imported photo/video backgrounds in preview and canvas export. This is color/blur processing, not AI retouching or upscaling; device performance and appearance need testing. |
| 21 | Vocal/instrument separation and noise removal | Partial | Added local spectral noise reduction for short audio clips using a user-selected noise-only sample; original media is preserved and cleaned WAV can be added as a new layer. AI vocal/instrument source separation and model-based denoising remain unimplemented. |
| 22 | Advanced sound-effects library | Partial | Added live Wikimedia Commons audio search with previews, source/licence metadata and direct import as mixer layers. A curated, bundled effects pack remains. |
| 23 | Searchable 5,000+ sound-effects collection | Partial | The open audio library can search and paginate Wikimedia Commons audio results; it is not a verified 5,000-file curated catalogue, and total matching results depend on the live index. |
| 24 | Clean racing-engine sound studio | Partial | Added an Engine sounds search workspace preset to find open engine/rev recordings; a curated clean racing-engine pack and licence-cleared isolated recordings remain. |
| 25 | Clean Joker-smile and character voice effects | Partial | Added a Character sounds search workspace for open laugh/character-style recordings; no branded Joker assets or generated character voice processor are included. |
| 26 | Realistic 3D scene, PNG and visualizer object studio | Partial | Added a Three.js WebGL studio with 10 primitive meshes, extruded 3D text with 8 typefaces, XYZ transforms, material/light controls, touch rotation, transparent 1024×1024 PNG export, and optional live 3D overlay composited into visualizer preview/video export. 3D overlay settings persist. Full scene graph/layers, imported 3D models and camera animation remain. |
| 27 | Video project, timeline, autosave and export studio | Partial | Portable .waveforge files, local autosave, a draggable visual multi-track audio timeline with playhead seeking and clip offsets, audio-layer trim/loop/split, per-object transform keyframes and bounded visual undo/redo are implemented. Undo excludes media/mixer-layer add/remove; full video clip compositing and crash recovery remain. |
| 28 | Visual effects, compositing, publishing aids and studio preferences | Partial | Added 50 canvas looks, chroma key, AI person cutout, master-track effects, animated native text/logo transforms and optional live Three.js object compositing into video export. Full multi-layer compositing and advanced VFX/publishing tools remain. |
| 29 | Dedicated post-import Music Studio and nested editing workflow | Partial | Dedicated nested Music Studio includes Vocal, Ad-lib, Humming, Harmony, Instruments, Sound Effects, Voice FX, AI Separation and Cleanup. Users can record separate vocal/ad-lib/humming/harmony takes; cleanup has local spectral noise reduction. AI separation and generated vocal processing remain unimplemented. |
| 30 | In-app Google image search and smart template editing | Partial | Added a Google Custom Search image API configuration option plus a working no-key Wikimedia Commons search/import fallback. Image results now have direct editor routing for background, logo, artwork and text-decoration placement; Google API eligibility/credentials are still external requirements, and flattened-template segmentation/OCR remains unimplemented. |
| 31 | Expanded voice characters and high-resolution filter pack | Partial | 50 canvas filter looks and the 100-family typography studio are implemented, with generic voice styles, independent pitch/speed and optional formant correction. AI voice models, true high-resolution source assets and 16K export are not included. |

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
- Mixer-layer pitch can use optional SoundTouch AudioWorklet processing to separate pitch from speed, with optional LPC formant correction for vocal timbre. This requires first-use internet access and AudioWorklet support; fallback rate-based pitch changes speed too.
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

- Added optional on-device AI person cutout using MediaPipe Selfie Segmentation. It loads only when enabled, processes photos/video locally, and falls back to the existing chroma-key/filter background path while the model loads or if unavailable. This is person segmentation, not arbitrary-object removal; internet is required for first-time model/library download and Android edge/performance testing remains.

- Added local spectral noise reduction in the Music Studio Cleanup workspace. The user supplies a short noise-only sample range; the app estimates a frequency profile, performs STFT spectral subtraction, and exports a new WAV layer without overwriting the source. Mobile guardrails cap input at 60 MB and two minutes. This is conventional DSP, not AI source separation or AI denoising; quiet speech/music may be affected and device performance needs testing.

- Added per-object transform keyframes for title, subtitle, lyrics and logo layers. Keyframes store position, scale, rotation and opacity against the main audio playhead, interpolate smoothly between keyframes, persist in editor/project settings and are included in visual undo/redo. This is transform animation for native objects, not a full video clip/keyframe compositing timeline.

- Added a searchable OpenMoji symbol library backed by the upstream 17.0.0 catalogue. The catalogue metadata is loaded on demand; only the selected SVG is imported as a logo layer. OpenMoji graphics are CC BY-SA 4.0, so attribution and ShareAlike terms apply. This provides symbols, not a bundled curated photo/artwork collection.

- Added optional SoundTouchJS AudioWorklet processing per mixer layer. It compensates for source playback-rate pitch changes so users can adjust semitone pitch and speed independently without affecting the background track. The module/worklet load from jsDelivr on first use; AudioWorklet support, internet access and Android device performance are required. Unsupported browsers retain standard rate-based pitch shifting.

- Added an on-demand Three.js 3D object studio. It creates real WebGL meshes (box, sphere, torus, torus knot, cone, cylinder, octahedron, dodecahedron, icosahedron and tetrahedron), supports XYZ positioning/rotation, scale, material and lighting controls, touch rotation, and exports a transparent 1024×1024 PNG logo. Three.js is MIT-licensed and loads from jsDelivr on first use; WebGL and internet access are required. This is a primitive object studio, not a full 3D scene editor or live 3D video compositor.

- Extended the 3D studio with extruded 3D text geometry, editable text and depth. It now offers eight selectable typeface variants from the Three.js examples package; the 100-family typography studio remains the separate 2D text workflow. The font and addon modules load on demand.

- Added optional LPC formant correction for voice mixer layers using `@soundtouchjs/formant-correction-worklet` (MPL-2.0). Voice, Ad-lib, Humming, Harmony and Voice FX layers default to full formant preservation when pitch-preserving mode is enabled; the formant slider blends corrected and uncorrected sound. This is DSP-based timbre preservation, not AI voice conversion or voice identity cloning.

- Added an optional live 3D overlay path: when the user enables “Include 3D object in video/export”, the transparent Three.js WebGL canvas is composited into the main visualizer canvas before text/lyrics/logo rendering, so canvas recording/export captures the 3D object. Overlay size and X/Y position are adjustable and saved with editor settings/projects. The 3D scene still must be loaded in the current session; this is not a full multi-object 3D scene graph.

- Added a visual multi-track audio arrangement timeline. It displays the main song and each imported mixer layer on separate lanes, supports horizontal zoom, playhead seeking, and drag-to-move clip start offsets. Clip trim/loop/split controls remain available in the layer inspector. This is an audio arrangement timeline, not a full video clip compositor; media-layer undo/redo is still excluded.

- Added independent Web Audio dynamics compression for the original background-music track and every imported mixer layer. Threshold, knee, ratio, attack and release respond to a single adjustable strength control; compressor routing remains active before optional pitch/formant processing, delay and reverb sends. Values persist in local editor settings and portable projects. CI uses mocked DynamicsCompressorNode tests; actual listening and Android performance still require device testing.

- Added editable beat-grid controls: users can set BPM, offset in seconds and pulse division (quarter, eighth, sixteenth or thirty-second notes). BPM detection now seeds and aligns the grid from the current playhead or track start; tap tempo can also seed the editable controls. Grid parameters persist with project settings and drive the visualizer pulse scheduler.

- Added local microphone recording inside the Vocal, Ad-lib, Humming, Harmony and Voice FX Music Studio workspaces. Takes are captured with MediaRecorder, previewed before adding, and inserted as independent mixer layers; the source song is not overwritten. Recordings are limited to 3 minutes / 30 MB and use a browser-supported audio MIME type. The Android build adds RECORD_AUDIO to the generated manifest. Real microphone permission prompts, codec support and recording quality still require physical Android device testing; this records the user's voice and does not generate AI vocals.


## Development checkpoint — 2026-11-05

- Connected the image-search result actions to a shared editor import bridge. A selected image can be applied as the background, used as the logo, placed as an artwork overlay, or placed alongside the title as a text-decoration overlay.
- Added the same four destinations to the on-demand OpenMoji picker. Selected SVG symbols can be imported as a background, logo, artwork overlay or text-decoration overlay.
- Artwork and text-decoration currently use the existing independently transformable logo-image object; they are not yet a multi-image layer stack. A later layer-stack implementation is needed to keep multiple artwork assets independently editable at the same time.
- Added scripts/test-asset-routing.js and included it in npm test. GitHub Actions run #204 passed JavaScript syntax validation, all npm tests and web-asset packaging; Android Gradle build was in progress at the time of this source update. APK artifact upload and physical-device testing must be confirmed separately.


## New roadmap requests — 2026-11-05 (planned, not implemented)

### 32. ChatGPT-powered editing assistant
- User requested an in-app ChatGPT-style assistant that can receive natural-language prompts and help edit the active music/video project.
- Scope is recorded in ROADMAP.md §32. No ChatGPT/API integration has been implemented or tested yet.
- Technical integration should use the OpenAI Responses API and explicitly allowed editor functions through a protected backend. OpenAI API keys must never be shipped in the APK, browser JavaScript or public repository. ChatGPT subscription access does not automatically include API usage; API billing is separate.
- Any proposed edit must be previewed as a structured plan and confirmed before changes are applied. Only actually implemented editor functions may be advertised as executable.

### 33. AI Auto Video Editor
- User requested social-media-style automatic video editing with music-beat cuts and multiple selectable styles.
- Scope is recorded in ROADMAP.md §33. No complete multi-clip AI video auto-editor has been implemented or tested yet.
- Existing BPM detection, beat grid and canvas recording/export are useful foundations, but the current product does not yet provide the complete editable multi-clip video timeline, scene-aware clip selection, automatic beat-cut arrangement, speech-pause editing or style-based montage generation.
- The future implementation must create a non-destructive editable draft, preserve source media, allow manual refinement, and be tested on real Android devices for memory and export reliability.

## Device-targeted free Auto Cut implementation — 2026-11-05

- Target device profile is Infinix ZERO 40 model family. The user's reported device identifier is X6860, corresponding to the ZERO 40 4G configuration; the implementation therefore uses conservative local storage and one-active-video-at-a-time playback rather than assuming the more powerful 5G chipset.
- Added `auto-video-editor.js` and an in-app Auto Cut Studio panel. It imports up to 8 local video sources, each up to 120 MB and 180 seconds, with a combined video-source limit of 180 MB to reduce storage and portable-project risks.
- Added offline cut planning from the existing BPM value (or a clearly disclosed 120 BPM starting grid when no BPM has been detected), with fast social, cinematic, travel, vlog and calm presets and a cut-intensity control.
- Generated montage segments are non-destructive references to the original local videos. Users can reorder, shorten or remove individual segments. The current preview/export canvas follows the main music playhead and switches the active video source; source files are not overwritten.
- Video files are stored locally in the existing IndexedDB media store. Auto-video source and segment metadata are included in local editor settings and portable .waveforge project packaging.
- Automated tests are being added for imports, beat-cut planning, playback mapping and manual segment edits. The APK build and physical Infinix device behavior must be confirmed separately.
- **Not yet implemented:** scene-change detection, speech-pause cuts, AI-generated captions, crossfade/transition library, speed ramps, zoom/motion effects, multi-layer video compositing, cloud AI, and device-verified export codec/resolution. This first Auto Cut implementation makes direct cuts only; do not advertise the remaining items as available.

## Free offline editing helper — 2026-11-05

- Added a local Quick Edit Assistant that parses a small, explicitly supported command set for visualizer style/color, output ratio, title/subtitle, music bass/treble/volume/pitch, lyric size, Auto Cut style and cut intensity.
- Every request is previewed before applying. Unsupported requests are not guessed or executed. All processing stays on the device; there is no ChatGPT connection, API key, cloud upload or usage charge.
- This is a deterministic rules-based helper, **not ChatGPT and not a general AI editor**. Broader natural-language understanding and advanced edit actions remain unimplemented.
- Added parser regression tests; final CI confirmation and physical-device UI testing remain pending.
