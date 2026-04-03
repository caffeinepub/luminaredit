import { Label } from "@/components/ui/label";
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
import {
  Brain,
  CheckCheck,
  Copy,
  Cpu,
  Diamond,
  Loader2,
  Mic,
  Music,
  Palette,
  Plus,
  RotateCw,
  Scan,
  Sparkles,
  Video,
  Volume2,
  Wand2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMedia } from "../context/MediaContext";
import { MOCK_BEAT_MARKERS, MOCK_MUSIC_TRACKS } from "../data/mockData";

interface AiFeatureToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  isPro: boolean;
}

const SUBTITLE_STYLES = [
  { id: "bold", label: "Bold Pop" },
  { id: "minimal", label: "Minimal" },
  { id: "neon", label: "Neon" },
  { id: "karaoke", label: "Karaoke" },
];

const CHROMA_PRESETS = [
  { color: "#00FF00", label: "Green" },
  { color: "#0000FF", label: "Blue" },
  { color: "#FFFFFF", label: "White" },
  { color: "#FF0000", label: "Red" },
  { color: "#000000", label: "Black" },
];

const COLOR_GRADE_STYLES = [
  "None",
  "Cinematic",
  "Warm",
  "Cool",
  "Moody",
  "Vibrant",
];

const SCRIPT_FORMATS = [
  (topic: string) =>
    `[HOOK] Did you know ${topic}?\n\n[INTRO] Welcome back! Today we're diving deep into something that's been changing the game...\n\n[MAIN CONTENT] Here's what you need to know: first, the basics matter more than anything. Second, consistency beats perfection. Third, your audience can tell when you're authentic.\n\n[CTA] If this helped you, smash that like button and follow for more. Comment below what topic you want next!`,
  (topic: string) =>
    `[OPENING SHOT] Close-up on ${topic} — dramatic music fades in.\n\n[NARRATOR] Most people don't realize this about ${topic}. Not until it's too late.\n\n[SCENE 1] Cut to wide shot. Show the problem clearly.\n[SCENE 2] Introduce the solution with a visual metaphor.\n[SCENE 3] Show the transformation — before and after.\n\n[CTA] Follow for part 2. Link in bio for the full guide.`,
  (topic: string) =>
    `TITLE: The ${topic} Blueprint\n\n00:00 — Hook: Shocking stat or question\n00:15 — Problem: Why most people struggle with ${topic}\n01:00 — Solution: The 3-step system\n02:30 — Proof: Real examples and results\n03:45 — CTA: Subscribe + comment your #1 question\n\nKEY MESSAGES:\n• ${topic} is simpler than you think\n• The biggest mistake is [X]\n• Start with this ONE thing today`,
  (topic: string) =>
    `VIRAL SHORT FORMAT — ${topic.toUpperCase()}\n\n[0-3s] HOOK: "Stop scrolling. ${topic} just changed forever."\n[3-8s] BUILD: "Here's what nobody tells you..."\n[8-20s] PAYOFF: 3 quick tips, each with a visual\n[20-27s] TWIST: Unexpected insight that reframes everything\n[27-30s] CTA: "Part 2 drops tomorrow. Follow now."\n\n#${topic.replace(/ /g, "")} #viral #trending`,
];

export function RightPanel() {
  const [activeTab, setActiveTab] = useState("ai");
  const [speed, setSpeed] = useState([100]);
  const [font, setFont] = useState("inter");
  const [fontSize, setFontSize] = useState("32");

  // Audio enhancements
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [voiceEnhance, setVoiceEnhance] = useState(false);
  const [eqBass, setEqBass] = useState([0]);
  const [eqMid, setEqMid] = useState([0]);
  const [eqTreble, setEqTreble] = useState([0]);
  const [voiceEffect, setVoiceEffect] = useState("normal");

  // Video enhancements
  const [chromaKey, setChromaKey] = useState(false);
  const [chromaColor, setChromaColor] = useState("#00FF00");
  const [chromaTolerance, setChromaTolerance] = useState([30]);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const eqFilterRef = useRef<BiquadFilterNode | null>(null);
  const audioConnectedRef = useRef(false);

  // Get shared refs from MediaContext
  const { videoRef, masterVolume, setMasterVolume, setPlaybackRate } =
    useMedia();

  // Volume display (0-100)
  const [volumeDisplay, setVolumeDisplay] = useState([80]);

  // Sync volumeDisplay -> masterVolume
  useEffect(() => {
    setMasterVolume(volumeDisplay[0] / 100);
  }, [volumeDisplay, setMasterVolume]);

  // Sync masterVolume -> volumeDisplay when changed externally
  useEffect(() => {
    setVolumeDisplay([Math.round(masterVolume * 100)]);
  }, [masterVolume]);

  // Sync speed -> playbackRate
  useEffect(() => {
    // Map 10–400 to 0.1–4.0
    const rate = speed[0] / 100;
    setPlaybackRate(rate);
  }, [speed, setPlaybackRate]);

  // Web Audio: connect/disconnect noise reduction / voice enhance
  const ensureAudioContext = useCallback(() => {
    if (
      typeof AudioContext === "undefined" &&
      typeof (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext === "undefined"
    ) {
      return false;
    }
    const video = videoRef.current;
    if (!video) return false;

    if (!audioCtxRef.current) {
      const AC =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new AC();
    }
    if (!audioConnectedRef.current && audioCtxRef.current) {
      try {
        sourceNodeRef.current =
          audioCtxRef.current.createMediaElementSource(video);
        compressorRef.current = audioCtxRef.current.createDynamicsCompressor();
        eqFilterRef.current = audioCtxRef.current.createBiquadFilter();
        eqFilterRef.current.type = "peaking";
        eqFilterRef.current.frequency.value = 2000;
        eqFilterRef.current.gain.value = 6;
        // Default: source -> destination (bypass)
        sourceNodeRef.current.connect(audioCtxRef.current.destination);
        audioConnectedRef.current = true;
      } catch {
        // Already connected or error
      }
    }
    return true;
  }, [videoRef]);

  const rewireAudio = useCallback(
    (enableNoise: boolean, enableVoice: boolean) => {
      if (!ensureAudioContext()) return;
      const ctx = audioCtxRef.current;
      const source = sourceNodeRef.current;
      const compressor = compressorRef.current;
      const eqFilter = eqFilterRef.current;
      if (!ctx || !source || !compressor || !eqFilter) return;

      // Disconnect everything first
      try {
        source.disconnect();
        compressor.disconnect();
        eqFilter.disconnect();
      } catch {
        // ignore
      }

      // Re-wire based on enabled state
      if (enableNoise && enableVoice) {
        source.connect(compressor);
        compressor.connect(eqFilter);
        eqFilter.connect(ctx.destination);
      } else if (enableNoise) {
        source.connect(compressor);
        compressor.connect(ctx.destination);
      } else if (enableVoice) {
        source.connect(eqFilter);
        eqFilter.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }
    },
    [ensureAudioContext],
  );

  const handleNoiseReductionChange = useCallback(
    (val: boolean) => {
      setNoiseReduction(val);
      rewireAudio(val, voiceEnhance);
      toast.success(
        val ? "Noise Reduction enabled" : "Noise Reduction disabled",
      );
    },
    [voiceEnhance, rewireAudio],
  );

  const handleVoiceEnhanceChange = useCallback(
    (val: boolean) => {
      setVoiceEnhance(val);
      rewireAudio(noiseReduction, val);
      toast.success(val ? "Voice Enhance enabled" : "Voice Enhance disabled");
    },
    [noiseReduction, rewireAudio],
  );

  // AI features
  const [aiFeatures, setAiFeatures] = useState<AiFeatureToggle[]>([
    {
      id: "autoCaptions",
      label: "Auto Captions",
      description: "Multi-language subtitles",
      icon: Sparkles,
      enabled: true,
      isPro: false,
    },
    {
      id: "bgRemover",
      label: "BG Remover",
      description: "AI background removal",
      icon: Brain,
      enabled: false,
      isPro: true,
    },
    {
      id: "sloMo",
      label: "Smooth Slo-Mo",
      description: "AI motion interpolation",
      icon: Zap,
      enabled: true,
      isPro: true,
    },
    {
      id: "faceBlur",
      label: "Face Tracking",
      description: "Auto face blur & tracking",
      icon: Cpu,
      enabled: false,
      isPro: false,
    },
    {
      id: "beatSync",
      label: "Beat Sync",
      description: "Auto music sync editing",
      icon: Music,
      enabled: false,
      isPro: true,
    },
  ]);

  const [subtitleStyle, setSubtitleStyle] = useState("bold");
  const [motionTracking, setMotionTracking] = useState(false);
  const [colorGrade, setColorGrade] = useState("None");

  // Scene detection state
  const [sceneDetecting, setSceneDetecting] = useState(false);
  const [sceneResult, setSceneResult] = useState<string | null>(null);
  const [sceneProgress, setSceneProgress] = useState(0);

  // Script generator state
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [scriptOutput, setScriptOutput] = useState("");
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const scriptFormatRef = useRef(0);

  // Text-to-video state
  const [t2vPrompt, setT2vPrompt] = useState("");
  const [t2vShown, setT2vShown] = useState(false);
  const [t2vGenerating, setT2vGenerating] = useState(false);

  const toggleAiFeature = (id: string) => {
    setAiFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  };

  const beatSyncEnabled = aiFeatures.find((f) => f.id === "beatSync")?.enabled;
  const captionsEnabled = aiFeatures.find(
    (f) => f.id === "autoCaptions",
  )?.enabled;

  const handleDetectScenes = () => {
    setSceneDetecting(true);
    setSceneResult(null);
    setSceneProgress(0);
    const interval = setInterval(() => {
      setSceneProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setSceneDetecting(false);
          const count = Math.floor(Math.random() * 6) + 5;
          const result = `${count} scenes detected, ${count} cut points added`;
          setSceneResult(result);
          toast.success(`Scene Detection complete — ${result}`);
          return 100;
        }
        return p + 8;
      });
    }, 120);
  };

  const handleGenerateScript = () => {
    if (!scriptPrompt.trim()) return;
    setScriptGenerating(true);
    setScriptOutput("");
    const formatIndex = scriptFormatRef.current % SCRIPT_FORMATS.length;
    scriptFormatRef.current += 1;
    setTimeout(() => {
      setScriptGenerating(false);
      setScriptOutput(SCRIPT_FORMATS[formatIndex](scriptPrompt.trim()));
    }, 1800);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptOutput).catch(() => {});
    setScriptCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const handleGenerateT2V = () => {
    if (!t2vPrompt.trim()) return;
    setT2vGenerating(true);
    setT2vShown(false);
    setTimeout(() => {
      setT2vGenerating(false);
      setT2vShown(true);
    }, 2000);
  };

  const tabStyle = [
    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-none",
    "text-label-xs font-medium transition-colors",
    "border-b-2 border-transparent text-muted-foreground",
    "data-[state=active]:text-teal data-[state=active]:border-teal",
    "data-[state=active]:bg-[oklch(0.80_0.18_178_/_0.06)]",
  ].join(" ");

  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <TabsList
          className="flex w-full rounded-none bg-transparent p-0 gap-0 flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.45)" }}
        >
          {[
            { value: "audio", label: "Audio", icon: Volume2 },
            { value: "video", label: "Video", icon: Video },
            { value: "ai", label: "AI", icon: Brain },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              data-ocid={`right_panel.${tab.value}.tab`}
              className={tabStyle}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Audio ────────────────────────────────────────────────────── */}
        <TabsContent
          value="audio"
          className="mt-0 p-3 space-y-3 flex-1 overflow-y-auto"
        >
          <div>
            <p className="text-label-xs font-semibold text-foreground/90 uppercase tracking-wider mb-2">
              Volume
            </p>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <Slider
                value={volumeDisplay}
                onValueChange={setVolumeDisplay}
                min={0}
                max={100}
                step={1}
                className="flex-1"
                data-ocid="right_panel.volume.input"
              />
              <span className="text-label-xs font-mono text-muted-foreground w-8 text-right">
                {volumeDisplay[0]}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-label-xs font-semibold text-foreground/90 uppercase tracking-wider">
                Music Library
              </p>
              <button
                type="button"
                data-ocid="right_panel.add_music.button"
                className="flex items-center gap-1 text-label-xs text-teal hover:text-teal-bright transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-1">
              {MOCK_MUSIC_TRACKS.slice(0, 4).map((track) => (
                <motion.button
                  type="button"
                  key={track.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/30 transition-all text-left"
                  whileHover={{ x: 1 }}
                >
                  <div className="w-6 h-6 rounded bg-teal/15 flex items-center justify-center flex-shrink-0">
                    <Music className="w-3 h-3 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-xs font-medium text-foreground truncate">
                      {track.title}
                    </p>
                    <p
                      className="text-muted-foreground truncate"
                      style={{ fontSize: "0.625rem" }}
                    >
                      {track.artist} · {track.duration}
                    </p>
                  </div>
                  {track.isPremium && (
                    <span
                      className="text-label-xs bg-teal/15 text-teal px-1 py-0.5 rounded font-semibold"
                      style={{ fontSize: "0.5625rem" }}
                    >
                      PRO
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Enhancement */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Enhancement
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-xs font-medium text-foreground">
                    Noise Reduction
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.625rem" }}
                  >
                    Remove background noise
                  </p>
                </div>
                <Switch
                  checked={noiseReduction}
                  onCheckedChange={handleNoiseReductionChange}
                  className="scale-75"
                  data-ocid="right_panel.noise_reduction.switch"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-xs font-medium text-foreground">
                    Voice Enhance
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.625rem" }}
                  >
                    Clarify vocal frequencies
                  </p>
                </div>
                <Switch
                  checked={voiceEnhance}
                  onCheckedChange={handleVoiceEnhanceChange}
                  className="scale-75"
                  data-ocid="right_panel.voice_enhance.switch"
                />
              </div>
            </div>
          </div>

          {/* Equalizer */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Equalizer
            </p>
            <div className="space-y-2">
              {(
                [
                  { label: "Bass", state: eqBass, setState: setEqBass },
                  { label: "Mid", state: eqMid, setState: setEqMid },
                  { label: "Treble", state: eqTreble, setState: setEqTreble },
                ] as const
              ).map(({ label, state: eqState, setState }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-label-xs text-muted-foreground w-10 flex-shrink-0">
                    {label}
                  </span>
                  <Slider
                    value={eqState as number[]}
                    onValueChange={setState as (v: number[]) => void}
                    min={-10}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-label-xs font-mono text-muted-foreground w-6 text-right">
                    {(eqState as number[])[0] > 0
                      ? `+${(eqState as number[])[0]}`
                      : (eqState as number[])[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Effect */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
              Voice Effect
            </p>
            <Select value={voiceEffect} onValueChange={setVoiceEffect}>
              <SelectTrigger
                className="h-7 text-label-xs bg-input border-border"
                data-ocid="right_panel.voice_effect.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["normal", "robot", "chipmunk", "deep", "echo"].map((v) => (
                  <SelectItem
                    key={v}
                    value={v}
                    className="text-label-xs capitalize"
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            data-ocid="right_panel.voiceover.button"
            className="w-full py-2 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/30 flex items-center justify-center gap-1.5 text-label-xs text-muted-foreground hover:text-foreground transition-all"
          >
            <Mic className="w-3.5 h-3.5" /> Record Voiceover
          </button>
        </TabsContent>

        {/* ── Video ────────────────────────────────────────────────────── */}
        <TabsContent
          value="video"
          className="mt-0 p-3 space-y-3 flex-1 overflow-y-auto"
        >
          <div>
            <Label className="text-label-xs font-semibold text-foreground/90 uppercase tracking-wider mb-1.5 block">
              Resolution
            </Label>
            <Select defaultValue="4k">
              <SelectTrigger
                data-ocid="right_panel.resolution.select"
                className="h-7 text-label-xs bg-input border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="720p" className="text-label-xs">
                  720p HD
                </SelectItem>
                <SelectItem value="1080p" className="text-label-xs">
                  1080p Full HD
                </SelectItem>
                <SelectItem value="2k" className="text-label-xs">
                  2K (2560×1440)
                </SelectItem>
                <SelectItem value="4k" className="text-label-xs">
                  4K Ultra HD
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-label-xs font-semibold text-foreground/90 uppercase tracking-wider mb-1">
              Speed{" "}
              <span className="text-muted-foreground font-normal normal-case">
                {speed[0]}%
              </span>
            </p>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={10}
              max={400}
              step={5}
              data-ocid="right_panel.speed.input"
            />
            <div className="flex justify-between mt-1">
              <span
                className="text-muted-foreground"
                style={{ fontSize: "0.5625rem" }}
              >
                0.1×
              </span>
              <span
                className="text-muted-foreground"
                style={{ fontSize: "0.5625rem" }}
              >
                4×
              </span>
            </div>
          </div>

          <div>
            <p className="text-label-xs font-semibold text-foreground/90 uppercase tracking-wider mb-1.5">
              Transform
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Crop", icon: Palette },
                { label: "Rotate", icon: RotateCw },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/30 text-label-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Green Screen */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Green Screen
            </p>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-label-xs font-medium text-foreground">
                  Chroma Key
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.625rem" }}
                >
                  Remove background color
                </p>
              </div>
              <Switch
                checked={chromaKey}
                onCheckedChange={setChromaKey}
                className="scale-75"
                data-ocid="right_panel.chroma_key.switch"
              />
            </div>
            <AnimatePresence>
              {chromaKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex gap-1.5">
                    {CHROMA_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.color}
                        onClick={() => setChromaColor(p.color)}
                        title={p.label}
                        className={`w-6 h-6 rounded border-2 transition-all ${
                          chromaColor === p.color
                            ? "border-teal scale-110"
                            : "border-border"
                        }`}
                        style={{ background: p.color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-label-xs text-muted-foreground w-16 flex-shrink-0">
                      Tolerance
                    </span>
                    <Slider
                      value={chromaTolerance}
                      onValueChange={setChromaTolerance}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-label-xs font-mono text-muted-foreground w-6 text-right">
                      {chromaTolerance[0]}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keyframe Animation */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Keyframe Animation
            </p>
            <div className="space-y-1.5">
              {["Position", "Scale", "Opacity", "Rotation"].map((param, i) => (
                <div key={param} className="flex items-center gap-2">
                  <span className="text-label-xs text-muted-foreground w-14 flex-shrink-0">
                    {param}
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-muted/30 relative">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${[40, 60, 80, 25][i]}%`,
                        background: "oklch(0.78 0.17 178)",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-teal transition-colors flex-shrink-0"
                    title="Add keyframe"
                  >
                    <Diamond className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p
              className="text-muted-foreground mt-1.5"
              style={{ fontSize: "0.6rem" }}
            >
              Timeline: 2 keyframes set
            </p>
          </div>

          {/* Text Properties */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-sm font-semibold text-foreground mb-2">
              Text Properties
            </p>
            <div className="space-y-2">
              <div>
                <Label className="text-label-xs text-muted-foreground/80">
                  Font
                </Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger
                    data-ocid="right_panel.font.select"
                    className="h-7 text-label-xs mt-0.5 bg-input border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {["inter", "poppins", "montserrat", "roboto", "oswald"].map(
                      (f) => (
                        <SelectItem
                          key={f}
                          value={f}
                          className="text-label-xs capitalize"
                        >
                          {f}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <Label className="text-label-xs text-muted-foreground/80">
                    Size
                  </Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger
                      data-ocid="right_panel.fontsize.select"
                      className="h-7 text-label-xs mt-0.5 bg-input border-border"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {["14", "18", "24", "32", "48", "64", "72"].map((s) => (
                        <SelectItem key={s} value={s} className="text-label-xs">
                          {s}pt
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-label-xs text-muted-foreground/80">
                    Color
                  </Label>
                  <div className="h-7 mt-0.5 rounded border border-border bg-input flex items-center px-2 gap-1.5 cursor-pointer hover:border-teal/35 transition-colors">
                    <div
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                      style={{ background: "var(--teal-full)" }}
                    />
                    <span className="text-label-xs text-muted-foreground">
                      #20E3C2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── AI ──────────────────────────────────────────────────────────── */}
        <TabsContent
          value="ai"
          className="mt-0 p-3 space-y-2 flex-1 overflow-y-auto"
        >
          {/* Header + credits */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-teal/15 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-teal" />
              </div>
              <p className="text-label-sm font-semibold text-foreground">
                AI Features
              </p>
            </div>
            <span className="text-label-xs text-muted-foreground">3 / 10</span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "oklch(0.22 0.026 230)" }}
          >
            <div
              className="h-full w-[30%] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.72 0.16 178), oklch(0.83 0.20 170))",
                boxShadow: "0 0 6px oklch(0.80 0.18 178 / 0.45)",
              }}
            />
          </div>

          {/* Feature rows */}
          <div className="space-y-1 pt-1">
            {aiFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-white/3 hover:bg-white/5 transition-all"
                whileHover={{ x: 1 }}
              >
                <div className="w-6 h-6 rounded bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-3.5 h-3.5 text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-label-xs font-medium text-foreground">
                      {feature.label}
                    </p>
                    {feature.isPro && (
                      <span
                        className="bg-teal/15 text-teal px-1 py-0.5 rounded font-semibold"
                        style={{ fontSize: "0.5625rem" }}
                      >
                        PRO
                      </span>
                    )}
                  </div>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.625rem" }}
                  >
                    {feature.description}
                  </p>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleAiFeature(feature.id)}
                  data-ocid={`right_panel.ai_${feature.id}.switch`}
                  className="scale-75"
                />
              </motion.div>
            ))}
          </div>

          {/* Auto Captions subtitle styles */}
          <AnimatePresence>
            {captionsEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
                  Caption Style
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {SUBTITLE_STYLES.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSubtitleStyle(s.id)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded text-label-xs font-medium transition-all ${
                        subtitleStyle === s.id
                          ? "bg-teal/20 text-teal border border-teal/50"
                          : "bg-white/4 text-muted-foreground border border-border hover:border-teal/30"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beat Sync Visualizer */}
          <AnimatePresence>
            {beatSyncEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
                  Beat Markers
                </p>
                <div
                  className="rounded border border-border p-2"
                  style={{ background: "oklch(0.10 0.018 233)" }}
                >
                  <svg viewBox="0 0 200 24" className="w-full h-6">
                    <title>Beat markers</title>
                    {MOCK_BEAT_MARKERS.map((pos) => {
                      const x = (pos / 15) * 200;
                      return (
                        <rect
                          key={pos}
                          x={x - 0.5}
                          y={2}
                          width={1}
                          height={20}
                          rx={0.5}
                          fill="oklch(0.78 0.17 178)"
                          opacity={0.8}
                        />
                      );
                    })}
                  </svg>
                  <p
                    className="text-muted-foreground mt-1"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {MOCK_BEAT_MARKERS.length} beats detected
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scene Detection */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
              Scene Detection
            </p>
            <motion.button
              type="button"
              onClick={handleDetectScenes}
              disabled={sceneDetecting}
              data-ocid="right_panel.detect_scenes.button"
              className="w-full py-1.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/30 flex items-center justify-center gap-1.5 text-label-xs text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
            >
              {sceneDetecting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Scan className="w-3 h-3" />
              )}
              {sceneDetecting ? "Detecting..." : "Detect Scenes"}
            </motion.button>
            {sceneDetecting && (
              <div className="mt-1.5">
                <div className="h-1 rounded-full overflow-hidden bg-muted/30">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "oklch(0.78 0.17 178)",
                      width: `${sceneProgress}%`,
                    }}
                    animate={{ width: `${sceneProgress}%` }}
                  />
                </div>
              </div>
            )}
            {sceneResult && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-label-xs text-teal mt-1.5 flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> {sceneResult}
              </motion.p>
            )}
          </div>

          {/* AI Color Grade */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
              AI Color Grade
            </p>
            <div className="flex gap-1.5">
              <Select value={colorGrade} onValueChange={setColorGrade}>
                <SelectTrigger className="flex-1 h-7 text-label-xs bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {COLOR_GRADE_STYLES.map((s) => (
                    <SelectItem key={s} value={s} className="text-label-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                className="px-2.5 py-1 rounded border border-teal/40 bg-teal/10 text-teal text-label-xs hover:bg-teal/20 transition-all"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Motion Tracking */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider">
                  Motion Tracking
                </p>
                <p
                  className="text-muted-foreground mt-0.5"
                  style={{ fontSize: "0.625rem" }}
                >
                  Lock text & stickers to tracked subject
                </p>
              </div>
              <Switch
                checked={motionTracking}
                onCheckedChange={setMotionTracking}
                className="scale-75"
                data-ocid="right_panel.motion_tracking.switch"
              />
            </div>
          </div>

          {/* Script Generator */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
              Script Generator
            </p>
            <textarea
              value={scriptPrompt}
              onChange={(e) => setScriptPrompt(e.target.value)}
              placeholder="Describe your video topic…"
              className="w-full h-12 bg-input border border-border rounded text-label-xs text-foreground placeholder:text-muted-foreground/50 p-2 resize-none focus:outline-none focus:border-teal/40 transition-colors"
              data-ocid="right_panel.script_prompt.textarea"
            />
            <button
              type="button"
              onClick={handleGenerateScript}
              disabled={!scriptPrompt.trim() || scriptGenerating}
              data-ocid="right_panel.generate_script.button"
              className="w-full py-1.5 mt-1.5 rounded border border-border bg-white/3 hover:bg-teal/10 hover:border-teal/30 flex items-center justify-center gap-1.5 text-label-xs text-muted-foreground hover:text-teal transition-all disabled:opacity-40"
            >
              {scriptGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              {scriptGenerating ? "Generating..." : "Generate Script"}
            </button>
            {scriptOutput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-1.5"
              >
                <div className="relative">
                  <textarea
                    readOnly
                    value={scriptOutput}
                    className="w-full h-24 bg-muted/20 border border-border rounded text-label-xs text-foreground p-2 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="absolute top-1.5 right-1.5 p-1 rounded bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-teal transition-all"
                  >
                    {scriptCopied ? (
                      <CheckCheck className="w-3 h-3 text-teal" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Text to Video */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.40)" }}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider">
                Text to Video
              </p>
              <span
                className="bg-teal/15 text-teal px-1 py-0.5 rounded font-semibold"
                style={{ fontSize: "0.5625rem" }}
              >
                PRO
              </span>
            </div>
            <textarea
              value={t2vPrompt}
              onChange={(e) => setT2vPrompt(e.target.value)}
              placeholder="Describe a scene to generate…"
              className="w-full h-12 bg-input border border-border rounded text-label-xs text-foreground placeholder:text-muted-foreground/50 p-2 resize-none focus:outline-none focus:border-teal/40 transition-colors"
              data-ocid="right_panel.t2v_prompt.textarea"
            />
            <button
              type="button"
              onClick={handleGenerateT2V}
              disabled={!t2vPrompt.trim() || t2vGenerating}
              data-ocid="right_panel.generate_t2v.button"
              className="w-full py-1.5 mt-1.5 rounded border border-border bg-white/3 hover:bg-teal/10 hover:border-teal/30 flex items-center justify-center gap-1.5 text-label-xs text-muted-foreground hover:text-teal transition-all disabled:opacity-40"
            >
              {t2vGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {t2vGenerating ? "Generating..." : "Generate Preview"}
            </button>
            <AnimatePresence>
              {t2vShown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-1 mt-1.5"
                >
                  {[
                    ["oklch(0.25 0.04 200)", "oklch(0.35 0.08 160)"],
                    ["oklch(0.20 0.03 240)", "oklch(0.30 0.06 280)"],
                    ["oklch(0.28 0.06 180)", "oklch(0.38 0.10 140)"],
                    ["oklch(0.22 0.04 220)", "oklch(0.32 0.07 260)"],
                  ].map(([c1, c2]) => (
                    <div
                      key={c1}
                      className="aspect-video rounded border border-border flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${c1}, ${c2})`,
                      }}
                    >
                      <span
                        className="text-muted-foreground/60 font-mono"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Scene
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            data-ocid="right_panel.upgrade_ai.button"
            className="w-full py-2 rounded text-label-xs font-semibold btn-gradient mt-1"
          >
            Unlock All AI Features
          </button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RightPanel;
