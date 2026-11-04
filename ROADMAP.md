# WaveForge Studio — Complete Future Features Roadmap

**Status:** Planning / staged development. This document records all future feature requests gathered so far. A feature appearing here does not mean it is already implemented, tested, licensed, or available in the current APK.

**Core rule:** Preserve the existing working Version 1.0 foundation. Build in small releases, verify each release, and do not remove or silently change existing behavior. Keep main background music, voice effects, vocal stems, instruments and sound effects on separately controllable audio paths wherever the source media allows it.

---

## 1. Lyrics, transcription and karaoke
- Import a music/audio track and request automatic speech/lyric transcription.
- Display lyrics over the visualizer/video background.
- Word-by-word karaoke highlighting synchronized to audio timing.
- Manual lyric text editing.
- Adjust line and word timing; correct transcription mistakes.
- Import subtitle files in SRT and VTT formats.
- Save and restore lyrics/timing for the same track or project.
- Multiple lyric and poetry templates, including trend/TikTok-like, karaoke, poetry, minimal and neon looks.
- Allow lyric text over custom backgrounds and downloaded templates.
- Keep transcription confidence/limitations clear: singing, music, effects, accents and noisy mixes can reduce recognition accuracy.

## 2. Fonts, typography and 3D text studio
- Long-term target of 100+ font and typography styles.
- 3D text/font looks, depth, extrusion-like appearance, shadows, glow, neon and animated text.
- Dedicated typography/style picker button with further options after opening.
- Independent size, color, spacing, alignment, rotation and position controls.
- Apply styles to lyrics, poetry, headings, titles, subtitles and other text layers.
- Allow different styles on different text objects without changing all text together.

## 3. Advanced music visualizer
- Multiple advanced and 3D visualizer designs and animation styles.
- Music-reactive motion and beat/BPM synchronization.
- Controls for visualizer shape, size, color, intensity and sensitivity.
- Individual visualizer style selection and detailed options.
- Combine visualizers with backgrounds, logos, text and decorative elements.
- Keep the visualizer responsive while other editing controls are used.

## 4. Tempo, BPM and timing studio
- Automatic BPM/tempo detection where possible.
- Manual BPM entry and adjustment.
- Slow/fast tempo controls.
- Beat grid and beat synchronization for visualizers, text, effects and animations.
- Timing controls for individual audio layers and sound effects.
- Keep timing offsets independent per layer.

## 5. Audio effects and processing
- Effects such as echo, reverb, delay, distortion, filters and equalizer.
- Bass, treble, stereo and other tone controls.
- Multiple effect layers and effect chains where supported.
- Independent effect volume/intensity and timing.
- Fade-in/fade-out and automation controls.
- Apply effects to selected voice, music, instrument or sound-effect layers rather than unintentionally affecting every layer.
- Presets that can be saved and reused.

## 6. YouTube video/effect workflow
- A place to enter a YouTube link and choose a video or permitted effect source.
- Where permitted, select/crop/trim a segment for use with a music/video project.
- Synchronize selected media with audio and other layers.
- Support multiple visual/media layers.
- **Restriction:** Do not promise unrestricted YouTube downloading or bypass platform restrictions. Use official/authorized access and respect copyright, licensing and platform terms. Provide local file import as an alternative when appropriate.

## 7. Green-screen and background removal
- Green-screen/chroma-key removal for supported video or image content.
- Replace the removed background with a chosen image/video.
- Controls for key color, threshold, edge cleanup, spill suppression and intensity where technically supported.
- Crop, position, scale and adjust the replacement background.
- Keep original media available for restore/reset.

## 8. PNG logo and artwork studio
- Import transparent PNG files from the device gallery/file picker.
- Move, resize, rotate, crop, mask and reshape logo/art layers.
- 3D-style depth, glow and animation effects.
- Synchronize logo animation with music/beat where possible.
- Independent position, size, opacity and effect controls.
- Use a logo as an overlay with the visualizer and background.

## 9. Universal media import and audio extraction
- Import MP3 and other supported audio files from gallery or file manager.
- Import supported WAV and other browser/device-decodable formats.
- Import local video and extract its audio where supported.
- Option to use the original video as a visual background.
- One clear import flow and support for multiple audio layers.
- Report unsupported formats instead of pretending they imported successfully.
- Respect Android/WebView file-picker, memory, codec and file-size limits.

## 10. Voice changer and voice-style presets
- Generic voice-style presets such as masculine/feminine-sounding, youthful, mature and older-sounding styles.
- Character-like and creative voice effects.
- Independent pitch up/down, volume, speed and effect controls for each selected voice layer.
- Separate main vocals, background vocals and ad-libs when separate tracks/stems are available.
- Voice presets are sound-style effects, not guarantees of a person's actual age, gender or identity.
- Do not clone or imitate a real person's identifiable voice without appropriate authorization.

## 11. Finger gestures, shapes and layer transforms
- Use touch/finger gestures to move, resize and rotate selected objects.
- Shape masks such as circle, square, rectangle and custom shapes where supported.
- Independent positioning and editing of each element.
- Lock, hide/show, duplicate and delete layers.
- Avoid gestures that accidentally trigger unrelated controls.

## 12. Direct canvas editing and selection
- Tap an on-screen object to select it and open its own edit controls.
- Tap text to open the text editor.
- Tap the visualizer to open visualizer controls.
- Tap a logo to open logo editing.
- Tap the background to open background controls.
- Drag, resize and rotate selected objects.
- Show a selection outline/bounding box and contextual options.
- Future multi-select and group editing.
- Keep selection and editing behavior clear on touch screens.

## 13. Studio navigation and panel layout
- A separate main button for each major feature; tapping it opens that feature's own detailed options.
- Keep the main preview canvas central, with useful corner shortcuts.
- Provide finger swipe up/down navigation for additional controls or feature panels.
- Panels should be movable, minimized and closable where appropriate.
- Prefer fast menu opening and avoid unnecessary loading screens.
- Load large AI models, heavy effects and large asset packs only when needed.
- Keep the interface clean and uncluttered; do not cram every control onto the main screen.
- Use clear progress/error feedback for operations that genuinely take time.

## 14. Advanced audio mixer and instrument studio
- Multi-track mixer with independent layers for:
  - Main vocals.
  - Background music.
  - Bass.
  - Drums.
  - Piano.
  - Guitar.
  - Other instruments.
  - Background vocals.
  - Ad-libs.
  - Joker/character voice effects.
  - Added sound effects and other imported audio.
- Each layer should have its own volume control.
- Per-layer pitch, speed/rate, start offset/timing, mute/solo and effects where supported.
- Bass boost/deep bass, bass reduction, EQ, treble and stereo controls.
- Separate vocal and instrumental stems where available.
- Multiple voice tracks and ad-libs.
- Save and reuse mixer/effect presets.
- **Critical isolation rule:** changing a voice pitch or volume must not unintentionally change background music. This requires separate audio tracks/stems and separate processing paths.
- A single mixed MP3 does not contain independently accessible vocal, bass, drum, piano or guitar tracks. AI stem separation is a separate feature and may have artifacts or imperfect results.

## 15. Searchable PNG/artwork library
- Search for PNG artwork and graphics from inside the app.
- Select a result and import it into the project when the source permits it.
- Transparent PNG support.
- Use artwork as a background, logo, overlay, visualizer decoration or text companion.
- Crop, mask, resize, rotate and position imported artwork.
- User's requested high-resolution/“16K” target where a genuine source file exists at that resolution.
- Do not describe an upscaled image as genuine 16K source detail.
- Use permitted sources/APIs and respect licensing, hotlinking and download restrictions; a Google Images result does not automatically grant reuse rights.

## 16. Custom backgrounds, writing and lyrics
- Add user's own background music.
- Manually type or paste their own writing, poetry, captions or lyrics.
- Generate/transcribe lyrics from selected audio when possible.
- Use downloaded templates as backgrounds.
- Keep text, lyrics, poetry, headings, artwork, logo and music as independently editable layers.
- Offer automatic text placement/area suggestions for generated lyrics.
- Let the user manually choose the area for their own writing.
- Preserve original text and allow repositioning and styling.

## 17. Smart template editing
- Open a downloaded template in a preview before applying it.
- Where technically possible, identify template regions/elements that can be edited.
- List detected editable elements such as headings, subheadings, lyrics, logo, artwork and music.
- Tap an element to open the correct editor.
- Preserve the original template and provide a safe duplicate/copy for editing.
- Clearly mark elements that are flattened into a single image/video and cannot be individually edited.
- Avoid indefinite loading; provide progress, cancel and fallback behavior.

## 18. Decorative artwork, skulls, symbols and emoji collection
- Long-term target of 2,000+ different decorative elements, including skull designs, symbols, masks, emoji-style artwork and other decorations.
- Search and category browsing.
- Use elements in backgrounds, text compositions, logos and visualizer scenes.
- Position, size, rotate, reshape, mask and animate individual elements.
- Aim for high-quality 3D-style assets where available; do not claim every emoji or symbol is a custom 3D model.
- Manage asset size, caching, licensing and device performance.

## 19. Voice character/effect studio
- Dedicated library of generic character-like voice effects and creative vocal presets.
- Female-/male-sounding, youthful, mature/older-sounding and other stylized presets.
- Independent pitch up/down for each selected voice/effect.
- Separate volume, speed, echo, reverb and other supported processing.
- Allow multiple voice/effect layers.
- Avoid unauthorized imitation or cloning of real people's voices.

## 20. Photo and video filters
- Long-term target of 50+ photo/video filter presets.
- Apply supported filters to photos, videos and backgrounds.
- Example styles: cinematic, black-and-white, vintage, neon and cyberpunk.
- Brightness, contrast, saturation, sharpness, blur and color-grading controls.
- Skin-tone and cinematic looks where appropriate.
- Filter intensity slider and restore-original option.
- Video processing performance and export quality depend on device, source resolution, frame rate and available codecs.

## 21. Vocal/instrument separation and noise removal
- Extract vocals from a song where supported.
- Create an instrumental/background-music version where supported.
- Voice isolation and background-noise reduction.
- Separate instruments into stems where the chosen model supports them.
- Edit/export available stems individually.
- Keep separated stems as independent mixer layers.
- AI processing may require model downloads, substantial memory/CPU/GPU resources and time. Results can contain artifacts; no perfect separation or absolute silence guarantee.

## 22. Advanced sound-effects library
- Broad sound-effect categories, including:
  - Supercars and world-class cars: engine start, idle, revving, turbo, acceleration, gear shifts, racing exhaust and pass-by.
  - Animals: lion, tiger, wolf, bear, birds, insects, domestic animals and wild animals.
  - Sirens, emergency alerts, warnings, alarms and fire alarms.
  - Mechanical effects, reload sounds and other mechanical actions.
  - Heartbeat, clock ticking and breathing.
  - Nature: thunder, rain, wind and ambient environments.
- Target at least 1,000+ varied sound-effect types as an initial curated breadth within the larger library target.
- Special car/racing effects should be clean, isolated engine/race sounds without unrelated background music, crowd noise or recording noise where clean source recordings are available.
- Preview effects before adding them.
- Each effect should be an independent layer with volume, pitch/rate, timing and supported effect controls.
- Respect rights and licensing for every sound.

## 23. Searchable 5,000+ sound-effects collection
- Long-term target of 5,000+ total searchable sound effects inside the app.
- Search by sound name and useful tags/keywords.
- Categories and filters for cars, engines, animals, sirens, alarms, mechanical sounds, reloads, heartbeat, clocks, breathing, nature and more.
- Preview before adding.
- Favorites and recently used list.
- Import the user's own permitted sound files.
- One-tap add to the current project.
- Multiple effects can play together.
- Independent volume, pitch/rate, timing and effect controls per sound.
- Use licensed, public-domain or user-authorized assets. Plan for metadata indexing, storage/download management, caching and offline availability where licensing allows.
- The 1,000+ variety goal in item 22 is part of this overall 5,000+ library ambition, not a separate promise that 6,000+ assets already exist.

## 24. Clean racing-engine sound studio
- Dedicated racing-engine collection across different car brands and engine types, where legally licensed recordings are available.
- Race-focused engine start, revving, acceleration, gear shifting, turbo and exhaust sounds.
- Prefer clean isolated engine recordings with no music, commentary or unrelated background noise.
- Multiple engine layers and comparison/selection.
- Independent pitch, volume, speed/rate, timing and supported effects.
- Noise reduction may improve imperfect recordings but cannot guarantee removal of every unwanted sound.
- Do not imply endorsement or official affiliation with any car manufacturer.

## 25. Clean Joker-smile and character voice effects
- Trending Joker-style smile/laugh effects and other generic creepy, evil, playful or character-like laughs.
- Voice-only/effect-only source clips, without baked-in background music where clean source files are available.
- Keep voice effects separate from the project's background music and instruments.
- Independent volume, pitch, speed/rate, timing, echo/reverb and mute/remove controls.
- Preview before adding.
- Noise reduction/cleanup for noisy source clips, with quality dependent on the original recording.
- Adding or changing a Joker/voice effect must not change or replace the existing background music.


## 26. Realistic 3D scene, PNG and visualizer object studio
- Every imported or generated PNG/artwork object used in the visualizer should be transformable in a realistic 3D-style scene, not limited to a flat static overlay.
- Full 3-axis rotation (X/Y/Z), free movement (left/right, up/down, forward/backward), depth/distance and perspective controls.
- Independent scale, position, anchor/pivot, opacity and orientation for every object.
- 3D camera controls for angle, framing, zoom and perspective.
- Realistic scene integration controls: lighting direction/intensity/color, cast shadows, highlights/reflections where supported, ambient shading, depth/occlusion and matching color tone.
- Motion controls: continuous rotation, floating, orbiting, drifting, zooming, entrance/exit and custom paths.
- Keyframe timeline to set exact start/end positions, rotation, scale and animation timing.
- Beat/BPM-reactive movement, rotation, pulse and other object animation, independently configurable per layer.
- Touch editing: drag to move, gesture to rotate/scale, and precise numeric controls for 3D transforms.
- Apply the same scene/object controls to PNGs, logos, text, symbols, generated artwork and supported visualizer elements.
- Aim for convincing compositing into the video so objects appear to belong inside the scene: match perspective, lighting, shadows, depth and motion blur where technically supported.
- Where supported, use video motion/camera tracking so an object can stay attached to a moving surface or scene position.
- Important limitation: a flat PNG can be rotated, moved and composited in 3D space, but it does not become a fully volumetric 3D model automatically. True all-angle 3D geometry requires a 3D asset/model or a separately generated/reconstructed 3D version.
- Keep each object's transforms and animation independent; editing one object must not unexpectedly change other layers.


## 27. Video project, timeline, autosave and export studio
- Create, save, reopen, rename, duplicate and delete editing projects.
- Autosave project state and recover the latest safe version after an unexpected close where platform storage permits.
- AI speech-to-text captions/subtitles for spoken audio or dialogue, separately from song-lyric transcription; allow manual correction, timing adjustment and caption styling.
- Live preview while editing, with playback controls and timeline scrubbing.
- Multi-layer timeline for audio, video, images, PNGs, logos, text, lyrics, visualizers and effects.
- Undo/redo and edit history; preserve layer order and independent layer settings.
- Trim, split, loop and arrange supported audio/video clips on the timeline.
- Export video in common supported formats such as MP4, MOV and WebM, depending on Android/WebView/browser encoder support.
- Export resolution choices from 1080p through higher resolutions up to the requested 16K target only when the device, renderer and source assets genuinely support them; show unavailable options rather than promising them.
- Social-video aspect ratios and canvas presets, including vertical 9:16, square 1:1 and widescreen 16:9, plus other supported ratios.
- Show platform safe zones/guides so captions, logos and important visuals are not hidden by app controls.
- One-click export using the selected preset, with progress, cancel, error handling and a clear saved-file result.
- Use hardware/GPU acceleration when available; fall back safely when unsupported and manage memory, heat, render time and device limits.
- Preserve project editability separately from the final flattened video export.

## 28. Visual effects, compositing, publishing aids and studio preferences
- Music-video visual effects including particles, smoke, fire, rain, snow, lightning, lens flare, glow, motion blur, camera shake and zoom, with adjustable intensity and timing.
- Background options and animated/parallax depth movement where supported.
- Layer compositing tools including blend modes, masks, chroma key, opacity and independent keyframes.
- Motion/object tracking where supported, including attaching an overlay to a tracked point in a video.
- Save, load and reuse visualizer, effect, typography, color and export presets.
- Extensible effect/plugin architecture where technically and safely supported; do not imply third-party plugins already exist.
- Dark and light studio themes.
- Thumbnail creation from the project/video, with text and artwork placement.
- Suggested video title and hashtags as optional publishing aids.
- Copyright-risk estimate/warning for user-selected media where a reliable authorized checking service is available; clearly label it as an estimate, not legal advice or a guarantee that a video is safe to publish.
- Keep all effects and publishing aids optional and independently editable; do not silently add effects or change the user's source media.


## 29. Dedicated post-import Music Studio and nested editing workflow
- After the user imports an MP3/audio track, open a dedicated Music Studio workspace for that selected track instead of presenting a scattered collection of unrelated controls.
- Keep the song identity, waveform/timeline, playback, play/pause, seek, loop and master preview easy to reach.
- Organize editing into separate top-level feature buttons/tabs or clearly grouped panels. Opening a feature reveals its own nested sub-options; do not display every detailed control at once.
- Keep the interface visually modern, compact and touch-friendly, with a central preview/timeline and contextual controls. Avoid the older flat layout with many permanent buttons crowded together.
- Provide separate vocal/audio editing categories, including:
  - Main vocal and vocal cleanup.
  - Background vocals.
  - Ad-libs and doubled/stacked vocals.
  - Humming and humming-style layers/effects.
  - Harmonies and backing harmonies.
  - Pitch correction/tuning where supported.
  - Voice changer and character effects.
  - Breath, noise and unwanted-sound cleanup.
  - Bass, drums, piano, guitar and other instrument stems where available.
  - Sound effects and added audio layers.
- Each category should open dedicated sub-controls, such as add/import or generate where supported, select source, preview, trim, timing/offset, volume, pan, pitch, speed, fade, mute/solo, effects, duplicate and remove.
- Allow users to add a new ad-lib, hum/humming layer, harmony or vocal effect as a separate track, position it on the timeline, preview it in context and adjust it without changing the original song.
- Make it clear which operations edit an existing isolated stem and which create/add a new recorded, imported or generated layer. Do not imply that a mixed MP3 already contains separately editable ad-libs, humming, vocals or instruments.
- When the source is a single mixed MP3, offer optional AI source separation for supported stems. If separation cannot isolate a requested part cleanly, explain the limitation and let the user add/record/import a separate layer instead.
- Preserve the original imported audio as a non-destructive source. Provide duplicate/version or undo/redo before destructive processing.
- Keep background music, voice, ad-libs, humming, harmonies and added effects on independently controllable paths. Changing one layer must not unexpectedly alter another.
- Keep all nested controls fast to open, avoid unnecessary loading, and show progress/cancel only for operations that genuinely need processing.
- Remember each track's editing state in the project so the user can reopen the Music Studio and continue editing.

---

## Suggested delivery order

This is an order for development, not a reduction of the full scope:
1. Finish and test the independent audio mixer foundation.
2. Add layer timeline/transport reliability, then voice/effect isolation and basic effect controls.
3. Build the searchable sound-effects browser and licensed asset pipeline.
4. Add vocal/instrument separation as a separate optional AI workflow.
5. Expand visualizer, typography, direct canvas editing and touch controls.
6. Add logo/background/chroma-key/filter and template tools.
7. Expand media import, BPM, voice presets and export capabilities.
8. Grow the artwork and sound libraries as asset licensing, storage and performance are validated.

## Honest capability and verification rules
- The existing Version 1.0 features and each new feature must be reported separately as **planned**, **implemented**, **build-verified** or **device-tested**.
- A successful APK build proves packaging/build completion, not that every feature works correctly on a physical Android device.
- Do not claim the 5,000+ sound library or 2,000+ artwork library is populated until the assets, licenses, search and downloads actually exist.
- Do not claim genuine 16K image detail when the source is smaller or merely upscaled.
- Do not guarantee perfect singing transcription, vocal/instrument separation, noise removal, pitch preservation or universal codec support.
- Pitch shifting implemented through playback-rate changes also changes playback speed unless a suitable pitch-preserving processor is used.
- Keep user-supplied/imported media local where possible; explain any model download or network requirement.
- Never bundle copyrighted music, sound effects, artwork or templates without permission.
- Keep controls accessible, responsive and usable on Android screens; heavy model/effect work should be cancellable and should not freeze the editor.
- Run syntax checks and the Android APK workflow after code changes. Test actual audio playback, independent layer volume, timing, export and UI behavior on a real Android device before calling a release complete.


## 30. In-app Google image search and smart template editing
- Add a Google Images search option inside the APK. Show results in-app; tapping an eligible result imports/fetches it into the app's asset library or active project without forcing the user to leave the APK.
- Use authorized search/provider integrations and respect provider terms, copyright, licensing and hotlink restrictions. Do not scrape Google Images pages or promise every result can be fetched. If import is unavailable, show the source-page link and reason.
- Show source, dimensions, file type, transparency and license details where available. Let users insert an asset as background, logo, artwork, text decoration or visualizer object.
- Support original-resolution downloads. Offer up to 16K only when genuine source detail supports it; label AI enlargement as upscaling, never native 16K.
- Keep a reusable asset-search/import button available in background, text/font, logo, artwork and visualizer editors.
- For a chosen background, let users add song lyrics by transcription, paste/write their own text or poetry, or edit text from a template where extractable. Keep each content source on its own editable layer.
- When a downloaded template is opened, detect its editable regions where possible and show a named element list such as headline, title, subtitle, lyric/text, logo, artwork, decorative shape, music and background. Clicking a list item selects that exact element and opens its relevant editor; tapping the canvas element should select the same item.
- Preserve untouched template elements. If the template is a flattened image/video, explain that automatic per-element editing is unavailable and offer manual overlays/recreation.
- Run fetching/template analysis asynchronously with cancel, progress only when needed, memory limits and clear network/file error recovery; never freeze the editor.
- Populate a searchable library of 2,000+ distinct skulls, symbols and emoji-style graphics, with categories, tags, favorites, previews and insert actions usable in background, text/font decoration, logo, artwork and visualizer areas.
- Provide clean transparent PNGs and genuine 3D assets where available. Do not describe a flat PNG as a volumetric 3D model. Retain source/license attribution and duplicate/storage management.

## 31. Expanded voice characters and high-resolution filter pack
- Add generic synthetic voice styles across youthful/teen-sounding, young adult, mature and older-sounding ranges, with masculine/feminine-sounding and character-style options where supported. Do not imitate a real person's identity or infer body type from voice.
- Every selected voice preset must still expose independent pitch up/down, speed, volume, tone/formant where supported, effects, preview, reset and save-preset controls.
- Keep each processed voice layer independent from background music and instruments.
- Provide 50+ distinct photo/video filter presets for backgrounds and imported media, inspired by modern premium-phone camera looks without claiming manufacturer affiliation.
- Offer high-quality processing and up to 16K export only where source dimensions, device memory, GPU/renderer and encoder support it. Filter quality and output pixel resolution are separate settings.
- Apply filters non-destructively to photo or video backgrounds, with intensity, before/after preview, enable/disable and reset.
- Use lower-resolution preview proxies when needed, then render at the highest supported quality during export. Give clear fallbacks instead of freezing or crashing on unsupported devices.

## 32. In-app ChatGPT-powered editing assistant
- Add a dedicated AI Assistant workspace inside the APK. The user can describe desired edits in natural language, ask questions about the current project, and request changes to music, voice, lyrics, images, artwork, visualizer objects and video edits.
- The assistant must understand the current project context only after the user explicitly chooses to share it. Provide a clear preview of which project/media metadata or selected assets will be sent to an AI service; do not upload full media by default.
- Use the OpenAI API (Responses API and supported tool/function calling) through a protected backend. Do not embed OpenAI API keys in Android assets, JavaScript, APK resources, public GitHub files or client-side storage. Never ask the user to paste an API secret into a public chat or repository.
- Clearly explain that ChatGPT app subscriptions and OpenAI API usage are separate products/billing. Signing into ChatGPT does not automatically grant the APK API access or transfer the user's ChatGPT plan. If a supported official account authorization route becomes available for this app use case, assess it separately; do not invent or simulate a ChatGPT login.
- Let the assistant convert requests into structured editor actions such as set layer volume/pan/pitch, trim/split/move clips, adjust filters, set text/lyrics, select a voice preset, create a beat-cut plan or change export settings.
- Before applying a batch of changes, show an editable action plan with affected tracks/layers and a before/after summary. Require user confirmation for destructive actions, source replacement, deletion, external uploads, paid operations and final export. Preserve undo/redo and the original source.
- Execute only supported editor functions. If an operation is not implemented or unsupported by the current project, say so and offer a manual alternative; never claim an AI instruction was applied when it only generated advice.
- Include chat history per project, stop/cancel, retry, clear conversation, optional prompt suggestions and transparent usage/cost notices. Keep errors, network failures and rate limits recoverable without freezing the editor.
- Do not imitate real people or generate deceptive identity clones. Apply content, copyright, privacy and safety restrictions to user prompts and media.
- Provide an offline/manual mode when the AI service is not configured or unavailable.

## 33. AI Auto Video Editor and social-media styles
- Add a dedicated Auto Video workspace that imports multiple clips and a selected music track, analyzes the audio beat grid and video metadata, and creates a non-destructive editable draft.
- Support beat-synchronized cuts, clip selection/reordering, scene-change suggestions, speech-pause cuts, configurable clip duration, speed ramps, slow motion, punch-in/punch-out zooms, transitions, motion effects, color/filter looks, captions, lyric overlays, stickers, sound effects and music ducking where supported.
- Offer selectable editing styles such as fast TikTok/Reels montage, cinematic, travel, vlog, product promo, lyric video, calm aesthetic, energetic beat edit and story/highlight recap. Style presets must be original generic styles, not copied proprietary templates or unlicensed content.
- Offer output presets for vertical 9:16, square 1:1 and horizontal 16:9; let the user set target duration, cut intensity, transition density, caption style and preferred clips.
- Analyze beat positions and optional speech transcription/pauses. Let users choose whether cuts follow every beat, strong beats, bars, phrase boundaries or speech pauses. Never assume every beat should become a cut.
- Show the generated result on an editable video timeline with each clip, transition, caption, effect and audio layer separately selectable. Users can replace, reorder, trim, mute, remove or manually adjust each item.
- Add preview proxies and asynchronous processing with visible progress, cancellation and memory-aware fallbacks. Do not block the UI during analysis or export.
- Preserve imported source clips and the original music. Applying an auto-edit creates a new draft/project version; it must not overwrite source media.
- Support captions/lyrics with manual correction. Speech recognition and lyric transcription may be inaccurate; display confidence/allow edits and do not claim perfect transcription.
- Export at the highest genuinely supported resolution/frame rate/codec for the source and Android device. Do not advertise 16K unless the entire render/encoder pipeline supports it and tests verify it.
- Provide a manual-edit path when AI services, transcription models or advanced effects are unavailable. Clearly identify cloud-based features and any usage charges.
- Run automated timeline/audio/render tests and physical Android tests for playback, frame timing, memory, touch editing, export, cancellation and recovery before marking the feature device-tested.

## 2026-11-05 delivery notes — free Infinix ZERO 40 path

- Start the Auto Video Editor with a local-only, deterministic beat-cut workflow using the existing BPM detector/grid. Do not require paid APIs or accounts for basic montage creation.
- Initial implementation now includes 8 local source clips, storage/length guardrails, five original cut styles, editable segment order/length/removal, playhead-synchronized canvas preview, and portable project metadata.
- Direct cuts are the only implemented transition behavior in this milestone. Scene analysis, speech-pause cuts, AI captions, transition effects, speed ramps and advanced compositing remain future work and must be clearly marked unavailable until built and tested.
- Tune previews and storage for the user's Infinix ZERO 40 (X6860 / 4G configuration), while detecting actual browser/codec support at runtime. Never force 4K/16K export or keep all video sources decoding simultaneously.
- Free local editing assistant is preferred over any billable ChatGPT API integration. Keep paid/cloud AI disabled unless the user explicitly opts in later.

- Added a small free offline Quick Edit Assistant for a limited set of supported edits. It previews changes and requires user confirmation; it is a rules-based helper, not ChatGPT. The full ChatGPT/API-powered assistant remains skipped unless a genuinely free and secure integration becomes available.


## 34. Ten-template photo + video Auto Cut (free offline milestone)
- Import up to 12 photos and 8 videos from the device, within 180 MB total; photos are limited to 20 MB each and videos to 120 MB/180 seconds each.
- Choose one of 10 local templates: Beat Snap, Cinematic Flow, Travel Diary, Vlog Story, Calm Aesthetic, Photo Memories, Lyric Pulse, Flash Cuts, Memory Film and Documentary.
- Use the detected BPM or a clearly disclosed 120 BPM fallback. Photo-only montages are paced to the main song duration; photos receive gentle pan/zoom motion. Video clips are split into beat-sized segments.
- Keep sources unchanged and segments editable (reorder, trim, split, remove). Save media and settings locally and in portable project packages.
- This is deterministic offline beat/template editing, not AI scene understanding, automatic semantic photo selection, generated transitions, or a full multi-track video compositor. Codec, memory and export reliability still require physical Android testing.
