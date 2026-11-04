# WaveForge Studio — Development Roadmap

This roadmap records the requested long-term direction. It is a plan, not a claim that every item is already implemented. Features will be delivered in tested phases while preserving the working Version 1.0 foundation.

## Phase 1 — Audio foundation
1. **Independent audio mixer:** background music plus separate voice, ad-lib, effects and instrument stem layers; per-layer volume, pitch/rate and timeline offset.
2. **Voice and character effects:** clean Joker-style laughs/smiles and other generic character effects; isolated from background music, with independent controls. Noise removal depends on source quality.
3. **Sound-effects browser:** searchable, categorized library with preview, favorites and recent items; target 5,000+ licensed/user-authorized assets, including clean isolated racing engines, animals, alarms/sirens, mechanical sounds, heartbeat, clocks and nature.
4. **Audio processing:** EQ, bass, treble, reverb, echo, delay, filters, fades and automation.
5. **Stem separation and noise cleanup:** optional AI-assisted vocal/instrument separation and noise reduction; quality and speed depend on model, device and source.

## Phase 2 — Visual design and editing
6. 3D and animated visualizer styles, beat/BPM controls and sensitivity.
7. 100+ typography/font styles, 3D text, glow, animation and individual text controls.
8. Direct canvas selection/editing for text, logo, visualizer and background.
9. Finger gestures for move, resize, rotate, masks, grouping, locking and visibility.
10. PNG logo studio with transparent import, transform, masking and animation.
11. Green-screen/chroma-key removal and background replacement.
12. 50+ photo/video filters with intensity controls and original reset.
13. Large decorative asset collection (target 2,000+ skulls, symbols, masks and artwork), with search/categories and performance-aware loading.
14. Custom image/video backgrounds, manual writing and lyrics placement.
15. Smart template inspection/editing while preserving the original template.

## Phase 3 — Media and creative sources
16. Universal local media import, including supported audio formats and audio extraction from local video.
17. BPM detection, manual tempo adjustment and beat-grid synchronization.
18. YouTube-related workflow only where official access and rights permit; no promise of unrestricted downloading.
19. Searchable PNG/artwork discovery from permitted sources; preserve source licensing and real source resolution.
20. Multi-layer music projects with saved/reusable presets and project state.

## Phase 4 — Lyrics, voices and export
21. Automatic lyric transcription, manual correction, timing edits, SRT/VTT import and per-word karaoke highlighting.
22. Multiple lyric/poetry templates and 100+ future text looks.
23. Generic synthetic voice styles and voice-changing controls; no real-person identity imitation.
24. Separate controls for vocal, background music, bass, drums, piano, guitar, ad-libs and effects when separate stems are supplied.
25. Export improvements for supported resolutions, frame rates and device/browser codecs, with clear capability reporting.

## Delivery rules
- Work in small, testable releases; do not remove existing working features without approval.
- Keep background music, voice effects and instrument stems on separate audio paths.
- A mixed MP3 cannot be treated as already-separated stems. AI separation is a distinct optional feature and is not guaranteed to be perfect.
- Do not claim a 5,000+ asset library, 16K source quality, perfect noise removal, universal MP4 export or device testing until each is actually verified.
- Use properly licensed, public-domain or user-authorized audio and visual assets.
- Run JavaScript checks and the Android APK workflow for each app release. Device playback, mixing and export still require real-device testing.
