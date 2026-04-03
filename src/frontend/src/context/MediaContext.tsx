import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ExternalBlob } from "../backend";

export interface MediaClip {
  id: string;
  name: string;
  type: "video" | "audio";
  blobUrl: string;
  duration?: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  color: string;
}

export interface UploadProgress {
  filename: string;
  percentage: number;
}

interface MediaContextValue {
  clips: MediaClip[];
  activeClipId: string | null;
  setActiveClipId: (id: string | null) => void;
  uploadProgress: UploadProgress | null;
  triggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  // Shared video ref
  videoRef: React.RefObject<HTMLVideoElement | null>;
  // Video filter (CSS filter string)
  videoFilter: string;
  setVideoFilter: (f: string) => void;
  // Playback rate
  playbackRate: number;
  setPlaybackRate: (r: number) => void;
  // Master volume
  masterVolume: number;
  setMasterVolume: (v: number) => void;
  // Text overlays
  textOverlays: TextOverlay[];
  addTextOverlay: (overlay?: Partial<TextOverlay>) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
}

const MediaContext = createContext<MediaContextValue | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [clips, setClips] = useState<MediaClip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const [videoFilter, setVideoFilter] = useState<string>("none");
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [masterVolume, setMasterVolume] = useState<number>(1);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so same file can be re-selected
      e.target.value = "";

      const isAudio = file.type.startsWith("audio/");
      const clipType: "video" | "audio" = isAudio ? "audio" : "video";

      setUploadProgress({ filename: file.name, percentage: 0 });

      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => {
          setUploadProgress({ filename: file.name, percentage: pct });
        });

        const url = blob.getDirectURL();

        const newClip: MediaClip = {
          id: `mc_${Date.now()}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          type: clipType,
          blobUrl: url,
        };

        // Probe duration
        if (clipType === "video") {
          const video = document.createElement("video");
          video.preload = "metadata";
          video.src = url;
          video.onloadedmetadata = () => {
            newClip.duration = video.duration;
            video.src = "";
          };
        } else {
          const audio = document.createElement("audio");
          audio.preload = "metadata";
          audio.src = url;
          audio.onloadedmetadata = () => {
            newClip.duration = audio.duration;
            audio.src = "";
          };
        }

        setClips((prev) => [...prev, newClip]);
        setActiveClipId(newClip.id);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploadProgress(null);
      }
    },
    [],
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const addTextOverlay = useCallback((overlay?: Partial<TextOverlay>) => {
    const newOverlay: TextOverlay = {
      id: `to_${Date.now()}`,
      text: "Text",
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#ffffff",
      ...overlay,
    };
    setTextOverlays((prev) => [...prev, newOverlay]);
  }, []);

  const updateTextOverlay = useCallback(
    (id: string, updates: Partial<TextOverlay>) => {
      setTextOverlays((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      );
    },
    [],
  );

  const removeTextOverlay = useCallback((id: string) => {
    setTextOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return (
    <MediaContext.Provider
      value={{
        clips,
        activeClipId,
        setActiveClipId,
        uploadProgress,
        triggerFileInput,
        fileInputRef,
        videoRef,
        videoFilter,
        setVideoFilter,
        playbackRate,
        setPlaybackRate,
        masterVolume,
        setMasterVolume,
        textOverlays,
        addTextOverlay,
        updateTextOverlay,
        removeTextOverlay,
      }}
    >
      {children}
      {/* Hidden file input managed globally — tabIndex -1 keeps it out of focus order */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleFileChange}
        tabIndex={-1}
      />
      {/* Upload progress overlay */}
      {uploadProgress && <UploadProgressOverlay progress={uploadProgress} />}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used within MediaProvider");
  return ctx;
}

function UploadProgressOverlay({ progress }: { progress: UploadProgress }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{ minWidth: "320px", maxWidth: "480px", width: "90vw" }}
      data-ocid="upload.loading_state"
    >
      <div
        className="rounded-xl px-4 py-3 shadow-2xl"
        style={{
          background: "oklch(0.13 0.022 233 / 0.96)",
          border: "1px solid oklch(0.80 0.18 178 / 0.40)",
          backdropFilter: "blur(16px)",
          boxShadow:
            "0 8px 32px oklch(0 0 0 / 0.6), 0 0 20px oklch(0.80 0.18 178 / 0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.80 0.18 178)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.80 0.18 178)" }}
            >
              Uploading
            </span>
          </div>
          <span
            className="text-xs font-mono font-bold"
            style={{ color: "oklch(0.88 0.20 172)" }}
          >
            {progress.percentage}%
          </span>
        </div>
        <p
          className="text-xs mb-2 truncate"
          style={{ color: "oklch(0.70 0.03 220)" }}
        >
          {progress.filename}
        </p>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "oklch(0.18 0.024 233)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress.percentage}%`,
              background:
                "linear-gradient(90deg, oklch(0.72 0.16 178), oklch(0.88 0.20 172))",
              boxShadow: "0 0 8px oklch(0.80 0.18 178 / 0.60)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
