import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  CheckCircle2,
  ClipboardList,
  Download,
  Rocket,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const PLATFORM_TIPS = [
  {
    key: "youtube",
    label: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    tips: [
      "Add captions for +40% watch time",
      "First 30s are critical for retention",
      "Use 16:9 aspect ratio",
    ],
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: SiTiktok,
    color: "#69C9D0",
    tips: [
      "Hook in first 3 seconds",
      "Use trending audio",
      "9:16 vertical format only",
    ],
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: SiInstagram,
    color: "#E1306C",
    tips: [
      "4:5 ratio for feed posts",
      "Add subtitles — 80% watch muted",
      "Optimal time: 6-9 PM weekdays",
    ],
  },
];

const EXPORT_STAGES: Array<{ min: number; max: number; label: string }> = [
  { min: 0, max: 20, label: "Analyzing timeline..." },
  { min: 20, max: 50, label: "Rendering frames..." },
  { min: 50, max: 80, label: "Encoding video..." },
  { min: 80, max: 95, label: "Optimizing output..." },
  { min: 95, max: 100, label: "Finalizing..." },
];

function getExportStageLabel(progress: number): string {
  const stage = EXPORT_STAGES.find(
    (s) => progress >= s.min && progress < s.max,
  );
  if (progress >= 100) return "Finalizing...";
  return stage?.label ?? "Exporting...";
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("30");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [platforms, setPlatforms] = useState({
    instagram: false,
    youtube: true,
    tiktok: false,
  });
  const [checklistCopied, setChecklistCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setIsExporting(false);
      setExportProgress(0);
      setExportComplete(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [open]);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    intervalRef.current = setInterval(() => {
      setExportProgress((prev) => {
        const increment = Math.random() * 4 + 1;
        const next = Math.min(100, prev + increment);
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            setExportComplete(true);
            setIsExporting(false);
          }, 300);
        }
        return next;
      });
    }, 180);
  }, []);

  const handleFakeDownload = useCallback(() => {
    // Create a fake blob download
    const blob = new Blob(
      [
        `LuminarEdit Export
Resolution: ${resolution}
FPS: ${fps}
Export Time: ${new Date().toISOString()}

This is a simulated export file.
In production, this would contain the actual video data.`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luminar-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resolution, fps]);

  const togglePlatform = (p: keyof typeof platforms) => {
    setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const handleCopyChecklist = () => {
    const text = PLATFORM_TIPS.map(
      (p) => `${p.label}:\n${p.tips.map((t) => `  \u2022 ${t}`).join("\n")}`,
    ).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setChecklistCopied(true);
    setTimeout(() => setChecklistCopied(false), 2000);
  };

  const stageLabel = getExportStageLabel(exportProgress);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg glass border-border"
        data-ocid="export.dialog"
        style={{
          background: "oklch(0.12 0.022 233 / 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Video className="w-5 h-5 text-teal" />
            Export Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Resolution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">
                Resolution
              </Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger
                  data-ocid="export.resolution.select"
                  className="h-8 text-[12px] bg-input border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="2k">2K QHD</SelectItem>
                  <SelectItem value="4k">
                    <span className="flex items-center gap-1">
                      4K Ultra HD{" "}
                      <span className="text-[10px] text-teal bg-teal/20 px-1 rounded">
                        PRO
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">
                Frame Rate
              </Label>
              <Select value={fps} onValueChange={setFps}>
                <SelectTrigger
                  data-ocid="export.fps.select"
                  className="h-8 text-[12px] bg-input border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="24">24 fps (Cinematic)</SelectItem>
                  <SelectItem value="30">30 fps (Standard)</SelectItem>
                  <SelectItem value="60">
                    <span className="flex items-center gap-1">
                      60 fps{" "}
                      <span className="text-[10px] text-teal bg-teal/20 px-1 rounded">
                        PRO
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Optimization */}
          <div>
            <Label className="text-[11px] text-muted-foreground mb-2 block">
              Optimize for Platforms
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  key: "instagram" as const,
                  label: "Instagram",
                  icon: SiInstagram,
                  color: "#E1306C",
                },
                {
                  key: "youtube" as const,
                  label: "YouTube",
                  icon: SiYoutube,
                  color: "#FF0000",
                },
                {
                  key: "tiktok" as const,
                  label: "TikTok",
                  icon: SiTiktok,
                  color: "#000000",
                },
              ].map((p) => (
                <button
                  type="button"
                  key={p.key}
                  onClick={() => togglePlatform(p.key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded border transition-all ${
                    platforms[p.key]
                      ? "border-teal/60 bg-teal/10 text-teal"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-teal/30"
                  }`}
                >
                  <p.icon
                    className="w-4 h-4"
                    style={{ color: platforms[p.key] ? p.color : undefined }}
                  />
                  <span className="text-[10px] font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export options */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[12px] font-medium text-foreground">
                Remove Watermark
              </p>
              <p className="text-[10px] text-muted-foreground">
                Requires Pro subscription
              </p>
            </div>
            <Switch data-ocid="export.watermark.switch" disabled />
          </div>

          {/* Social Optimizer */}
          <div
            className="pt-3"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-teal" />
              <p className="text-[13px] font-semibold text-foreground">
                Social Optimizer
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_TIPS.map((pt) => (
                <div
                  key={pt.key}
                  className="rounded-lg border border-border p-2"
                  style={{ background: "oklch(0.10 0.018 233)" }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <pt.icon className="w-3 h-3" style={{ color: pt.color }} />
                    <span className="text-[10px] font-semibold text-foreground">
                      {pt.label}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {pt.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-1">
                        <CheckCircle
                          className="w-2.5 h-2.5 flex-shrink-0 mt-0.5"
                          style={{ color: pt.color, opacity: 0.8 }}
                        />
                        <span
                          className="text-muted-foreground leading-tight"
                          style={{ fontSize: "0.575rem" }}
                        >
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCopyChecklist}
              data-ocid="export.copy_checklist.button"
              className="w-full mt-2 py-1.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/30 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-all"
            >
              <ClipboardList className="w-3 h-3" />
              {checklistCopied ? "Copied!" : "Copy Checklist"}
            </button>
          </div>

          {/* Progress section */}
          <AnimatePresence>
            {(isExporting || exportComplete) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {exportComplete ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2 py-2"
                    data-ocid="export.success_state"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal" />
                      <span className="text-[12px] font-semibold text-teal">
                        Export complete! (simulated)
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Your video has been processed at {resolution}/{fps}fps
                    </p>
                    <motion.button
                      type="button"
                      onClick={handleFakeDownload}
                      data-ocid="export.download.button"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded text-[12px] font-semibold btn-gradient"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download File
                    </motion.button>
                  </motion.div>
                ) : (
                  <div data-ocid="export.loading_state">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ background: "oklch(0.78 0.17 178)" }}
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
                        <span className="text-[11px] text-muted-foreground">
                          {stageLabel}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-teal">
                        {Math.round(exportProgress)}%
                      </span>
                    </div>
                    <Progress value={exportProgress} className="h-2" />
                    {/* Stage indicators */}
                    <div className="flex justify-between mt-1.5">
                      {EXPORT_STAGES.map((stage) => {
                        const done = exportProgress >= stage.max;
                        const active =
                          exportProgress >= stage.min &&
                          exportProgress < stage.max;
                        return (
                          <div
                            key={stage.label}
                            className="flex flex-col items-center gap-0.5"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full transition-all"
                              style={{
                                background: done
                                  ? "oklch(0.78 0.17 178)"
                                  : active
                                    ? "oklch(0.78 0.17 178 / 0.6)"
                                    : "oklch(0.25 0.03 230)",
                                boxShadow: active
                                  ? "0 0 6px oklch(0.78 0.17 178 / 0.6)"
                                  : "none",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              data-ocid="export.cancel_button"
              className="flex-1 py-2 rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 text-[12px] font-medium transition-all"
            >
              {exportComplete ? "Close" : "Cancel"}
            </button>
            {!exportComplete && (
              <motion.button
                type="button"
                onClick={handleExport}
                data-ocid="export.confirm_button"
                disabled={isExporting}
                className="flex-1 py-2 rounded text-[12px] font-semibold flex items-center justify-center gap-1.5 btn-gradient disabled:opacity-50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? "Exporting..." : "Export Now"}
              </motion.button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportModal;
