// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectMock {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  resolution: string;
  status: "ready" | "draft" | "processing";
  lastEdited: string;
}

export interface TemplateMock {
  id: string;
  name: string;
  category: "reels" | "shorts" | "tiktok" | "youtube";
  style: string;
  duration: string;
  color: string;
  tags: string[];
  isPremium: boolean;
}

export interface EffectMock {
  id: string;
  name: string;
  category:
    | "glitch"
    | "cinematic"
    | "filter"
    | "transition"
    | "lut"
    | "3d"
    | "motion";
  color: string;
  isPremium: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number;
  genre: string;
  isPremium: boolean;
}

export interface ScheduledPost {
  id: string;
  projectTitle: string;
  platform: "instagram" | "youtube" | "tiktok" | "twitter";
  scheduledTime: string;
  status: "scheduled" | "published" | "failed";
  caption: string;
  hashtags: string[];
  thumbnail: string;
}

export interface AnalyticsData {
  date: string;
  views: number;
  exports: number;
  shares: number;
}

export interface CommentMock {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  resolved: boolean;
}

export interface VersionMock {
  id: string;
  label: string;
  timestamp: string;
  size: string;
  isCurrent: boolean;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: ProjectMock[] = [
  {
    id: "p1",
    title: "Summer Travel Vlog 2024",
    description: "Southeast Asia adventure highlights",
    thumbnail: "/assets/generated/travel-vlog-thumbnail.dim_320x180.jpg",
    duration: "4:32",
    resolution: "4K",
    status: "ready",
    lastEdited: "2 hours ago",
  },
  {
    id: "p2",
    title: "City Nights Timelapse",
    description: "NYC skyline 4K timelapse",
    thumbnail: "/assets/generated/city-nights-thumbnail.dim_320x180.jpg",
    duration: "1:15",
    resolution: "4K",
    status: "ready",
    lastEdited: "Yesterday",
  },
  {
    id: "p3",
    title: "Morning Fitness Routine",
    description: "20-min HIIT workout video",
    thumbnail: "/assets/generated/fitness-montage-thumbnail.dim_320x180.jpg",
    duration: "21:04",
    resolution: "1080p",
    status: "draft",
    lastEdited: "3 days ago",
  },
  {
    id: "p4",
    title: "Italian Kitchen Secrets",
    description: "Chef Marco's carbonara recipe",
    thumbnail: "/assets/generated/food-recipe-thumbnail.dim_320x180.jpg",
    duration: "8:47",
    resolution: "1080p",
    status: "processing",
    lastEdited: "5 days ago",
  },
  {
    id: "p5",
    title: "Product Launch Promo",
    description: "Tech gadget reveal video",
    thumbnail: "/assets/generated/travel-vlog-thumbnail.dim_320x180.jpg",
    duration: "0:30",
    resolution: "4K",
    status: "ready",
    lastEdited: "1 week ago",
  },
  {
    id: "p6",
    title: "Wedding Highlights 2024",
    description: "Cinematic wedding film",
    thumbnail: "/assets/generated/city-nights-thumbnail.dim_320x180.jpg",
    duration: "6:20",
    resolution: "4K",
    status: "draft",
    lastEdited: "2 weeks ago",
  },
];

// ─── Templates ────────────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: TemplateMock[] = [
  {
    id: "t1",
    name: "Viral Reels Burst",
    category: "reels",
    style: "Fast cuts, glitch transitions",
    duration: "0:30",
    color: "#E1306C",
    tags: ["viral", "trending", "reels"],
    isPremium: false,
  },
  {
    id: "t2",
    name: "Cinematic Opener",
    category: "youtube",
    style: "Letterbox, film grain, LUT",
    duration: "0:15",
    color: "#FF8C00",
    tags: ["cinematic", "opener", "film"],
    isPremium: true,
  },
  {
    id: "t3",
    name: "TikTok Storm",
    category: "tiktok",
    style: "Beat sync, zoom cuts",
    duration: "0:15",
    color: "#69C9D0",
    tags: ["tiktok", "beatsync", "viral"],
    isPremium: false,
  },
  {
    id: "t4",
    name: "Shorts Power",
    category: "shorts",
    style: "Bold text, fast transitions",
    duration: "0:60",
    color: "#FF0000",
    tags: ["shorts", "youtube", "fast"],
    isPremium: false,
  },
  {
    id: "t5",
    name: "Neon Glitch Rave",
    category: "reels",
    style: "Neon colors, glitch effects",
    duration: "0:30",
    color: "#A855F7",
    tags: ["neon", "glitch", "rave"],
    isPremium: true,
  },
  {
    id: "t6",
    name: "Travel Montage",
    category: "youtube",
    style: "Smooth transitions, ambient music",
    duration: "1:00",
    color: "#10B981",
    tags: ["travel", "montage", "cinematic"],
    isPremium: false,
  },
  {
    id: "t7",
    name: "Cooking Close-Up",
    category: "shorts",
    style: "Macro shots, slo-mo",
    duration: "0:45",
    color: "#F59E0B",
    tags: ["food", "cooking", "macro"],
    isPremium: false,
  },
  {
    id: "t8",
    name: "Hype Promo",
    category: "tiktok",
    style: "Energetic cuts, sound effects",
    duration: "0:15",
    color: "#3B82F6",
    tags: ["promo", "hype", "energy"],
    isPremium: true,
  },
];

// ─── Effects ──────────────────────────────────────────────────────────────────

export const MOCK_EFFECTS: EffectMock[] = [
  {
    id: "e1",
    name: "Chromatic Aberration",
    category: "glitch",
    color: "#E040FB",
    isPremium: false,
  },
  {
    id: "e2",
    name: "Film Grain",
    category: "cinematic",
    color: "#B0B0B0",
    isPremium: false,
  },
  {
    id: "e3",
    name: "Vignette",
    category: "filter",
    color: "#1A1A2E",
    isPremium: false,
  },
  {
    id: "e4",
    name: "Lens Flare",
    category: "cinematic",
    color: "#FFD700",
    isPremium: true,
  },
  {
    id: "e5",
    name: "VHS Glitch",
    category: "glitch",
    color: "#00FFCC",
    isPremium: false,
  },
  {
    id: "e6",
    name: "Teal & Orange",
    category: "lut",
    color: "#FF6B35",
    isPremium: true,
  },
  {
    id: "e7",
    name: "Letterbox",
    category: "cinematic",
    color: "#2D2D2D",
    isPremium: false,
  },
  {
    id: "e8",
    name: "Neon Glow",
    category: "filter",
    color: "#A855F7",
    isPremium: true,
  },
  {
    id: "e9",
    name: "Whip Pan",
    category: "transition",
    color: "#38BDF8",
    isPremium: false,
  },
  {
    id: "e10",
    name: "Zoom Blur",
    category: "transition",
    color: "#34D399",
    isPremium: false,
  },
  {
    id: "e11",
    name: "Glitch Slice",
    category: "transition",
    color: "#F43F5E",
    isPremium: true,
  },
  {
    id: "e12",
    name: "Moody Forest",
    category: "lut",
    color: "#4ADE80",
    isPremium: false,
  },
  {
    id: "e13",
    name: "Vintage Fade",
    category: "filter",
    color: "#FBBF24",
    isPremium: false,
  },
  {
    id: "e14",
    name: "Anamorphic Flare",
    category: "cinematic",
    color: "#60A5FA",
    isPremium: true,
  },
];

// ─── Music ────────────────────────────────────────────────────────────────────

export const MOCK_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "m1",
    title: "Neon Pulse",
    artist: "SynthWave X",
    duration: "3:24",
    bpm: 128,
    genre: "Electronic",
    isPremium: false,
  },
  {
    id: "m2",
    title: "Golden Hour",
    artist: "Chill Studios",
    duration: "2:48",
    bpm: 90,
    genre: "Ambient",
    isPremium: false,
  },
  {
    id: "m3",
    title: "Hyper Drive",
    artist: "TrackMaster",
    duration: "2:15",
    bpm: 160,
    genre: "EDM",
    isPremium: true,
  },
  {
    id: "m4",
    title: "Cinematic Rise",
    artist: "OrchestraFX",
    duration: "4:02",
    bpm: 72,
    genre: "Cinematic",
    isPremium: true,
  },
  {
    id: "m5",
    title: "Lo-Fi Drift",
    artist: "BeatsLab",
    duration: "3:10",
    bpm: 85,
    genre: "Lo-Fi",
    isPremium: false,
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { date: "Mar 28", views: 2100, exports: 8, shares: 24 },
  { date: "Mar 29", views: 3400, exports: 12, shares: 38 },
  { date: "Mar 30", views: 2800, exports: 9, shares: 31 },
  { date: "Mar 31", views: 3890, exports: 14, shares: 41 },
  { date: "Apr 1", views: 5200, exports: 22, shares: 67 },
  { date: "Apr 2", views: 6100, exports: 28, shares: 89 },
  { date: "Apr 3", views: 7340, exports: 31, shares: 104 },
];

export const MOCK_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: "sp1",
    projectTitle: "Summer Travel Vlog 2024",
    platform: "instagram",
    scheduledTime: "2026-04-05 10:00",
    status: "scheduled",
    caption:
      "Paradise found 🌊 Swipe to see our epic Southeast Asia adventure! Full vlog on YouTube 📲",
    hashtags: ["travel", "summer", "wanderlust", "vlog", "paradise"],
    thumbnail: "/assets/generated/travel-vlog-thumbnail.dim_320x180.jpg",
  },
  {
    id: "sp2",
    projectTitle: "City Nights Timelapse",
    platform: "youtube",
    scheduledTime: "2026-04-06 15:00",
    status: "scheduled",
    caption:
      "NYC after dark is pure magic. 4K timelapse of the city that never sleeps.",
    hashtags: ["nyc", "timelapse", "4k", "citylife"],
    thumbnail: "/assets/generated/city-nights-thumbnail.dim_320x180.jpg",
  },
  {
    id: "sp3",
    projectTitle: "Morning Fitness Routine",
    platform: "tiktok",
    scheduledTime: "2026-04-04 07:00",
    status: "published",
    caption: "Start your day RIGHT 💪 20-min HIIT that changed my life!",
    hashtags: ["fitness", "hiit", "workout", "gym", "health"],
    thumbnail: "/assets/generated/fitness-montage-thumbnail.dim_320x180.jpg",
  },
  {
    id: "sp4",
    projectTitle: "Italian Kitchen Secrets",
    platform: "instagram",
    scheduledTime: "2026-04-03 12:00",
    status: "failed",
    caption: "Chef Marco's secret carbonara recipe you need to try 🍝",
    hashtags: ["food", "recipe", "italian", "cooking", "pasta"],
    thumbnail: "/assets/generated/food-recipe-thumbnail.dim_320x180.jpg",
  },
];

// ─── Comments ─────────────────────────────────────────────────────────────────

export const MOCK_COMMENTS: CommentMock[] = [
  {
    id: "c1",
    author: "Sarah K.",
    avatar: "👩‍🎨",
    time: "2 min ago",
    text: "The color grading on the beach scene looks a bit washed out. Can we bump the saturation?",
    resolved: false,
  },
  {
    id: "c2",
    author: "Jordan M.",
    avatar: "🧑‍💻",
    time: "15 min ago",
    text: "Transition at 1:24 is too abrupt. Suggest a cross-dissolve here.",
    resolved: true,
  },
  {
    id: "c3",
    author: "Alex C.",
    avatar: "🎬",
    time: "1 hour ago",
    text: "Music drop at 0:45 syncs perfectly with the cut. Great work!",
    resolved: false,
  },
  {
    id: "c4",
    author: "Priya R.",
    avatar: "✨",
    time: "3 hours ago",
    text: "Can we add auto-captions for the voiceover section from 2:10 to 2:40?",
    resolved: false,
  },
  {
    id: "c5",
    author: "Marcus T.",
    avatar: "🎵",
    time: "Yesterday",
    text: "Audio levels are inconsistent between clips 3 and 4. Normalize please.",
    resolved: true,
  },
];

// ─── Version History ──────────────────────────────────────────────────────────

export const MOCK_VERSIONS: VersionMock[] = [
  {
    id: "v6",
    label: "Auto-save v6",
    timestamp: "Today, 2:14 PM",
    size: "4.2 MB",
    isCurrent: true,
  },
  {
    id: "v5",
    label: "Auto-save v5",
    timestamp: "Today, 11:30 AM",
    size: "4.0 MB",
    isCurrent: false,
  },
  {
    id: "v4",
    label: "Manual save — Color grade",
    timestamp: "Yesterday, 6:45 PM",
    size: "3.8 MB",
    isCurrent: false,
  },
  {
    id: "v3",
    label: "Auto-save v3",
    timestamp: "Yesterday, 2:00 PM",
    size: "3.5 MB",
    isCurrent: false,
  },
  {
    id: "v2",
    label: "Manual save — Rough cut",
    timestamp: "Apr 1, 9:12 AM",
    size: "2.9 MB",
    isCurrent: false,
  },
  {
    id: "v1",
    label: "Initial save",
    timestamp: "Mar 30, 3:00 PM",
    size: "1.2 MB",
    isCurrent: false,
  },
];

// ─── Beat Markers ─────────────────────────────────────────────────────────────

export const MOCK_BEAT_MARKERS: number[] = [
  1.2, 2.4, 3.6, 4.8, 6.0, 7.2, 8.5, 9.8, 11.0, 12.3, 13.5, 14.7,
];

// ─── Timeline ────────────────────────────────────────────────────────────────

export interface TimelineClip {
  id: string;
  track: "video" | "audio" | "text" | "overlay";
  start: number; // seconds
  duration: number; // seconds
  label: string;
  color?: string;
}

export const MOCK_TIMELINE_CLIPS: TimelineClip[] = [
  { id: "tc1", track: "video", start: 0, duration: 6, label: "Beach Scene" },
  {
    id: "tc2",
    track: "video",
    start: 6.5,
    duration: 4.5,
    label: "Sunset Walk",
  },
  { id: "tc3", track: "video", start: 11.5, duration: 5, label: "City Lights" },
  { id: "tc4", track: "video", start: 17, duration: 7, label: "Final Montage" },
  { id: "tc5", track: "audio", start: 0, duration: 12, label: "Neon Pulse" },
  {
    id: "tc6",
    track: "audio",
    start: 12.5,
    duration: 11.5,
    label: "Golden Hour",
  },
  { id: "tc7", track: "text", start: 1, duration: 3, label: "Title" },
  { id: "tc8", track: "text", start: 8, duration: 4, label: "Subtitle" },
  { id: "tc9", track: "overlay", start: 0.5, duration: 2, label: "Logo" },
  {
    id: "tc10",
    track: "overlay",
    start: 14,
    duration: 3,
    label: "CTA Overlay",
  },
];
