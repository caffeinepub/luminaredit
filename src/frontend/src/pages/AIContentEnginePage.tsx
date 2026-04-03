import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Cpu,
  ExternalLink,
  FileVideo,
  Flame,
  Mic,
  Music,
  PenLine,
  Play,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiInstagram, SiTiktok, SiX, SiYoutube } from "react-icons/si";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type JobStatus = "queued" | "processing" | "done" | "failed";
type Tone = "viral" | "educational" | "cinematic" | "motivational" | "humorous";
type AspectRatio = "9:16" | "16:9";
type Duration = "15s" | "30s" | "60s" | "3min";
type VoiceStyle =
  | "natural"
  | "ai"
  | "announcer"
  | "dramatic"
  | "conversational"
  | "musical";
type Emotion = "sad" | "neutral" | "happy" | "energetic" | "excited";

interface SceneBreakdown {
  scene: number;
  visual: string;
  duration: string;
  transition: string;
}

interface GeneratedScript {
  id: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  scenes: SceneBreakdown[];
  hashtags: string[];
  viralityScore: number;
  hookStrength: number;
  ctaStrength: number;
  bestPlatforms: string[];
}

interface GeneratedVideo {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  duration: Duration;
  status: "rendering" | "ready";
  gradient: string;
  thumbnailStyle: string;
}

interface BulkJob {
  id: string;
  prompt: string;
  videoCount: number;
  tone: Tone;
  language: string;
  style: string;
  aspectRatio: AspectRatio;
  duration: Duration;
  status: JobStatus;
  progress: number;
  phase: string;
  scriptsGenerated: number;
  videosGenerated: number;
  scripts: GeneratedScript[];
  videos: GeneratedVideo[];
  createdAt: Date;
}

// ─── Fake Data Generators ────────────────────────────────────────────────────

const HOOKS_BY_TOPIC = [
  "This one habit changed everything for",
  "Nobody talks about this secret to",
  "I tried this for 30 days and",
  "The reason most people fail at",
  "What the top 1% know about",
  "Stop doing this if you want to master",
  "The biggest mistake beginners make with",
  "How I went from zero to pro in",
  "This simple trick 10x'd my results in",
  "The uncomfortable truth about",
  "Why everything you know about",
  "The science-backed method for",
  "What experts don't tell you about",
  "This went viral because of",
  "The underrated strategy behind",
];

const BODIES = [
  "Most people overlook the fundamentals and jump straight to advanced techniques. The key is consistency over perfection. Start with small wins and build momentum.",
  "The data doesn't lie — high performers share three core habits. First, they prioritize deep work. Second, they embrace failure as feedback. Third, they compound small gains.",
  "After analyzing hundreds of successful creators, we found one pattern: they all document their process. Authenticity beats perfection every single time.",
  "The paradox nobody talks about: slowing down actually speeds you up. When you focus on quality inputs, you get exponentially better outputs over time.",
  "Here's the framework I use: clarity first, then consistency, then community. Build in that order and you'll never run out of momentum.",
];

const CTAS = [
  "Follow for more weekly tips that actually work 🚀",
  "Drop a 🔥 if this helped — I post new content every week!",
  "Save this for later and share with someone who needs it!",
  "Comment your biggest challenge below — I read every reply!",
  "Hit subscribe and turn on notifications — you won't regret it!",
];

const SCENE_VISUALS = [
  "Cinematic opener with text overlay",
  "B-roll of creator in action",
  "Key point #1 with animated caption",
  "Testimonial or social proof clip",
  "Step-by-step demonstration",
  "Data visualization or chart",
  "Reaction/emotion close-up",
  "CTA screen with subscribe animation",
];

const TRANSITIONS = [
  "Smooth cut",
  "Zoom in/out",
  "Whip pan",
  "Cross-fade",
  "Glitch effect",
  "Slide wipe",
];

const HASHTAG_SETS = [
  ["#fyp", "#viral", "#trending", "#contentcreator", "#motivation"],
  ["#tiktoktips", "#growth", "#successmindset", "#hustle", "#level up"],
  ["#reels", "#youtube", "#shorts", "#explore", "#instagood"],
  ["#entrepreneur", "#creator", "#ai", "#digitallife", "#2026"],
];

const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.28 0.14 178), oklch(0.18 0.08 233))",
  "linear-gradient(135deg, oklch(0.30 0.17 290), oklch(0.18 0.08 233))",
  "linear-gradient(135deg, oklch(0.32 0.16 55), oklch(0.20 0.09 233))",
  "linear-gradient(135deg, oklch(0.26 0.15 340), oklch(0.18 0.08 233))",
  "linear-gradient(135deg, oklch(0.30 0.15 240), oklch(0.18 0.08 233))",
  "linear-gradient(135deg, oklch(0.28 0.14 120), oklch(0.18 0.08 233))",
];

function generateFakeScript(prompt: string, index: number): GeneratedScript {
  const hook = `${HOOKS_BY_TOPIC[index % HOOKS_BY_TOPIC.length]} ${prompt.split(" ").slice(0, 3).join(" ")}...`;
  const body = BODIES[index % BODIES.length];
  const cta = CTAS[index % CTAS.length];
  const sceneCount = 4 + (index % 3);
  const scenes: SceneBreakdown[] = Array.from(
    { length: sceneCount },
    (_, i) => ({
      scene: i + 1,
      visual: SCENE_VISUALS[i % SCENE_VISUALS.length],
      duration: `${3 + (i % 4)}s`,
      transition: TRANSITIONS[i % TRANSITIONS.length],
    }),
  );
  const viralityScore = 45 + Math.floor(Math.random() * 50);
  return {
    id: `script-${Date.now()}-${index}`,
    title: `${hook.split(" ").slice(0, 6).join(" ")} — Vol.${index + 1}`,
    hook,
    body,
    cta,
    scenes,
    hashtags: HASHTAG_SETS[index % HASHTAG_SETS.length],
    viralityScore,
    hookStrength: 50 + Math.floor(Math.random() * 45),
    ctaStrength: 40 + Math.floor(Math.random() * 55),
    bestPlatforms: ["TikTok", "Reels", "YouTube Shorts"].slice(
      0,
      1 + (index % 3),
    ),
  };
}

function generateFakeVideo(
  script: GeneratedScript,
  aspectRatio: AspectRatio,
  duration: Duration,
  index: number,
): GeneratedVideo {
  return {
    id: `video-${Date.now()}-${index}`,
    title: script.title,
    aspectRatio,
    duration,
    status: "ready",
    gradient: GRADIENTS[index % GRADIENTS.length],
    thumbnailStyle: `V${index + 1}`,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ViralityGauge({ score }: { score: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color =
    score >= 70
      ? "oklch(0.75 0.18 145)"
      : score >= 40
        ? "oklch(0.82 0.19 65)"
        : "oklch(0.62 0.22 25)";
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <title>Virality score gauge</title>
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke="oklch(0.18 0.022 233)"
        strokeWidth="8"
      />
      <motion.circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 40 40)"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text
        x="40"
        y="45"
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="bold"
        fontFamily="GeistMono, monospace"
      >
        {score}
      </text>
    </svg>
  );
}

const WAVEFORM_BARS = Array.from({ length: 24 }, (_, i) => ({
  id: `wfbar${i}`,
  delay: i * 0.05,
  duration: 0.6 + (i % 5) * 0.08,
  maxH: 8 + (i % 6) * 4,
}));

function WaveformAnimation() {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {WAVEFORM_BARS.map((bar) => (
        <motion.div
          key={bar.id}
          className="w-1 rounded-full flex-shrink-0"
          style={{ background: "var(--teal-full)" }}
          animate={{ height: [4, bar.maxH, 4] }}
          transition={{
            duration: bar.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: bar.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ScriptCard({
  script,
  onUseInEditor,
}: { script: GeneratedScript; onUseInEditor: () => void }) {
  const scoreColor =
    script.viralityScore >= 70
      ? "bg-emerald-500/20 text-emerald-400"
      : script.viralityScore >= 40
        ? "bg-amber-500/20 text-amber-400"
        : "bg-red-500/20 text-red-400";

  return (
    <motion.div
      className="rounded-xl border border-border p-4 flex flex-col gap-3"
      style={{ background: "var(--elev-2)" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: "oklch(0.8 0.18 178 / 0.4)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-label-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1">
          {script.title}
        </h4>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${scoreColor}`}
        >
          {script.viralityScore}
        </span>
      </div>

      {/* Hook */}
      <div
        className="rounded-lg p-2.5"
        style={{
          background: "oklch(0.8 0.18 178 / 0.08)",
          border: "1px solid oklch(0.8 0.18 178 / 0.2)",
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--teal-dim)" }}
        >
          🎣 Hook
        </p>
        <p className="text-label-xs text-foreground leading-relaxed">
          {script.hook}
        </p>
      </div>

      {/* Body */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
          Body
        </p>
        <p className="text-label-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {script.body}
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-lg p-2 bg-white/3 border border-border/60">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-muted-foreground">
          📢 CTA
        </p>
        <p className="text-label-xs text-foreground">{script.cta}</p>
      </div>

      {/* Scenes + Hashtags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
          {script.scenes.length} scenes
        </span>
        {script.hashtags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: "oklch(0.8 0.18 178 / 0.1)",
              color: "var(--teal-full)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
          onClick={() => {
            navigator.clipboard?.writeText(
              `${script.hook}\n\n${script.body}\n\n${script.cta}`,
            );
            toast.success("Script copied!");
          }}
          data-ocid="ai-engine.script.secondary_button"
        >
          <Copy className="w-3 h-3" /> Copy
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold btn-gradient transition-all"
          onClick={onUseInEditor}
          data-ocid="ai-engine.script.primary_button"
        >
          <PenLine className="w-3 h-3" /> Use in Editor
        </button>
      </div>
    </motion.div>
  );
}

function VideoCard({ video }: { video: GeneratedVideo }) {
  const isPortrait = video.aspectRatio === "9:16";
  return (
    <motion.div
      className="rounded-xl border border-border overflow-hidden"
      style={{ background: "var(--elev-2)" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ borderColor: "oklch(0.8 0.18 178 / 0.4)" }}
    >
      {/* Thumbnail */}
      <div
        className="relative flex items-center justify-center"
        style={{
          background: video.gradient,
          height: isPortrait ? "140px" : "90px",
        }}
      >
        <span
          className="text-2xl font-bold font-display opacity-30"
          style={{ color: "var(--teal-full)" }}
        >
          {video.thumbnailStyle}
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 left-2 flex gap-1">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-bold"
            style={{
              background: "oklch(0 0 0 / 0.6)",
              color: "var(--teal-full)",
            }}
          >
            {video.aspectRatio}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{
              background: "oklch(0 0 0 / 0.6)",
              color: "oklch(0.85 0.01 220)",
            }}
          >
            {video.duration}
          </span>
        </div>
        <div className="absolute bottom-2 right-2">
          {video.status === "ready" ? (
            <span
              className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded"
              style={{
                background: "oklch(0.75 0.18 145 / 0.25)",
                color: "oklch(0.75 0.18 145)",
              }}
            >
              <CheckCircle2 className="w-2.5 h-2.5" /> Ready
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded"
              style={{
                background: "oklch(0.82 0.19 65 / 0.25)",
                color: "oklch(0.82 0.19 65)",
              }}
            >
              <Clock className="w-2.5 h-2.5" /> Rendering
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-label-xs text-foreground font-medium line-clamp-2 mb-2 leading-snug">
          {video.title}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] border border-border text-muted-foreground hover:text-foreground transition-all"
            onClick={() => toast.success("Video exported!")}
            data-ocid="ai-engine.video.secondary_button"
          >
            <ExternalLink className="w-3 h-3" /> Export
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] border border-border text-muted-foreground hover:text-foreground transition-all"
            onClick={() => toast.success("Scheduled for publishing!")}
            data-ocid="ai-engine.video.primary_button"
          >
            <Calendar className="w-3 h-3" /> Schedule
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIContentEnginePage() {
  // Control panel state
  const [prompt, setPrompt] = useState("");
  const [videoCount, setVideoCount] = useState(50);
  const [tone, setTone] = useState<Tone>("viral");
  const [style, setStyle] = useState("trendy");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>("30s");
  const [language, setLanguage] = useState("English");

  // Voice engine state
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("natural");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [voicePanelOpen, setVoicePanelOpen] = useState(true);
  const [publishPanelOpen, setPublishPanelOpen] = useState(true);

  // Auto-publish state
  const [publishTargets, setPublishTargets] = useState({
    instagram: false,
    youtube: false,
    tiktok: false,
    twitter: false,
  });

  // Jobs state
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [resultsTab, setResultsTab] = useState<"scripts" | "videos">("scripts");
  const [selectedScriptForViral, setSelectedScriptForViral] =
    useState<GeneratedScript | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first!");
      return;
    }

    const jobId = `job-${Date.now()}`;
    const newJob: BulkJob = {
      id: jobId,
      prompt: prompt.trim(),
      videoCount,
      tone,
      language,
      style,
      aspectRatio,
      duration,
      status: "processing",
      progress: 0,
      phase: "Initializing...",
      scriptsGenerated: 0,
      videosGenerated: 0,
      scripts: [],
      videos: [],
      createdAt: new Date(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(jobId);

    const phases = [
      {
        from: 0,
        to: 20,
        duration: 2000,
        label: "Analyzing prompt & generating scripts...",
      },
      {
        from: 20,
        to: 50,
        duration: 3000,
        label: "Creating scene breakdowns...",
      },
      {
        from: 50,
        to: 80,
        duration: 3000,
        label: "Generating AI visuals & voice...",
      },
      {
        from: 80,
        to: 100,
        duration: 2000,
        label: "Finalizing & optimizing...",
      },
    ];

    let phaseIndex = 0;
    let startTime = Date.now();
    let _phaseStart = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const phase = phases[phaseIndex];
      const elapsed = Date.now() - startTime;
      const phasePct = Math.min(elapsed / phase.duration, 1);
      const progress = phase.from + phasePct * (phase.to - phase.from);
      const scriptCount = Math.floor(
        (progress / 100) * Math.min(videoCount, 20),
      );
      const videoCountGen =
        progress >= 80
          ? Math.floor(((progress - 80) / 20) * Math.min(videoCount, 20))
          : 0;

      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                progress: Math.round(progress),
                phase: phase.label,
                scriptsGenerated: scriptCount,
                videosGenerated: videoCountGen,
              }
            : j,
        ),
      );

      if (phasePct >= 1) {
        phaseIndex++;
        startTime = Date.now();
        _phaseStart = progress;

        if (phaseIndex >= phases.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const scriptTotal = Math.min(videoCount, 20);
          const scripts = Array.from({ length: scriptTotal }, (_, i) =>
            generateFakeScript(prompt, i),
          );
          const videos = scripts.map((s, i) =>
            generateFakeVideo(s, aspectRatio, duration, i),
          );

          setJobs((prev) =>
            prev.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: "done",
                    progress: 100,
                    phase: "Complete!",
                    scriptsGenerated: scriptTotal,
                    videosGenerated: scriptTotal,
                    scripts,
                    videos,
                  }
                : j,
            ),
          );
          toast.success(`✅ ${videoCount} videos generated successfully!`);
        }
      }
    }, 100);
  }, [prompt, videoCount, tone, language, style, aspectRatio, duration]);

  const deleteJob = useCallback(
    (jobId: string) => {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (selectedJobId === jobId) setSelectedJobId(null);
    },
    [selectedJobId],
  );

  const handlePreviewVoice = () => {
    setIsPreviewingVoice(true);
    setTimeout(() => setIsPreviewingVoice(false), 2000);
  };

  const isGenerating = jobs.some((j) => j.status === "processing");

  const TONE_OPTIONS: { id: Tone; label: string; emoji: string }[] = [
    { id: "viral", label: "Viral", emoji: "🔥" },
    { id: "educational", label: "Educational", emoji: "📚" },
    { id: "cinematic", label: "Cinematic", emoji: "🎬" },
    { id: "motivational", label: "Motivational", emoji: "⚡" },
    { id: "humorous", label: "Humorous", emoji: "😄" },
  ];

  const VOICE_STYLES: { id: VoiceStyle; label: string; emoji: string }[] = [
    { id: "natural", label: "Natural", emoji: "🎙" },
    { id: "ai", label: "AI Enhanced", emoji: "🤖" },
    { id: "announcer", label: "Announcer", emoji: "📢" },
    { id: "dramatic", label: "Dramatic", emoji: "🎭" },
    { id: "conversational", label: "Conversational", emoji: "💬" },
    { id: "musical", label: "Musical", emoji: "🎵" },
  ];

  const EMOTIONS: { id: Emotion; label: string; emoji: string }[] = [
    { id: "sad", label: "Sad", emoji: "😔" },
    { id: "neutral", label: "Neutral", emoji: "😐" },
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "energetic", label: "Energetic", emoji: "⚡" },
    { id: "excited", label: "Excited", emoji: "🤩" },
  ];

  const emotionIndex = EMOTIONS.findIndex((e) => e.id === emotion);
  const currentEmotion = EMOTIONS[emotionIndex];

  return (
    <div className="h-full flex overflow-hidden" data-ocid="ai-engine.page">
      {/* ─── Left Column: Control Panel ─── */}
      <ScrollArea
        className="w-80 flex-shrink-0 h-full"
        style={{ borderRight: "1px solid oklch(0.23 0.026 230 / 0.7)" }}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center teal-pulse"
              style={{
                background: "oklch(0.8 0.18 178 / 0.15)",
                border: "1px solid oklch(0.8 0.18 178 / 0.4)",
              }}
            >
              <Cpu className="w-4 h-4" style={{ color: "var(--teal-full)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-label-base font-bold font-display gradient-text">
                  AI Engine Pro
                </h2>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.8 0.18 178 / 0.15)",
                    color: "var(--teal-full)",
                    border: "1px solid oklch(0.8 0.18 178 / 0.3)",
                  }}
                >
                  FREE
                </span>
              </div>
              <p className="text-label-xs text-muted-foreground">
                Bulk Video Generator
              </p>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Prompt
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video topic or niche... e.g. 'fitness motivation for beginners 2026'"
              className="resize-none text-[12px] bg-input border-border h-20 leading-relaxed"
              data-ocid="ai-engine.prompt.textarea"
            />
          </div>

          {/* Video Count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Video Count
              </Label>
              <span className="text-2xl font-bold font-display gradient-text">
                {videoCount}
              </span>
            </div>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[videoCount]}
              onValueChange={([v]) => setVideoCount(v)}
              className="w-full"
              data-ocid="ai-engine.video_count.input"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground/60">10</span>
              <span className="text-[10px] text-muted-foreground/60">500+</span>
            </div>
          </div>

          {/* Tone */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Tone
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  data-ocid="ai-engine.tone.toggle"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    tone === t.id
                      ? "text-black font-semibold btn-gradient"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-teal/40"
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Style Preset
            </Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger
                className="h-8 text-[12px] bg-input border-border"
                data-ocid="ai-engine.style.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["trendy", "minimal", "cinematic", "bold", "educational"].map(
                  (s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="text-[12px] capitalize"
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Aspect Ratio
            </Label>
            <div className="flex gap-2">
              {(["9:16", "16:9"] as const).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  data-ocid="ai-engine.aspect_ratio.toggle"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium border transition-all ${
                    aspectRatio === ar
                      ? "border-teal/60 text-teal"
                      : "border-border text-muted-foreground hover:border-teal/30 hover:text-foreground"
                  }`}
                  style={
                    aspectRatio === ar
                      ? { background: "oklch(0.8 0.18 178 / 0.08)" }
                      : {}
                  }
                >
                  <div
                    className="border border-current rounded-sm flex-shrink-0"
                    style={
                      ar === "9:16"
                        ? { width: 8, height: 14 }
                        : { width: 14, height: 8 }
                    }
                  />
                  {ar === "9:16" ? "Shorts" : "Landscape"}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Duration
            </Label>
            <div className="flex gap-1.5">
              {(["15s", "30s", "60s", "3min"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  data-ocid="ai-engine.duration.toggle"
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    duration === d
                      ? "border-teal/60 text-teal btn-gradient text-black"
                      : "border-border text-muted-foreground hover:border-teal/30"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                className="h-8 text-[12px] bg-input border-border"
                data-ocid="ai-engine.language.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {[
                  "English",
                  "Spanish",
                  "French",
                  "Portuguese",
                  "Hindi",
                  "Arabic",
                  "Japanese",
                  "Korean",
                  "German",
                  "Italian",
                ].map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-[12px]">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CTA Button */}
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            data-ocid="ai-engine.generate.primary_button"
            className="w-full py-3.5 rounded-xl text-[14px] font-bold btn-gradient flex items-center justify-center gap-2 teal-glow disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={isGenerating ? {} : { scale: 1.02 }}
            whileTap={isGenerating ? {} : { scale: 0.98 }}
            animate={
              isGenerating
                ? {}
                : {
                    boxShadow: [
                      "0 0 8px oklch(0.8 0.18 178 / 0.3)",
                      "0 0 20px oklch(0.8 0.18 178 / 0.6)",
                      "0 0 8px oklch(0.8 0.18 178 / 0.3)",
                    ],
                  }
            }
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Generate {videoCount} Videos
              </>
            )}
          </motion.button>

          <p className="text-[10px] text-center text-muted-foreground/60">
            100% Free · Background Processing · Auto-Save
          </p>
        </div>
      </ScrollArea>

      {/* ─── Center Column: Jobs + Results ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Jobs Section */}
        <div
          className="flex-shrink-0 p-4"
          style={{
            borderBottom: "1px solid oklch(0.23 0.026 230 / 0.7)",
            background: "var(--elev-1)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-label-base font-semibold text-foreground flex items-center gap-2">
              <FileVideo
                className="w-4 h-4"
                style={{ color: "var(--teal-full)" }}
              />
              Bulk Jobs
            </h3>
            <Button
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="h-7 text-[11px] border-border text-muted-foreground hover:text-foreground"
              onClick={() => setPrompt("")}
              data-ocid="ai-engine.new_job.button"
            >
              + New Job
            </Button>
          </div>

          {jobs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-6 gap-2"
              data-ocid="ai-engine.jobs.empty_state"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.8 0.18 178 / 0.08)",
                  border: "1px solid oklch(0.8 0.18 178 / 0.2)",
                }}
              >
                <Wand2
                  className="w-5 h-5"
                  style={{ color: "var(--teal-dim)" }}
                />
              </div>
              <p className="text-[12px] text-muted-foreground">
                No jobs yet. Enter a prompt and generate!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  className={`rounded-lg border p-3 cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? "border-teal/50"
                      : "border-border hover:border-border/80"
                  }`}
                  style={{
                    background:
                      selectedJobId === job.id
                        ? "oklch(0.8 0.18 178 / 0.06)"
                        : "var(--elev-2)",
                  }}
                  onClick={() => setSelectedJobId(job.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  data-ocid={`ai-engine.jobs.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        job.status === "done"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : job.status === "processing"
                            ? "bg-amber-500/20 text-amber-400"
                            : job.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {job.status === "processing"
                        ? "⚙ Processing"
                        : job.status === "done"
                          ? "✓ Done"
                          : job.status === "failed"
                            ? "✗ Failed"
                            : "◎ Queued"}
                    </span>
                    <p className="text-[11px] text-foreground truncate flex-1 font-medium">
                      {job.prompt}
                    </p>
                    <button
                      type="button"
                      className="p-1 rounded text-muted-foreground/50 hover:text-red-400 transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJob(job.id);
                      }}
                      data-ocid="ai-engine.jobs.delete_button"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {job.videoCount} videos · {job.tone} · {job.language}
                  </p>
                  {job.status === "processing" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">
                          {job.phase}
                        </span>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: "var(--teal-dim)" }}
                        >
                          {job.progress}%
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--elev-3)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, var(--teal-dim), var(--teal-full))",
                          }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {job.scriptsGenerated}/{Math.min(job.videoCount, 20)}{" "}
                        scripts · {job.videosGenerated}/
                        {Math.min(job.videoCount, 20)} videos
                      </p>
                    </div>
                  )}
                  {job.status === "done" && (
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "var(--teal-dim)" }}
                    >
                      {job.scriptsGenerated} scripts · {job.videosGenerated}{" "}
                      videos · {timeAgo(job.createdAt)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="flex-1 overflow-hidden">
          {selectedJob &&
          selectedJob.status === "done" &&
          selectedJob.scripts.length > 0 ? (
            <div className="h-full flex flex-col">
              <div
                className="p-4 flex-shrink-0"
                style={{
                  borderBottom: "1px solid oklch(0.23 0.026 230 / 0.5)",
                }}
              >
                <Tabs
                  value={resultsTab}
                  onValueChange={(v) =>
                    setResultsTab(v as "scripts" | "videos")
                  }
                >
                  <TabsList className="h-8 bg-muted/40">
                    <TabsTrigger
                      value="scripts"
                      className="text-[12px] h-7"
                      data-ocid="ai-engine.results.tab"
                    >
                      <PenLine className="w-3 h-3 mr-1.5" />
                      Scripts ({selectedJob.scripts.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="videos"
                      className="text-[12px] h-7"
                      data-ocid="ai-engine.results.tab"
                    >
                      <Play className="w-3 h-3 mr-1.5" />
                      Videos ({selectedJob.videos.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {resultsTab === "scripts" ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {selectedJob.scripts.map((script) => (
                        <ScriptCard
                          key={script.id}
                          script={script}
                          onUseInEditor={() => {
                            setSelectedScriptForViral(script);
                            toast.success("Script loaded in editor!");
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                      {selectedJob.videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : selectedJob && selectedJob.status === "processing" ? (
            <div
              className="h-full flex flex-col items-center justify-center gap-4"
              data-ocid="ai-engine.generation.loading_state"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center teal-pulse"
                style={{
                  background: "oklch(0.8 0.18 178 / 0.12)",
                  border: "1px solid oklch(0.8 0.18 178 / 0.35)",
                }}
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Cpu
                  className="w-7 h-7"
                  style={{ color: "var(--teal-full)" }}
                />
              </motion.div>
              <div className="text-center">
                <p className="text-label-base font-semibold text-foreground">
                  {selectedJob.phase}
                </p>
                <p className="text-label-xs text-muted-foreground mt-1">
                  Generating {selectedJob.videoCount} videos ·{" "}
                  {selectedJob.progress}% complete
                </p>
              </div>
              <div
                className="w-64 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--elev-3)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--teal-dim), var(--teal-full))",
                  }}
                  animate={{ width: `${selectedJob.progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center gap-3"
              data-ocid="ai-engine.results.empty_state"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "oklch(0.8 0.18 178 / 0.07)",
                  border: "1px solid oklch(0.8 0.18 178 / 0.18)",
                }}
              >
                <Sparkles
                  className="w-6 h-6"
                  style={{ color: "var(--teal-dim)" }}
                />
              </div>
              <p className="text-[13px] text-muted-foreground font-medium">
                Select a completed job to view results
              </p>
              <p className="text-[11px] text-muted-foreground/60">
                Scripts, videos, and analytics will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right Column: Voice + Viral + Publish ─── */}
      <ScrollArea
        className="w-72 flex-shrink-0 h-full"
        style={{ borderLeft: "1px solid oklch(0.23 0.026 230 / 0.7)" }}
      >
        <div className="p-4 space-y-4">
          {/* Voice Engine Panel */}
          <div
            className="rounded-xl border border-border overflow-hidden"
            style={{ background: "var(--elev-2)" }}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 hover:bg-white/3 transition-colors"
              onClick={() => setVoicePanelOpen((v) => !v)}
              data-ocid="ai-engine.voice_panel.toggle"
            >
              <div className="flex items-center gap-2">
                <Mic
                  className="w-4 h-4"
                  style={{ color: "var(--teal-full)" }}
                />
                <span className="text-label-sm font-semibold">
                  Voice Engine
                </span>
              </div>
              {voicePanelOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {voicePanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3">
                    {/* Voice styles */}
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Voice Style
                      </Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {VOICE_STYLES.map((vs) => (
                          <button
                            key={vs.id}
                            type="button"
                            onClick={() => setVoiceStyle(vs.id)}
                            data-ocid="ai-engine.voice_style.toggle"
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                              voiceStyle === vs.id
                                ? "border-teal/50 text-teal"
                                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                            }`}
                            style={
                              voiceStyle === vs.id
                                ? { background: "oklch(0.8 0.18 178 / 0.08)" }
                                : {}
                            }
                          >
                            <span>{vs.emoji}</span>
                            <span className="truncate">{vs.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Clone */}
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Voice Clone
                      </Label>
                      <button
                        type="button"
                        className="w-full border border-dashed border-border rounded-lg p-3 flex flex-col items-center gap-1.5 text-center hover:border-teal/30 transition-all group"
                        onClick={() =>
                          toast.success("Voice sample uploaded! (simulated)")
                        }
                        data-ocid="ai-engine.voice_clone.upload_button"
                      >
                        <Upload className="w-4 h-4 text-muted-foreground/60 group-hover:text-teal transition-colors" />
                        <span className="text-[10px] text-muted-foreground">
                          Upload Voice Sample
                        </span>
                        <span className="text-[9px] text-muted-foreground/50">
                          .mp3 or .wav, 5–30s
                        </span>
                      </button>
                    </div>

                    {/* Emotion */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Emotion
                        </Label>
                        <span className="text-[14px]">
                          {currentEmotion?.emoji}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={4}
                        step={1}
                        value={[emotionIndex]}
                        onValueChange={([v]) => setEmotion(EMOTIONS[v].id)}
                        className="w-full"
                        data-ocid="ai-engine.emotion.input"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-muted-foreground/60">
                          Sad
                        </span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: "var(--teal-dim)" }}
                        >
                          {currentEmotion?.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60">
                          Excited
                        </span>
                      </div>
                    </div>

                    {/* Language display */}
                    <div
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                      style={{ background: "var(--elev-3)" }}
                    >
                      <span className="text-[11px] text-muted-foreground">
                        Language
                      </span>
                      <span className="text-[11px] font-medium text-foreground">
                        {language}
                      </span>
                    </div>

                    {/* Preview button */}
                    <button
                      type="button"
                      className="w-full py-2 rounded-lg text-[11px] font-medium border border-border flex items-center justify-center gap-2 hover:border-teal/40 hover:text-foreground text-muted-foreground transition-all"
                      onClick={handlePreviewVoice}
                      data-ocid="ai-engine.voice_preview.button"
                    >
                      {isPreviewingVoice ? (
                        <WaveformAnimation />
                      ) : (
                        <>
                          <Music className="w-3.5 h-3.5" /> Preview Voice
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Viral Optimizer Panel */}
          <div
            className="rounded-xl border border-border overflow-hidden"
            style={{ background: "var(--elev-2)" }}
          >
            <div className="flex items-center gap-2 p-3">
              <Flame
                className="w-4 h-4"
                style={{ color: "oklch(0.82 0.19 65)" }}
              />
              <span className="text-label-sm font-semibold">
                Viral Optimizer
              </span>
            </div>
            <div className="px-3 pb-3 space-y-3">
              {selectedScriptForViral ? (
                <>
                  <div className="flex items-center gap-3">
                    <ViralityGauge
                      score={selectedScriptForViral.viralityScore}
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">
                            Hook Strength
                          </span>
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: "var(--teal-dim)" }}
                          >
                            {selectedScriptForViral.hookStrength}%
                          </span>
                        </div>
                        <Progress
                          value={selectedScriptForViral.hookStrength}
                          className="h-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">
                            CTA Strength
                          </span>
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: "var(--teal-dim)" }}
                          >
                            {selectedScriptForViral.ctaStrength}%
                          </span>
                        </div>
                        <Progress
                          value={selectedScriptForViral.ctaStrength}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Top Hashtags
                      </span>
                      <button
                        type="button"
                        className="text-[10px] flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            selectedScriptForViral.hashtags.join(" "),
                          );
                          toast.success("Hashtags copied!");
                        }}
                        data-ocid="ai-engine.hashtags.secondary_button"
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedScriptForViral.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(0.8 0.18 178 / 0.1)",
                            color: "var(--teal-full)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Best Platforms
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedScriptForViral.bestPlatforms.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="text-[10px] border-border"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-5 gap-2"
                  data-ocid="ai-engine.viral.empty_state"
                >
                  <Flame
                    className="w-6 h-6"
                    style={{ color: "oklch(0.82 0.19 65 / 0.4)" }}
                  />
                  <p className="text-[11px] text-muted-foreground/70 text-center">
                    Use a script in the editor to see virality analysis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Auto-Publish Panel */}
          <div
            className="rounded-xl border border-border overflow-hidden"
            style={{ background: "var(--elev-2)" }}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 hover:bg-white/3 transition-colors"
              onClick={() => setPublishPanelOpen((v) => !v)}
              data-ocid="ai-engine.publish_panel.toggle"
            >
              <div className="flex items-center gap-2">
                <Calendar
                  className="w-4 h-4"
                  style={{ color: "var(--teal-full)" }}
                />
                <span className="text-label-sm font-semibold">
                  Auto-Publish
                </span>
              </div>
              {publishPanelOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {publishPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2">
                    {(
                      [
                        {
                          id: "instagram" as const,
                          label: "Instagram",
                          Icon: SiInstagram,
                          color: "#E1306C",
                          time: "6pm, 9pm",
                        },
                        {
                          id: "youtube" as const,
                          label: "YouTube",
                          Icon: SiYoutube,
                          color: "#FF0000",
                          time: "2pm, 5pm",
                        },
                        {
                          id: "tiktok" as const,
                          label: "TikTok",
                          Icon: SiTiktok,
                          color: "#69C9D0",
                          time: "7am, 7pm",
                        },
                        {
                          id: "twitter" as const,
                          label: "Twitter",
                          Icon: SiX,
                          color: "#1DA1F2",
                          time: "12pm, 6pm",
                        },
                      ] as const
                    ).map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center gap-2 p-2 rounded-lg transition-all"
                        style={
                          publishTargets[platform.id]
                            ? { background: "var(--elev-3)" }
                            : {}
                        }
                      >
                        <platform.Icon
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: platform.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground">
                            {platform.label}
                          </p>
                          {publishTargets[platform.id] && (
                            <p className="text-[10px] text-muted-foreground">
                              Best: {platform.time}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={publishTargets[platform.id]}
                          onCheckedChange={(checked) =>
                            setPublishTargets((prev) => ({
                              ...prev,
                              [platform.id]: checked,
                            }))
                          }
                          className="scale-75"
                          data-ocid="ai-engine.publish.switch"
                        />
                      </div>
                    ))}

                    <motion.button
                      type="button"
                      className="w-full py-2 rounded-lg text-[11px] font-semibold btn-gradient mt-1 flex items-center justify-center gap-2 disabled:opacity-40"
                      disabled={!Object.values(publishTargets).some(Boolean)}
                      onClick={() =>
                        toast.success("Videos scheduled for publishing!")
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-ocid="ai-engine.schedule_all.button"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule All
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Automation Stats */}
          <div
            className="rounded-xl border border-border p-3 space-y-2"
            style={{ background: "var(--elev-2)" }}
          >
            <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: "var(--teal-full)" }}
              />
              AI Automation Active
            </p>
            {[
              {
                label: "Auto-Edit",
                desc: "Cuts, zooms, transitions",
                on: true,
              },
              { label: "Beat Sync", desc: "Music-matched cuts", on: true },
              { label: "Auto Captions", desc: "Keyword highlights", on: true },
              { label: "Thumbnail AI", desc: "Auto-generated", on: true },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: "var(--teal-full)" }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-foreground font-medium">
                    {feat.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">
                    {feat.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Performance info */}
          <div
            className="rounded-xl border border-border p-3"
            style={{ background: "var(--elev-2)" }}
          >
            <p className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <AlertCircle
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.82 0.19 65)" }}
              />
              Processing Info
            </p>
            <div className="space-y-1.5">
              {[
                { label: "Queue", value: "Parallel (8 workers)" },
                { label: "Storage", value: "Auto-Save to Cloud" },
                { label: "Max Batch", value: "500 videos" },
                { label: "Formats", value: "MP4, MOV, WebM" },
              ].map((info) => (
                <div key={info.label} className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {info.label}
                  </span>
                  <span className="text-[10px] text-foreground font-medium">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default AIContentEnginePage;
