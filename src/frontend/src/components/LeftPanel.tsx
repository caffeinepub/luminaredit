import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crop,
  Film,
  Gauge,
  ImageIcon,
  Layers,
  Mic,
  Music,
  Scissors,
  Search,
  Sparkles,
  SplitSquareHorizontal,
  Sticker,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useMedia } from "../context/MediaContext";
import { MOCK_EFFECTS } from "../data/mockData";

const TOOL_TILES = [
  { id: "trim", label: "Trim", icon: Scissors },
  { id: "split", label: "Split", icon: SplitSquareHorizontal },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "text", label: "Add Text", icon: Type },
  { id: "music", label: "Music", icon: Music },
  { id: "stickers", label: "Stickers", icon: Sticker },
  { id: "speedramp", label: "Speed Ramp", icon: Gauge },
  { id: "voiceover", label: "Voiceover", icon: Mic },
  { id: "ai", label: "AI Tools", icon: Sparkles },
  { id: "glow", label: "Glow FX", icon: Zap },
];

const STICKERS = [
  "\ud83c\udf0a",
  "\ud83c\udf34",
  "\ud83c\udfac",
  "\u2728",
  "\ud83d\udd25",
  "\ud83d\udcab",
  "\ud83c\udfb5",
  "\u2764\ufe0f",
  "\ud83c\udf05",
  "\ud83e\udd8b",
  "\ud83c\udfad",
  "\ud83d\udc8e",
];

const VIDEO_FILTERS: Array<{ name: string; filter: string; preview: string }> =
  [
    {
      name: "None",
      filter: "none",
      preview: "oklch(0.18 0.024 233)",
    },
    {
      name: "Cinematic",
      filter: "contrast(1.2) saturate(0.85) brightness(0.95) sepia(0.1)",
      preview: "oklch(0.22 0.06 40)",
    },
    {
      name: "Warm",
      filter: "sepia(0.3) saturate(1.4) brightness(1.05)",
      preview: "oklch(0.55 0.12 60)",
    },
    {
      name: "Cool",
      filter: "hue-rotate(30deg) saturate(1.2) brightness(1.0)",
      preview: "oklch(0.45 0.14 220)",
    },
    {
      name: "Moody",
      filter: "contrast(1.3) brightness(0.85) saturate(0.7)",
      preview: "oklch(0.28 0.04 250)",
    },
    {
      name: "Vibrant",
      filter: "saturate(1.8) contrast(1.1)",
      preview: "oklch(0.60 0.20 310)",
    },
    {
      name: "Vintage",
      filter: "sepia(0.4) contrast(1.1) brightness(0.9)",
      preview: "oklch(0.50 0.10 50)",
    },
    {
      name: "Noir",
      filter: "grayscale(1) contrast(1.3)",
      preview: "oklch(0.35 0 0)",
    },
  ];

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState("media");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lutIntensity, setLutIntensity] = useState(75);
  const [filterChip, setFilterChip] = useState<"all" | "trending">("all");

  const {
    clips,
    activeClipId,
    setActiveClipId,
    triggerFileInput,
    videoFilter,
    setVideoFilter,
    addTextOverlay,
  } = useMedia();

  const handleToolClick = (toolId: string) => {
    const newTool = activeTool === toolId ? null : toolId;
    setActiveTool(newTool);

    // If "Add Text" activated, add an overlay immediately
    if (toolId === "text" && activeTool !== "text") {
      addTextOverlay({
        x: 50,
        y: 50,
        text: "Text",
        fontSize: 28,
        color: "#ffffff",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        {/* Tab bar */}
        <TabsList
          className="flex w-full rounded-none bg-transparent p-0 gap-0 flex-shrink-0 overflow-x-auto"
          style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.45)" }}
        >
          {[
            { value: "media", label: "Media", icon: Film },
            { value: "assets", label: "Assets", icon: Layers },
            { value: "effects", label: "FX", icon: Sparkles },
            { value: "transitions", label: "Trans", icon: Zap },
            { value: "filters", label: "Filters", icon: ImageIcon },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              data-ocid={`left_panel.${tab.value}.tab`}
              className={[
                "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-none",
                "text-label-xs font-medium transition-colors min-w-0",
                "border-b-2 border-transparent",
                "text-muted-foreground",
                "data-[state=active]:text-teal data-[state=active]:border-teal",
                "data-[state=active]:bg-[oklch(0.80_0.18_178_/_0.06)]",
              ].join(" ")}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tool tiles 2×5 grid */}
        <div
          className="grid grid-cols-2 gap-1.5 p-2 flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.35)" }}
        >
          {TOOL_TILES.map((tile) => (
            <motion.button
              type="button"
              key={tile.id}
              data-ocid={`left_panel.${tile.id}.button`}
              className={[
                "tool-tile flex flex-col items-center justify-center gap-1 py-2.5 rounded border transition-all text-center",
                activeTool === tile.id
                  ? "bg-[oklch(0.80_0.18_178_/_0.10)] border-[oklch(0.80_0.18_178_/_0.40)] text-teal"
                  : "bg-white/3 border-border text-muted-foreground",
              ].join(" ")}
              onClick={() => handleToolClick(tile.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <tile.icon className="w-4 h-4" />
              <span className="text-label-xs font-medium leading-none">
                {tile.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Active tool sub-panels */}
        {activeTool === "voiceover" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-2 flex-shrink-0"
            style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.35)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Voiceover Recorder
            </p>
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => setIsRecording((r) => !r)}
                data-ocid="left_panel.voiceover_record.button"
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isRecording
                    ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                    : "bg-red-500/20 border border-red-500/50"
                }`}
                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
              >
                <Mic className="w-4 h-4 text-red-400" />
              </motion.button>
              {/* Waveform */}
              <div className="flex items-center gap-0.5 flex-1">
                {[4, 8, 12, 6, 14, 9, 5].map((h, idx) => (
                  <motion.div
                    key={h}
                    className="w-1 rounded-full bg-teal/60"
                    style={{ height: `${h}px` }}
                    animate={
                      isRecording
                        ? { height: [`${h}px`, `${h * 2}px`, `${h}px`] }
                        : {}
                    }
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 0.5 + idx * 0.1,
                    }}
                  />
                ))}
              </div>
              <span className="text-label-xs font-mono text-muted-foreground">
                {isRecording ? "REC" : "0:00"}
              </span>
            </div>
          </motion.div>
        )}

        {activeTool === "speedramp" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-2 flex-shrink-0"
            style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.35)" }}
          >
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Speed Ramp Editor
            </p>
            {/* Mini S-curve */}
            <svg viewBox="0 0 120 48" className="w-full h-10 mb-1">
              <title>Speed curve</title>
              <path
                d="M 10 40 C 30 40 30 24 60 24 C 90 24 90 8 110 8"
                fill="none"
                stroke="oklch(0.78 0.17 178)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {[
                { x: 20, cy: 36 },
                { x: 60, cy: 24 },
                { x: 100, cy: 12 },
              ].map((pt) => (
                <circle
                  key={pt.x}
                  cx={pt.x}
                  cy={pt.cy}
                  r="3"
                  fill="oklch(0.78 0.17 178)"
                />
              ))}
            </svg>
            <div className="flex justify-between">
              {["Slow", "Normal", "Fast"].map((z) => (
                <span
                  key={z}
                  className="text-label-xs text-muted-foreground/70"
                >
                  {z}
                </span>
              ))}
            </div>
            <p
              className="text-muted-foreground/50 mt-1"
              style={{ fontSize: "0.6rem" }}
            >
              Drag handles to adjust
            </p>
          </motion.div>
        )}

        {/* Add Text active hint */}
        {activeTool === "text" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-2 py-1.5 flex-shrink-0"
            style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.35)" }}
          >
            <p className="text-label-xs text-teal/80 flex items-center gap-1">
              <Type className="w-3 h-3" />
              Text added to preview. Double-click to edit, drag to move.
            </p>
          </motion.div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="media" className="mt-0 p-2 space-y-2">
            {/* Import Media button */}
            <motion.button
              type="button"
              data-ocid="left_panel.upload.button"
              onClick={triggerFileInput}
              className="w-full py-3 rounded border-2 border-dashed border-teal/30 hover:border-teal/60 text-teal/70 hover:text-teal flex flex-col items-center gap-1.5 text-label-xs transition-all group"
              style={{
                background: "oklch(0.80 0.18 178 / 0.04)",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "oklch(0.80 0.18 178 / 0.12)",
                  border: "1px solid oklch(0.80 0.18 178 / 0.30)",
                }}
              >
                <Upload className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Import Media</span>
              <span
                className="text-muted-foreground/60"
                style={{ fontSize: "0.6rem" }}
              >
                Video &amp; Audio files
              </span>
            </motion.button>

            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search media\u2026"
                className="w-full bg-white/4 border border-border rounded-md py-1.5 pl-7 pr-2 text-label-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-teal/40 transition-colors"
                data-ocid="left_panel.search.input"
              />
            </div>

            {/* Uploaded clips */}
            {clips.length > 0 && (
              <div>
                <p className="text-label-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">
                  Imported ({clips.length})
                </p>
                <div className="space-y-1">
                  {clips.map((clip, idx) => (
                    <motion.button
                      type="button"
                      key={clip.id}
                      data-ocid={`left_panel.clip.item.${idx + 1}`}
                      onClick={() => setActiveClipId(clip.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded border text-left transition-all ${
                        activeClipId === clip.id
                          ? "bg-teal/10 border-teal/40 text-teal"
                          : "bg-white/3 border-border text-muted-foreground hover:border-teal/25 hover:text-foreground"
                      }`}
                      whileHover={{ x: 1 }}
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            clip.type === "video"
                              ? "oklch(0.65 0.15 178 / 0.25)"
                              : "oklch(0.58 0.18 290 / 0.25)",
                          border:
                            clip.type === "video"
                              ? "1px solid oklch(0.65 0.15 178 / 0.40)"
                              : "1px solid oklch(0.58 0.18 290 / 0.40)",
                        }}
                      >
                        {clip.type === "video" ? (
                          <Film className="w-3 h-3" />
                        ) : (
                          <Music className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-xs font-medium truncate leading-none">
                          {clip.name}
                        </p>
                        <p
                          className="text-muted-foreground/60 capitalize mt-0.5"
                          style={{ fontSize: "0.6rem" }}
                        >
                          {clip.type}
                          {clip.duration
                            ? ` · ${Math.floor(clip.duration / 60)}:${String(
                                Math.floor(clip.duration % 60),
                              ).padStart(2, "0")}`
                            : ""}
                        </p>
                      </div>
                      {activeClipId === clip.id && (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "oklch(0.80 0.18 178)" }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock thumbnails when no clips */}
            {clips.length === 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {(["m1", "m2", "m3", "m4"] as const).map((mid, i) => (
                  <div
                    key={mid}
                    className="aspect-video rounded overflow-hidden cursor-pointer border border-border hover:border-teal/35 transition-colors"
                  >
                    <img
                      src={
                        i < 2
                          ? "/assets/generated/travel-vlog-thumbnail.dim_320x180.jpg"
                          : "/assets/generated/city-nights-thumbnail.dim_320x180.jpg"
                      }
                      alt={`Media ${i}`}
                      className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assets" className="mt-0 p-2">
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Stickers
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {STICKERS.map((s) => (
                <motion.button
                  type="button"
                  key={s}
                  className="aspect-square rounded bg-white/4 border border-border flex items-center justify-center text-lg hover:bg-white/8 hover:border-teal/35 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mt-3 mb-2">
              GIFs
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {["Confetti", "Fire", "Stars", "Hearts"].map((gif) => (
                <div
                  key={gif}
                  className="aspect-square rounded bg-white/4 border border-border flex items-center justify-center text-label-xs text-muted-foreground cursor-pointer hover:border-teal/35 transition-colors"
                >
                  {gif}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="effects" className="mt-0 p-2">
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Visual Effects
            </p>
            <div className="space-y-1">
              {MOCK_EFFECTS.filter((e) => e.category !== "transition").map(
                (effect, idx) => (
                  <motion.button
                    type="button"
                    key={effect.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/35 transition-all text-left"
                    whileHover={{ x: 2 }}
                  >
                    <div
                      className="w-6 h-6 rounded flex-shrink-0"
                      style={{ background: effect.color, opacity: 0.65 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-label-xs font-medium text-foreground truncate">
                        {effect.name}
                      </p>
                      <p
                        className="text-label-xs text-muted-foreground/70 capitalize"
                        style={{ fontSize: "0.625rem" }}
                      >
                        {effect.category}
                      </p>
                    </div>
                    {idx < 3 && (
                      <span
                        className="text-label-xs px-1 py-0.5 rounded font-semibold flex-shrink-0"
                        style={{
                          fontSize: "0.5rem",
                          background: "rgba(249,115,22,0.15)",
                          color: "#fb923c",
                        }}
                      >
                        \ud83d\udd25 Trend
                      </span>
                    )}
                    {effect.isPremium && (
                      <span
                        className="text-label-xs bg-teal/15 text-teal px-1 py-0.5 rounded font-semibold flex-shrink-0"
                        style={{ fontSize: "0.5625rem" }}
                      >
                        PRO
                      </span>
                    )}
                  </motion.button>
                ),
              )}
            </div>
          </TabsContent>

          <TabsContent value="transitions" className="mt-0 p-2">
            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Transitions
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {MOCK_EFFECTS.filter(
                (e) => e.category === "transition" || e.category === "glitch",
              ).map((effect, idx) => (
                <motion.button
                  type="button"
                  key={effect.id}
                  className="flex flex-col items-center gap-1 py-2.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/35 transition-all text-center relative"
                  whileHover={{ scale: 1.03 }}
                >
                  {idx < 2 && (
                    <span
                      className="absolute top-1 right-1 text-label-xs px-1 py-0.5 rounded font-semibold"
                      style={{
                        fontSize: "0.45rem",
                        background: "rgba(249,115,22,0.15)",
                        color: "#fb923c",
                      }}
                    >
                      \ud83d\udd25
                    </span>
                  )}
                  <div
                    className="w-8 h-5 rounded"
                    style={{
                      background: `linear-gradient(90deg, ${effect.color}88, transparent)`,
                    }}
                  />
                  <p className="text-label-xs font-medium text-foreground">
                    {effect.name}
                  </p>
                  {effect.isPremium && (
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
          </TabsContent>

          <TabsContent value="filters" className="mt-0 p-2">
            {/* Trending chip */}
            <div className="flex items-center gap-1.5 mb-2">
              {(["all", "trending"] as const).map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setFilterChip(chip)}
                  className={`px-2 py-0.5 rounded-full text-label-xs font-medium capitalize transition-all ${
                    filterChip === chip
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                      : "bg-muted/20 text-muted-foreground border border-border hover:border-teal/30"
                  }`}
                >
                  {chip === "trending" ? "\ud83d\udd25 Trending" : "All"}
                </button>
              ))}
            </div>

            {/* Import LUT */}
            <button
              type="button"
              className="w-full py-2 mb-2 rounded border-2 border-dashed border-border hover:border-teal/45 text-muted-foreground hover:text-teal flex items-center justify-center gap-1.5 text-label-xs transition-all"
            >
              <Upload className="w-3 h-3" />
              Import LUT
            </button>

            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              CSS Filter Presets
            </p>
            <div className="space-y-1">
              {VIDEO_FILTERS.map((f) => (
                <motion.button
                  type="button"
                  key={f.name}
                  onClick={() => setVideoFilter(f.filter)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border transition-all text-left ${
                    videoFilter === f.filter
                      ? "border-teal/50 bg-teal/10 text-teal"
                      : "border-border bg-white/3 hover:bg-white/6 hover:border-teal/35 text-foreground"
                  }`}
                  whileHover={{ x: 2 }}
                  data-ocid={`left_panel.filter_${f.name.toLowerCase()}.button`}
                >
                  <div
                    className="w-8 h-6 rounded flex-shrink-0 border border-border/50"
                    style={{ background: f.preview }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-xs font-medium truncate">
                      {f.name}
                    </p>
                    {videoFilter === f.filter && (
                      <p
                        className="text-teal/70"
                        style={{ fontSize: "0.55rem" }}
                      >
                        Active
                      </p>
                    )}
                  </div>
                  {videoFilter === f.filter && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "oklch(0.80 0.18 178)" }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2 mt-3">
              LUT Library
            </p>
            <div className="space-y-1">
              {MOCK_EFFECTS.filter(
                (e) =>
                  e.category === "filter" ||
                  e.category === "lut" ||
                  e.category === "cinematic",
              ).map((effect) => (
                <motion.button
                  type="button"
                  key={effect.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/35 transition-all text-left"
                  whileHover={{ x: 2 }}
                >
                  <div
                    className="w-8 h-6 rounded flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${effect.color}70, oklch(0.09 0.018 233))`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-xs font-medium text-foreground truncate">
                      {effect.name}
                    </p>
                    <p
                      className="text-label-xs text-muted-foreground/70 uppercase"
                      style={{ fontSize: "0.5625rem", letterSpacing: "0.04em" }}
                    >
                      {effect.category}
                    </p>
                  </div>
                  {effect.isPremium && (
                    <span
                      className="text-label-xs bg-teal/15 text-teal px-1 py-0.5 rounded font-semibold flex-shrink-0"
                      style={{ fontSize: "0.5625rem" }}
                    >
                      PRO
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* LUT Intensity */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-label-xs font-semibold text-foreground/60 uppercase tracking-wider">
                  LUT Intensity
                </p>
                <span className="text-label-xs font-mono text-muted-foreground">
                  {lutIntensity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={lutIntensity}
                onChange={(e) => setLutIntensity(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, oklch(0.78 0.17 178) ${lutIntensity}%, oklch(0.22 0.026 230) ${lutIntensity}%)`,
                }}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default LeftPanel;
