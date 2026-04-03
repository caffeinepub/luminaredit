import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Upload,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMedia } from "../context/MediaContext";

interface PreviewPanelProps {
  isPlaying: boolean;
  playheadPosition: number;
  totalDuration: number;
  onTogglePlay: () => void;
  onSeek: (position: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
}

const ASPECT_RATIOS = [
  { label: "16:9", value: "16/9" },
  { label: "9:16", value: "9/16" },
  { label: "1:1", value: "1/1" },
  { label: "4:5", value: "4/5" },
  { label: "21:9", value: "21/9" },
];

export function PreviewPanel({
  isPlaying,
  playheadPosition,
  totalDuration,
  onTogglePlay,
  onSeek,
}: PreviewPanelProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState("16/9");
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [localVolume, setLocalVolume] = useState(1);

  const {
    clips,
    activeClipId,
    triggerFileInput,
    videoRef,
    videoFilter,
    playbackRate,
    masterVolume,
    textOverlays,
    updateTextOverlay,
    removeTextOverlay,
  } = useMedia();
  const activeClip = clips.find((c) => c.id === activeClipId) ?? null;
  const hasVideo = activeClip?.type === "video";

  // Track which overlay is being edited/hovered
  const [hoveredOverlay, setHoveredOverlay] = useState<string | null>(null);
  const [editingOverlay, setEditingOverlay] = useState<string | null>(null);
  const draggingOverlayRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startOx: number;
    startOy: number;
  } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Sync play/pause with timeline state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, hasVideo, videoRef]);

  // Apply CSS filter from context
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.style.filter = videoFilter === "none" ? "" : videoFilter;
  }, [videoFilter, videoRef]);

  // Apply playback rate from context
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, videoRef]);

  // Apply master volume (unless locally muted)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isMuted) {
      video.volume = masterVolume;
    }
  }, [masterVolume, isMuted, videoRef]);

  // Sync local volume display with master volume
  useEffect(() => {
    setLocalVolume(masterVolume);
  }, [masterVolume]);

  // Sync mute state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (!isMuted) {
      video.volume = masterVolume;
    }
  }, [isMuted, masterVolume, videoRef]);

  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  }, [videoRef]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  }, [videoRef]);

  const handleVideoScrubClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !videoDuration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const seekTo = ratio * videoDuration;
      videoRef.current.currentTime = seekTo;
      setVideoCurrentTime(seekTo);
    },
    [videoDuration, videoRef],
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasVideo) {
        handleVideoScrubClick(e);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      onSeek(ratio * totalDuration);
    },
    [hasVideo, handleVideoScrubClick, totalDuration, onSeek],
  );

  const handleTogglePlay = useCallback(() => {
    onTogglePlay();
  }, [onTogglePlay]);

  // Text overlay drag handling
  const handleOverlayMouseDown = useCallback(
    (
      e: React.MouseEvent,
      overlayId: string,
      currentX: number,
      currentY: number,
    ) => {
      if (editingOverlay === overlayId) return;
      e.preventDefault();
      e.stopPropagation();
      const frame = frameRef.current;
      if (!frame) return;
      draggingOverlayRef.current = {
        id: overlayId,
        startX: e.clientX,
        startY: e.clientY,
        startOx: currentX,
        startOy: currentY,
      };
      const rect = frame.getBoundingClientRect();

      const onMouseMove = (me: MouseEvent) => {
        if (!draggingOverlayRef.current) return;
        const dx =
          ((me.clientX - draggingOverlayRef.current.startX) / rect.width) * 100;
        const dy =
          ((me.clientY - draggingOverlayRef.current.startY) / rect.height) *
          100;
        updateTextOverlay(overlayId, {
          x: Math.max(
            0,
            Math.min(100, draggingOverlayRef.current.startOx + dx),
          ),
          y: Math.max(
            0,
            Math.min(100, draggingOverlayRef.current.startOy + dy),
          ),
        });
      };

      const onMouseUp = () => {
        draggingOverlayRef.current = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [editingOverlay, updateTextOverlay],
  );

  // Effective duration and position
  const effectiveDuration = hasVideo
    ? videoDuration || totalDuration
    : totalDuration;
  const effectivePosition = hasVideo ? videoCurrentTime : playheadPosition;
  const progress =
    effectiveDuration > 0 ? (effectivePosition / effectiveDuration) * 100 : 0;

  const currentAR = ASPECT_RATIOS.find((a) => a.value === aspectRatio);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--elev-0)" }}
    >
      {/* Top bar: Aspect ratio selector */}
      <div
        className="flex items-center justify-end gap-1 px-3 py-1 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.23 0.026 230 / 0.5)" }}
      >
        <span className="text-label-xs text-muted-foreground mr-1">
          Aspect:
        </span>
        {ASPECT_RATIOS.map((ar) => (
          <button
            type="button"
            key={ar.value}
            onClick={() => setAspectRatio(ar.value)}
            data-ocid={`preview.aspect_ratio_${ar.label.replace(":", "x")}.button`}
            className={`px-2 py-0.5 rounded text-label-xs font-medium transition-all ${
              aspectRatio === ar.value
                ? "bg-teal/20 text-teal border border-teal/40"
                : "bg-white/3 text-muted-foreground border border-border hover:border-teal/30"
            }`}
          >
            {ar.label}
          </button>
        ))}
      </div>

      {/* Video Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
        <AnimatePresence mode="wait">
          {activeClip ? (
            <motion.div
              key={activeClip.id}
              ref={frameRef}
              className="relative rounded-lg overflow-hidden preview-frame"
              style={{
                aspectRatio,
                maxHeight: "100%",
                maxWidth: "100%",
                transition: "aspect-ratio 0.3s ease",
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              {/* Real video element */}
              {hasVideo ? (
                <video
                  ref={videoRef as React.RefObject<HTMLVideoElement>}
                  src={activeClip.blobUrl}
                  className="w-full h-full object-contain bg-black"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  loop={false}
                  playsInline
                  data-ocid="preview.canvas_target"
                >
                  {/* Caption track required for accessibility */}
                  <track kind="captions" />
                </video>
              ) : (
                /* Audio-only clip: visualizer placeholder */
                <div
                  className="w-full h-full flex flex-col items-center justify-center"
                  style={{ background: "oklch(0.09 0.018 233)" }}
                  data-ocid="preview.canvas_target"
                >
                  <AudioVisualizer isPlaying={isPlaying} />
                  <p
                    className="mt-3 text-xs font-medium"
                    style={{ color: "oklch(0.58 0.18 290)" }}
                  >
                    {activeClip.name}
                  </p>
                  <p
                    className="text-label-xs mt-1"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    Audio Track
                  </p>
                </div>
              )}

              {/* Text Overlays */}
              {textOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className="absolute select-none"
                  style={{
                    left: `${overlay.x}%`,
                    top: `${overlay.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 15,
                    cursor: editingOverlay === overlay.id ? "text" : "grab",
                  }}
                  onMouseEnter={() => setHoveredOverlay(overlay.id)}
                  onMouseLeave={() => setHoveredOverlay(null)}
                  onMouseDown={(e) =>
                    handleOverlayMouseDown(e, overlay.id, overlay.x, overlay.y)
                  }
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingOverlay(overlay.id);
                  }}
                >
                  {editingOverlay === overlay.id ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none px-1"
                      style={{
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                        textShadow:
                          "0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
                        fontWeight: "bold",
                        minWidth: "40px",
                        border: "1px dashed rgba(255,255,255,0.6)",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "2px",
                        cursor: "text",
                      }}
                      onBlur={(e) => {
                        updateTextOverlay(overlay.id, {
                          text: e.currentTarget.textContent || "Text",
                        });
                        setEditingOverlay(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setEditingOverlay(null);
                        }
                        e.stopPropagation();
                      }}
                    >
                      {overlay.text}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                        textShadow:
                          "0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
                        fontWeight: "bold",
                        userSelect: "none",
                      }}
                    >
                      {overlay.text}
                    </span>
                  )}
                  {/* Delete button on hover */}
                  {hoveredOverlay === overlay.id &&
                    editingOverlay !== overlay.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTextOverlay(overlay.id);
                        }}
                        className="absolute -top-3 -right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(239,68,68,0.85)",
                          border: "1px solid rgba(255,255,255,0.4)",
                          zIndex: 20,
                        }}
                        data-ocid="preview.overlay.delete_button"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    )}
                </div>
              ))}

              {/* Bottom gradient for controls readability */}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />

              {/* Top-right corner: resolution badge */}
              <div
                className="absolute top-2.5 right-2.5 text-label-xs font-bold px-1.5 py-0.5 rounded"
                style={{
                  color: "var(--teal-full)",
                  background: "oklch(0 0 0 / 0.55)",
                  border: "1px solid oklch(0.80 0.18 178 / 0.30)",
                }}
              >
                4K
              </div>

              {/* Aspect ratio label */}
              <div
                className="absolute top-2.5 left-2.5 text-label-xs font-mono px-1.5 py-0.5 rounded"
                style={{
                  color: "oklch(1 0 0 / 0.6)",
                  background: "oklch(0 0 0 / 0.45)",
                }}
              >
                {currentAR?.label}
              </div>

              {/* Bottom-left: timecode */}
              <div
                className="absolute bottom-2 left-2.5 font-mono text-label-xs"
                style={{ color: "oklch(1 0 0 / 0.75)" }}
              >
                {formatTime(effectivePosition)}
              </div>

              {/* Center play button (shown when paused) */}
              {!isPlaying && (
                <motion.button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={handleTogglePlay}
                  data-ocid="preview.play_button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.80 0.18 178 / 0.15)",
                      border: "1.5px solid oklch(0.80 0.18 178 / 0.55)",
                      backdropFilter: "blur(6px)",
                      boxShadow: "0 0 16px oklch(0.80 0.18 178 / 0.30)",
                    }}
                  >
                    <Play
                      className="w-5 h-5 fill-current ml-0.5"
                      style={{ color: "var(--teal-full)" }}
                    />
                  </div>
                </motion.button>
              )}

              {/* Subtle scanline texture */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, oklch(0 0 0 / 0.06) 3px, oklch(0 0 0 / 0.06) 4px)",
                  opacity: 0.6,
                }}
              />
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div
              key="empty"
              className="relative rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer group"
              style={{
                aspectRatio,
                maxHeight: "100%",
                maxWidth: "100%",
                border: "2px dashed oklch(0.80 0.18 178 / 0.25)",
                background: "oklch(0.082 0.016 233)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={triggerFileInput}
              whileHover={{
                borderColor: "oklch(0.80 0.18 178 / 0.50)",
                boxShadow: "0 0 30px oklch(0.80 0.18 178 / 0.10)",
              }}
              data-ocid="preview.canvas_target"
            >
              <motion.div
                className="flex flex-col items-center gap-3 px-6 text-center select-none"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.80 0.18 178 / 0.08)",
                    border: "1.5px solid oklch(0.80 0.18 178 / 0.30)",
                    boxShadow: "0 0 20px oklch(0.80 0.18 178 / 0.12)",
                  }}
                >
                  <Video
                    className="w-7 h-7"
                    style={{ color: "oklch(0.80 0.18 178)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "oklch(0.80 0.18 178)" }}
                  >
                    Import a video to get started
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    Click here or use Import Media in the left panel
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                  style={{
                    background: "oklch(0.80 0.18 178 / 0.10)",
                    border: "1px solid oklch(0.80 0.18 178 / 0.30)",
                  }}
                >
                  <Upload
                    className="w-3 h-3"
                    style={{ color: "oklch(0.80 0.18 178)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.80 0.18 178)" }}
                  >
                    Browse Files
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Playback Controls */}
      <div className="flex-shrink-0 px-4 pb-3 space-y-2">
        {/* Progress bar */}
        <div
          ref={progressRef}
          role="slider"
          aria-label="Playback position"
          aria-valuenow={Math.round(effectivePosition)}
          aria-valuemin={0}
          aria-valuemax={Math.round(effectiveDuration)}
          tabIndex={0}
          className="relative h-1 rounded-full cursor-pointer group"
          style={{ background: "oklch(0.22 0.026 230)" }}
          onClick={handleProgressClick}
          onKeyDown={(e) => {
            if (hasVideo && videoRef.current) {
              if (e.key === "ArrowRight")
                videoRef.current.currentTime = Math.min(
                  videoDuration,
                  videoCurrentTime + 5,
                );
              if (e.key === "ArrowLeft")
                videoRef.current.currentTime = Math.max(
                  0,
                  videoCurrentTime - 5,
                );
            } else {
              if (e.key === "ArrowRight")
                onSeek(Math.min(totalDuration, playheadPosition + 5));
              if (e.key === "ArrowLeft")
                onSeek(Math.max(0, playheadPosition - 5));
            }
          }}
          data-ocid="preview.scrubber.input"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, oklch(0.72 0.16 178), oklch(0.85 0.20 170))",
              boxShadow: "0 0 6px oklch(0.80 0.18 178 / 0.50)",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full -ml-1.25
                        opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{
              left: `${progress}%`,
              background: "oklch(0.90 0.20 172)",
              boxShadow: "0 0 6px oklch(0.80 0.18 178 / 0.80)",
            }}
          />
        </div>

        {/* Transport controls row */}
        <div className="flex items-center">
          <div className="flex items-center gap-0">
            <button
              type="button"
              onClick={() => {
                if (hasVideo && videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setVideoCurrentTime(0);
                } else {
                  onSeek(0);
                }
              }}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Rewind to start"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (hasVideo && videoRef.current) {
                  videoRef.current.currentTime = Math.max(
                    0,
                    videoCurrentTime - 5,
                  );
                } else {
                  onSeek(Math.max(0, playheadPosition - 5));
                }
              }}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Back 5s"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <motion.button
              type="button"
              onClick={handleTogglePlay}
              data-ocid="preview.primary_button"
              className="mx-1.5 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.17 178), oklch(0.83 0.20 170))",
                boxShadow: isPlaying
                  ? "0 2px 8px oklch(0 0 0 / 0.4), 0 0 14px oklch(0.80 0.18 178 / 0.50)"
                  : "0 2px 6px oklch(0 0 0 / 0.4)",
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
            >
              {isPlaying ? (
                <Pause
                  className="w-3.5 h-3.5 fill-current"
                  style={{ color: "oklch(0.09 0.018 233)" }}
                />
              ) : (
                <Play
                  className="w-3.5 h-3.5 fill-current ml-0.5"
                  style={{ color: "oklch(0.09 0.018 233)" }}
                />
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                if (hasVideo && videoRef.current) {
                  videoRef.current.currentTime = Math.min(
                    videoDuration,
                    videoCurrentTime + 5,
                  );
                } else {
                  onSeek(Math.min(totalDuration, playheadPosition + 5));
                }
              }}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Forward 5s"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (hasVideo && videoRef.current) {
                  videoRef.current.currentTime = videoDuration;
                } else {
                  onSeek(totalDuration);
                }
              }}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Skip to end"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timecode */}
          <div className="flex-1 text-center">
            <span
              className="text-label-xs font-mono"
              style={{ color: "oklch(0.56 0.038 222)" }}
            >
              <span style={{ color: "oklch(0.93 0.010 220)" }}>
                {formatTime(effectivePosition)}
              </span>
              {" / "}
              {formatTime(effectiveDuration)}
            </span>
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-0 relative">
            <div className="relative">
              <button
                type="button"
                className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowVolumeSlider((v) => !v)}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || localVolume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full right-0 mb-2 p-2 rounded-lg z-20"
                    style={{
                      background: "oklch(0.14 0.022 233)",
                      border: "1px solid oklch(0.26 0.028 228 / 0.45)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        className="text-label-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMuted((m) => !m)}
                      >
                        {isMuted ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : localVolume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setLocalVolume(v);
                          if (v > 0) setIsMuted(false);
                          if (videoRef.current) {
                            videoRef.current.volume = v;
                          }
                        }}
                        className="h-16 w-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          writingMode: "vertical-lr",
                          direction: "rtl",
                          background: `linear-gradient(to top, oklch(0.78 0.17 178) ${(isMuted ? 0 : localVolume) * 100}%, oklch(0.22 0.026 230) ${(isMuted ? 0 : localVolume) * 100}%)`,
                        }}
                        data-ocid="preview.volume.input"
                        aria-label="Volume"
                      />
                      <span
                        className="text-label-xs font-mono"
                        style={{ color: "oklch(0.55 0.04 220)" }}
                      >
                        {Math.round((isMuted ? 0 : localVolume) * 100)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                if (hasVideo && videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setVideoCurrentTime(0);
                } else {
                  onSeek(0);
                }
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-ocid="preview.fullscreen.button"
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                (
                  videoRef.current as HTMLVideoElement | null
                )?.requestFullscreen?.();
              }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio-only visualizer bars
function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = Array.from({ length: 20 }, (_, i) => ({
    h: 20 + ((i * 7 + 13) % 40),
    i,
  }));
  return (
    <div className="flex items-center gap-1 h-16">
      {bars.map(({ h, i }) => (
        <motion.div
          key={i}
          className="w-2 rounded-full"
          style={{
            background:
              "linear-gradient(to top, oklch(0.58 0.18 290), oklch(0.72 0.16 290 / 0.5))",
            height: `${h}px`,
          }}
          animate={
            isPlaying
              ? {
                  height: [
                    `${h}px`,
                    `${Math.min(h * 1.8, 60)}px`,
                    `${Math.max(h * 0.4, 8)}px`,
                    `${h}px`,
                  ],
                }
              : { height: `${h * 0.4}px` }
          }
          transition={{
            duration: 0.6 + (i % 5) * 0.15,
            repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default PreviewPanel;
