import { motion } from "motion/react";
import { useEffect } from "react";
import { LeftPanel } from "../components/LeftPanel";
import { PreviewPanel } from "../components/PreviewPanel";
import { RightPanel } from "../components/RightPanel";
import { Timeline } from "../components/Timeline";
import { MediaProvider, useMedia } from "../context/MediaContext";
import { useTimeline } from "../hooks/useTimeline";

function EditorContent() {
  const {
    state,
    setPlayheadPosition,
    togglePlay,
    setZoom,
    updateClipPosition,
    trimClip,
    deleteClip,
    splitClip,
    duplicateClip,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTimeline();

  const { videoRef } = useMedia();

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem(
          "luminar-autosave",
          JSON.stringify({ clips: state.clips, savedAt: Date.now() }),
        );
      } catch {
        // ignore storage errors
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [state.clips]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      // Don't intercept when typing in inputs
      if (
        tag === "input" ||
        tag === "textarea" ||
        (e.target as HTMLElement).contentEditable === "true"
      ) {
        return;
      }

      const video = videoRef.current;

      // Ctrl+Z / Cmd+Z = undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      // Ctrl+Shift+Z / Ctrl+Y = redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (video) {
            video.currentTime = Math.max(0, video.currentTime - 1);
          } else {
            setPlayheadPosition(Math.max(0, state.playheadPosition - 1));
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (video) {
            video.currentTime = Math.min(
              video.duration || Number.POSITIVE_INFINITY,
              video.currentTime + 1,
            );
          } else {
            setPlayheadPosition(
              Math.min(state.totalDuration, state.playheadPosition + 1),
            );
          }
          break;
        case "j":
          if (video) {
            video.playbackRate = 0.5;
          }
          break;
        case "k":
          // Pause
          if (state.isPlaying) togglePlay();
          break;
        case "l": {
          if (video) {
            video.playbackRate = video.playbackRate === 2 ? 1.5 : 2;
          }
          break;
        }
        case "Delete":
        case "Backspace":
          // Delete handled by Timeline's selected clip
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.isPlaying,
    state.playheadPosition,
    state.totalDuration,
    togglePlay,
    setPlayheadPosition,
    undo,
    redo,
    videoRef,
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 3-column workspace */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Panel — L2 glass elevation */}
        <motion.div
          className="w-52 flex-shrink-0 glass overflow-hidden"
          style={{ borderRight: "1px solid oklch(0.26 0.028 228 / 0.45)" }}
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          data-ocid="editor.left_panel.panel"
        >
          <LeftPanel />
        </motion.div>

        {/* Center Preview — L0 (deepest canvas) */}
        <motion.div
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          data-ocid="editor.preview.panel"
          style={{ background: "var(--elev-0)" }}
        >
          <PreviewPanel
            isPlaying={state.isPlaying}
            playheadPosition={state.playheadPosition}
            totalDuration={state.totalDuration}
            onTogglePlay={togglePlay}
            onSeek={setPlayheadPosition}
          />
        </motion.div>

        {/* Right Panel — L2 glass elevation */}
        <motion.div
          className="w-56 flex-shrink-0 glass overflow-hidden"
          style={{ borderLeft: "1px solid oklch(0.26 0.028 228 / 0.45)" }}
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          data-ocid="editor.right_panel.panel"
        >
          <RightPanel />
        </motion.div>
      </div>

      {/* Timeline — L1 (slightly raised from canvas) */}
      <motion.div
        className="h-52 flex-shrink-0 overflow-hidden"
        style={{
          background: "var(--elev-1)",
          borderTop: "1px solid oklch(0.23 0.026 230 / 0.7)",
        }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        data-ocid="editor.timeline.panel"
      >
        <Timeline
          state={state}
          onPlayheadChange={setPlayheadPosition}
          onClipMove={updateClipPosition}
          onClipDelete={deleteClip}
          onSplitClip={splitClip}
          onZoom={setZoom}
          onTrimClip={trimClip}
          onDuplicateClip={duplicateClip}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </motion.div>
    </div>
  );
}

export function EditorPage() {
  return (
    <MediaProvider>
      <EditorContent />
    </MediaProvider>
  );
}

export default EditorPage;
