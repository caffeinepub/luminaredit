# LuminarEdit — Functional Video Editor

## Current State

LuminarEdit is a fully-built video editing UI with:
- Multi-layer timeline with mock clips, zoom, drag-to-move, split, delete
- PreviewPanel with real HTML5 `<video>` playback when a file is uploaded
- LeftPanel with tabs (Media, Assets, Effects, Transitions, Filters), tool tiles, and an upload-via-ICP flow
- RightPanel with Audio/Video/AI tabs — mostly sliders and switches with no real effect on the preview
- useTimeline hook managing playhead position with a setInterval ticker
- MediaContext for storing uploaded clips and blob URLs
- The editor layout works visually but controls are disconnected from preview

## Requested Changes (Diff)

### Add
- **Video trim on timeline clips**: draggable left/right resize handles on clips that actually trim start/end and update duration
- **Speed control that works**: changing the speed slider in RightPanel applies `videoRef.current.playbackRate`
- **Volume control that works**: master volume in RightPanel Audio tab drives the video element volume
- **Split at playhead**: clicking Split actually splits the active clip at current time position and creates two sub-clips in the timeline
- **Crop/Transform overlay on preview**: a click-to-crop mode that shows a resizable bounding box over the preview with apply/cancel
- **Text overlay**: clicking "Add Text" tool opens an inline text input that renders a draggable text layer over the preview canvas
- **Playhead sync**: timeline playhead follows the real video `currentTime` during playback
- **Clip selection drives preview**: clicking a timeline clip sets it as active and seeks the preview video to that clip's start time
- **Real waveform-style visualization for audio clips** in the timeline (already partially done, keep and improve)
- **Export modal functional feedback**: show a simulated progress bar with actual steps (Analyzing, Rendering, Encoding, Finalizing)
- **Trim tool**: select a clip, then drag the left/right edges to trim
- **Undo/Redo**: keyboard shortcuts Ctrl+Z / Ctrl+Y for timeline state changes
- **Keyboard shortcuts**: spacebar for play/pause, J/K/L for playback control, Delete key to delete selected clip
- **Zoom to fit**: button that auto-zooms timeline so all clips fill the view
- **Drag-to-reorder clips on timeline**: clips can be dragged horizontally to new start positions (already partially there, fix any bugs)
- **Right-click context menu on clips**: Cut, Copy, Paste, Delete, Split Here options
- **Add Clip button** in timeline toolbar opens file picker (reuses existing ICP upload)
- **Timeline scrubber drag**: dragging the playhead line itself (not just clicking the ruler) for precise positioning
- **Snap-to-grid on timeline**: when dragging clips, snap to nearest second if within 0.3s
- **Apply audio effects**: noise reduction / voice enhance switches actually throttle the audio gain and add a Web Audio API node chain
- **Apply speed ramp**: speed slider in RightPanel calls `videoRef.playbackRate` on the active clip
- **Auto-save to localStorage**: project state (clip positions, settings) auto-saves every 30 seconds
- **Filter preview**: selecting a filter in LeftPanel Filters tab applies a CSS `filter` string to the video element (brightness, contrast, saturation, hue)

### Modify
- **PreviewPanel**: expose videoRef via MediaContext (or a callback) so RightPanel can drive volume and speed
- **useTimeline**: add undo/redo stack, trimClip action, snap behavior
- **Timeline**: fix resize handles to actually call trimClip; make playhead draggable
- **LeftPanel**: "Add Text" tool renders text overlay layer in preview; Filters tab applies CSS filter
- **RightPanel**: volume and speed sliders connect to active video element; export modal gets real progress simulation
- **MediaContext**: expose videoRef and a `setVideoFilter` function

### Remove
- Nothing is removed; all existing UI elements are kept

## Implementation Plan

1. **MediaContext** — add `videoRef`, `videoFilter`, `setVideoFilter`, `playbackRate`, `setPlaybackRate`; expose them to all consumers
2. **useTimeline** — add `trimClip(id, newStart, newDuration)`, `undoStack`/`redoStack`, `undo()`/`redo()`, snap logic in `updateClipPosition`
3. **PreviewPanel** — forward videoRef from MediaContext; apply `videoFilter` as CSS filter on the video element; apply `playbackRate` from context
4. **Timeline** — make resize handles functional (mousedown on left/right edge → trimClip); make playhead draggable; Add Clip button uses `triggerFileInput`; right-click context menu on clips; Zoom to Fit button
5. **RightPanel** — wire volume slider to `videoRef.current.volume`; wire speed slider to MediaContext `setPlaybackRate`; connect noise-reduction / voice-enhance to a simple Web Audio API gain chain
6. **LeftPanel** — Filters tab: clicking a filter calls `setVideoFilter` with the CSS string; "Add Text" tool opens an overlay input on the preview
7. **TextOverlay component** — a floating div rendered in PreviewPanel over the video with drag, resize, and text editing
8. **Keyboard shortcuts** — `useEffect` in EditorPage listening for Space, J, K, L, Delete, Ctrl+Z, Ctrl+Y
9. **Auto-save** — `useEffect` in EditorPage that saves timeline state to localStorage every 30s
10. **Export modal** — animated progress simulation with real steps
