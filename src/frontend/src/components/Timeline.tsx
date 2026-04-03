import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Plus,
  Redo2,
  Scissors,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMedia } from "../context/MediaContext";
import type { TimelineClip } from "../data/mockData";
import type { TimelineState } from "../hooks/useTimeline";

interface TimelineProps {
  state: TimelineState;
  onPlayheadChange: (pos: number) => void;
  onClipMove: (clipId: string, newStart: number) => void;
  onClipDelete: (clipId: string) => void;
  onSplitClip: (clipId: string) => void;
  onZoom: (zoom: number) => void;
  onTrimClip: (clipId: string, newStart: number, newDuration: number) => void;
  onDuplicateClip: (clipId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TRACK_ORDER: Array<TimelineClip["track"]> = [
  "video",
  "audio",
  "text",
  "overlay",
];
const TRACK_LABELS = {
  video: "VIDEO",
  audio: "AUDIO",
  text: "TEXT",
  overlay: "OVERLAY",
};
const TRACK_COLORS = {
  video: "clip-video",
  audio: "clip-audio",
  text: "clip-text",
  overlay: "clip-overlay",
};
const TRACK_ACCENT_COLORS = {
  video: "oklch(0.65 0.15 178)",
  audio: "oklch(0.58 0.18 290)",
  text: "oklch(0.62 0.20 240)",
  overlay: "oklch(0.72 0.16 60)",
};

const PIXELS_PER_SECOND = 60;
const TRACK_HEIGHT = 44;
const RULER_HEIGHT = 28;
const LABEL_WIDTH = 72;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Build a timeline-compatible clip from a media clip
function mediaClipToTimelineClip(
  mediaClip: {
    id: string;
    name: string;
    type: "video" | "audio";
    duration?: number;
  },
  startOffset: number,
): TimelineClip {
  return {
    id: `media_${mediaClip.id}`,
    track: mediaClip.type === "video" ? "video" : "audio",
    start: startOffset,
    duration: mediaClip.duration ?? 10,
    label: mediaClip.name,
  };
}

interface ContextMenu {
  x: number;
  y: number;
  clipId: string;
}

export function Timeline({
  state,
  onPlayheadChange,
  onClipMove,
  onClipDelete,
  onSplitClip,
  onZoom,
  onTrimClip,
  onDuplicateClip,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    clipId: string;
    startX: number;
    startClipStart: number;
  } | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<number | null>(null);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const {
    clips: mediaClips,
    activeClipId,
    setActiveClipId,
    triggerFileInput,
  } = useMedia();

  const pps = PIXELS_PER_SECOND * state.zoom;
  const totalWidth = state.totalDuration * pps;

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [contextMenu]);

  const handleRulerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pos = x / pps;
      onPlayheadChange(pos);
    },
    [pps, onPlayheadChange],
  );

  // Playhead drag
  const handlePlayheadMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;
      const scrollLeft = scrollEl.scrollLeft;

      const onMouseMove = (me: MouseEvent) => {
        const trackAreaRect = scrollEl.getBoundingClientRect();
        const x = me.clientX - trackAreaRect.left + scrollLeft - LABEL_WIDTH;
        const pos = Math.max(0, Math.min(x / pps, state.totalDuration));
        onPlayheadChange(pos);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [pps, state.totalDuration, onPlayheadChange],
  );

  const handleClipMouseDown = useCallback(
    (e: React.MouseEvent, clipId: string, clipStart: number) => {
      e.stopPropagation();
      setSelectedClip(clipId);
      setDragState({ clipId, startX: e.clientX, startClipStart: clipStart });

      const onMouseMove = (me: MouseEvent) => {
        const dx = me.clientX - e.clientX;
        const rawStart = clipStart + dx / pps;
        const snapped = Math.round(rawStart);
        const delta = Math.abs(rawStart - snapped);
        if (delta < 0.3) {
          setSnapIndicator(snapped);
        } else {
          setSnapIndicator(null);
        }
        onClipMove(clipId, rawStart);
      };

      const onMouseUp = () => {
        setDragState(null);
        setSnapIndicator(null);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [pps, onClipMove],
  );

  // Resize from right edge
  const handleRightResizeMouseDown = useCallback(
    (e: React.MouseEvent, clip: TimelineClip) => {
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startDuration = clip.duration;

      const onMouseMove = (me: MouseEvent) => {
        const dx = me.clientX - startX;
        const newDuration = Math.max(0.1, startDuration + dx / pps);
        onTrimClip(clip.id, clip.start, newDuration);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [pps, onTrimClip],
  );

  // Resize from left edge
  const handleLeftResizeMouseDown = useCallback(
    (e: React.MouseEvent, clip: TimelineClip) => {
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startStart = clip.start;
      const startDuration = clip.duration;

      const onMouseMove = (me: MouseEvent) => {
        const dx = me.clientX - startX;
        const newStart = Math.max(0, startStart + dx / pps);
        const dDelta = newStart - startStart;
        const newDuration = Math.max(0.1, startDuration - dDelta);
        onTrimClip(clip.id, newStart, newDuration);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [pps, onTrimClip],
  );

  const handleClipContextMenu = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, clipId });
      setSelectedClip(clipId);
    },
    [],
  );

  // Zoom to fit
  const handleZoomToFit = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const availableWidth = scrollEl.clientWidth - LABEL_WIDTH;
    const newZoom = availableWidth / (state.totalDuration * PIXELS_PER_SECOND);
    onZoom(Math.max(0.5, Math.min(newZoom, 4)));
  }, [state.totalDuration, onZoom]);

  // Render ruler ticks
  const ticks: number[] = [];
  const tickInterval = pps >= 80 ? 5 : pps >= 40 ? 10 : 15;
  for (let t = 0; t <= state.totalDuration; t += tickInterval) {
    ticks.push(t);
  }

  // Build combined clip list: real media clips placed at start of their track, then mock clips
  const videoMediaClips = mediaClips
    .filter((mc) => mc.type === "video")
    .map((mc, i) => {
      const prevDurations = mediaClips
        .filter((m) => m.type === "video")
        .slice(0, i)
        .reduce((acc, m) => acc + (m.duration ?? 10), 0);
      return mediaClipToTimelineClip(mc, prevDurations);
    });

  const audioMediaClips = mediaClips
    .filter((mc) => mc.type === "audio")
    .map((mc, i) => {
      const prevDurations = mediaClips
        .filter((m) => m.type === "audio")
        .slice(0, i)
        .reduce((acc, m) => acc + (m.duration ?? 10), 0);
      return mediaClipToTimelineClip(mc, prevDurations);
    });

  // Merge: if we have real clips, replace mock clips for that track; otherwise keep mocks
  const getTrackClips = (track: TimelineClip["track"]): TimelineClip[] => {
    if (track === "video" && videoMediaClips.length > 0) {
      return videoMediaClips;
    }
    if (track === "audio" && audioMediaClips.length > 0) {
      return audioMediaClips;
    }
    return state.clips.filter((c) => c.track === track);
  };

  return (
    <div className="flex flex-col h-full bg-[oklch(0.09_0.018_233)] border-t border-border relative">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <span className="text-[11px] font-semibold text-teal tracking-widest uppercase">
          Multi-Layer Timeline Editor
        </span>
        <div className="flex items-center gap-1.5">
          {/* Undo/Redo */}
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            title="Undo (Ctrl+Z)"
            data-ocid="timeline.undo.button"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            title="Redo (Ctrl+Shift+Z)"
            data-ocid="timeline.redo.button"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          <button
            type="button"
            onClick={() => onZoom(state.zoom - 0.25)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-muted-foreground font-mono w-10 text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoom(state.zoom + 0.25)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomToFit}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom to fit"
            data-ocid="timeline.zoom_fit.button"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {selectedClip && (
            <>
              <button
                type="button"
                onClick={() => {
                  // Only split mock clips (not media clips)
                  if (!selectedClip.startsWith("media_")) {
                    onSplitClip(selectedClip);
                  }
                  setSelectedClip(null);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Split at playhead"
              >
                <Scissors className="w-3 h-3" /> Split
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedClip.startsWith("media_")) {
                    onClipDelete(selectedClip);
                  }
                  setSelectedClip(null);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                title="Delete clip"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </>
          )}
          <button
            type="button"
            onClick={triggerFileInput}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal/10 text-teal hover:bg-teal/20 flex items-center gap-1 transition-colors border border-teal/30"
            data-ocid="timeline.add_clip.button"
          >
            <Plus className="w-3 h-3" /> Add Clip
          </button>
        </div>
      </div>

      {/* Scrollable Timeline Body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto no-select"
        style={{ overscrollBehavior: "contain" }}
      >
        <div
          ref={timelineBodyRef}
          style={{ width: LABEL_WIDTH + totalWidth + 40, minWidth: "100%" }}
        >
          {/* Ruler */}
          <div
            className="flex sticky top-0 z-10"
            style={{ height: RULER_HEIGHT }}
          >
            {/* Label spacer */}
            <div
              style={{ width: LABEL_WIDTH, minWidth: LABEL_WIDTH }}
              className="bg-[oklch(0.10_0.020_233)] border-b border-r border-border flex items-end pb-1 px-2"
            >
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                Time
              </span>
            </div>
            {/* Ruler ticks */}
            <div
              className="relative flex-1 cursor-pointer border-b border-border bg-[oklch(0.10_0.020_233)]"
              style={{ minWidth: totalWidth }}
              onClick={handleRulerClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleRulerClick(
                    e as unknown as React.MouseEvent<HTMLDivElement>,
                  );
              }}
              role="slider"
              aria-label="Timeline position"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
            >
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: t * pps }}
                >
                  <div className="w-px h-2 bg-border mt-1" />
                  <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                    {formatTime(t)}
                  </span>
                </div>
              ))}
              {/* Playhead on ruler — draggable */}
              <div
                className="absolute top-0 bottom-0 z-20 cursor-ew-resize group"
                style={{
                  left: state.playheadPosition * pps - 6,
                  width: 12,
                }}
                onMouseDown={handlePlayheadMouseDown}
              >
                {/* Playhead indicator triangle */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "8px solid oklch(0.78 0.17 178)",
                  }}
                />
                <div
                  className="absolute top-2 bottom-0 left-1/2 -translate-x-1/2 w-0.5"
                  style={{
                    background: "oklch(0.78 0.17 178)",
                    boxShadow: "0 0 6px oklch(0.78 0.17 178 / 0.8)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Snap indicator */}
          {snapIndicator !== null && (
            <div
              className="absolute top-0 bottom-0 w-px z-30 pointer-events-none"
              style={{
                left: LABEL_WIDTH + snapIndicator * pps,
                background: "oklch(0.90 0.20 60)",
                boxShadow: "0 0 4px oklch(0.90 0.20 60 / 0.8)",
              }}
            />
          )}

          {/* Tracks */}
          {TRACK_ORDER.map((track) => {
            const clips = getTrackClips(track);
            const isRealMediaTrack =
              (track === "video" && videoMediaClips.length > 0) ||
              (track === "audio" && audioMediaClips.length > 0);

            return (
              <div
                key={track}
                className="flex border-b border-border"
                style={{ height: TRACK_HEIGHT }}
              >
                {/* Track Label */}
                <div
                  className="flex items-center justify-between px-2 border-r border-border bg-[oklch(0.11_0.021_233)] flex-shrink-0"
                  style={{ width: LABEL_WIDTH }}
                >
                  <span
                    className="text-[10px] font-bold tracking-widest"
                    style={{ color: TRACK_ACCENT_COLORS[track] }}
                  >
                    {TRACK_LABELS[track]}
                  </span>
                  {isRealMediaTrack && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          track === "video"
                            ? "oklch(0.65 0.15 178)"
                            : "oklch(0.58 0.18 290)",
                        boxShadow:
                          track === "video"
                            ? "0 0 4px oklch(0.65 0.15 178)"
                            : "0 0 4px oklch(0.58 0.18 290)",
                      }}
                    />
                  )}
                </div>

                {/* Clip area */}
                <div
                  className="relative flex-1 bg-[oklch(0.09_0.018_233)]"
                  style={{ minWidth: totalWidth }}
                >
                  {/* Grid lines */}
                  {ticks.map((t) => (
                    <div
                      key={t}
                      className="absolute top-0 bottom-0 w-px bg-border opacity-30"
                      style={{ left: t * pps }}
                    />
                  ))}

                  {/* Clips */}
                  <AnimatePresence>
                    {clips.map((clip) => {
                      const isMediaClip = clip.id.startsWith("media_");
                      const sourceMediaId = isMediaClip
                        ? clip.id.replace("media_", "")
                        : null;
                      const isActive =
                        sourceMediaId !== null &&
                        activeClipId === sourceMediaId;

                      return (
                        <motion.div
                          key={clip.id}
                          className={`absolute top-1.5 bottom-1.5 rounded cursor-grab border ${
                            isMediaClip
                              ? track === "video"
                                ? "border-teal/50"
                                : "border-purple-400/50"
                              : TRACK_COLORS[clip.track]
                          } ${
                            selectedClip === clip.id
                              ? "ring-1 ring-white/60"
                              : ""
                          } ${isActive ? "ring-2 ring-teal/70" : ""} ${
                            dragState?.clipId === clip.id
                              ? "cursor-grabbing"
                              : ""
                          }`}
                          style={{
                            left: clip.start * pps,
                            width: clip.duration * pps - 2,
                            background: isMediaClip
                              ? track === "video"
                                ? "linear-gradient(135deg, oklch(0.65 0.15 178 / 0.35), oklch(0.50 0.12 178 / 0.25))"
                                : "linear-gradient(135deg, oklch(0.50 0.18 290 / 0.35), oklch(0.40 0.15 290 / 0.25))"
                              : undefined,
                          }}
                          onMouseDown={(e) =>
                            handleClipMouseDown(e, clip.id, clip.start)
                          }
                          onContextMenu={(e) =>
                            handleClipContextMenu(e, clip.id)
                          }
                          onClick={() => {
                            if (isMediaClip && sourceMediaId) {
                              setActiveClipId(sourceMediaId);
                            }
                          }}
                          whileHover={{ scale: 1.01 }}
                          layoutId={clip.id}
                          initial={
                            isMediaClip ? { opacity: 0, scaleX: 0.8 } : {}
                          }
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={isMediaClip ? { opacity: 0, scaleX: 0.8 } : {}}
                        >
                          {/* Left resize handle */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-10 bg-white/20 rounded-l opacity-0 hover:opacity-100 transition-opacity"
                            onMouseDown={(e) =>
                              handleLeftResizeMouseDown(e, clip)
                            }
                          />

                          {/* Clip content */}
                          <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                            {track === "audio" ? (
                              <WaveformSVG
                                color={
                                  isMediaClip
                                    ? "oklch(0.65 0.18 290 / 0.7)"
                                    : undefined
                                }
                              />
                            ) : (
                              <span className="text-[9px] font-semibold text-white/90 truncate">
                                {clip.label}
                              </span>
                            )}
                          </div>
                          {/* Real media badge */}
                          {isMediaClip && (
                            <div
                              className="absolute top-0.5 right-1 text-[8px] font-bold px-0.5 rounded"
                              style={{
                                color:
                                  track === "video"
                                    ? "oklch(0.85 0.18 178)"
                                    : "oklch(0.75 0.18 290)",
                                background: "oklch(0 0 0 / 0.40)",
                              }}
                            >
                              LIVE
                            </div>
                          )}
                          {/* Right resize handle */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/20 rounded-r opacity-0 hover:opacity-100 transition-opacity z-10"
                            onMouseDown={(e) =>
                              handleRightResizeMouseDown(e, clip)
                            }
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 z-10 pointer-events-none"
                    style={{
                      left: state.playheadPosition * pps - 1,
                      background: "oklch(0.78 0.17 178 / 0.7)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg overflow-hidden shadow-2xl"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: "oklch(0.13 0.022 233)",
            border: "1px solid oklch(0.26 0.028 228 / 0.6)",
            backdropFilter: "blur(12px)",
            minWidth: "140px",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="menu"
        >
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-[11px] text-foreground hover:bg-white/8 flex items-center gap-2 transition-colors"
            onClick={() => {
              if (!contextMenu.clipId.startsWith("media_")) {
                onSplitClip(contextMenu.clipId);
              }
              setContextMenu(null);
            }}
            data-ocid="timeline.clip_context.split_button"
          >
            <Scissors className="w-3 h-3 text-teal" /> Split Here
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-[11px] text-foreground hover:bg-white/8 flex items-center gap-2 transition-colors"
            onClick={() => {
              onDuplicateClip(contextMenu.clipId);
              setContextMenu(null);
            }}
            data-ocid="timeline.clip_context.duplicate_button"
          >
            <ChevronRight className="w-3 h-3 text-teal" /> Duplicate
          </button>
          <div className="h-px bg-border mx-2" />
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-[11px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
            onClick={() => {
              if (!contextMenu.clipId.startsWith("media_")) {
                onClipDelete(contextMenu.clipId);
              }
              setContextMenu(null);
              setSelectedClip(null);
            }}
            data-ocid="timeline.clip_context.delete_button"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function WaveformSVG({ color }: { color?: string }) {
  const bars = Array.from({ length: 32 }, (_, i) => ({
    h: Math.random() * 0.8 + 0.2,
    i,
  }));
  return (
    <div className="flex items-center gap-px h-full w-full">
      {bars.map(({ h, i }) => (
        <div
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: `${h * 100}%`,
            maxHeight: "80%",
            background: color ?? "rgba(255,255,255,0.5)",
          }}
        />
      ))}
    </div>
  );
}

export default Timeline;
