import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  List,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SiInstagram, SiTiktok, SiX, SiYoutube } from "react-icons/si";
import {
  MOCK_PROJECTS,
  MOCK_SCHEDULED_POSTS,
  type ScheduledPost,
} from "../data/mockData";

const PLATFORM_CONFIG = {
  instagram: { icon: SiInstagram, color: "#E1306C", label: "Instagram" },
  youtube: { icon: SiYoutube, color: "#FF0000", label: "YouTube" },
  tiktok: { icon: SiTiktok, color: "#69C9D0", label: "TikTok" },
  twitter: { icon: SiX, color: "#1DA1F2", label: "Twitter" },
};

const STATUS_CONFIG = {
  scheduled: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/15",
    label: "Scheduled",
  },
  published: {
    icon: CheckCircle,
    color: "text-teal",
    bg: "bg-teal/15",
    label: "Published",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-400/15",
    label: "Failed",
  },
};

const TRENDING_HASHTAGS: Record<ScheduledPost["platform"], string> = {
  instagram: "#viral #trending #reels #contentcreator #fyp #aesthetic #explore",
  youtube: "#youtube #viral #vlog #youtuber #subscribe #trending #shorts",
  tiktok: "#fyp #foryou #trending #tiktok #viral #contentcreator #foryoupage",
  twitter: "#trending #viral #content #creator #socialmedia #follow #retweet",
};

export function PlannerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(MOCK_SCHEDULED_POSTS);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    projectId: "",
    platform: "instagram" as ScheduledPost["platform"],
    scheduledTime: "",
    caption: "",
    hashtags: "",
  });
  const [generatingHashtags, setGeneratingHashtags] = useState(false);

  const handleGenerateHashtags = () => {
    setGeneratingHashtags(true);
    setTimeout(() => {
      setNewPost((p) => ({
        ...p,
        hashtags:
          TRENDING_HASHTAGS[p.platform] ||
          "#viral #trending #fyp #contentcreator #reels",
      }));
      setGeneratingHashtags(false);
    }, 800);
  };

  const handleAddPost = () => {
    if (!newPost.projectId || !newPost.caption) return;
    const project = MOCK_PROJECTS.find((p) => p.id === newPost.projectId);
    if (!project) return;
    const post: ScheduledPost = {
      id: `sp${Date.now()}`,
      projectTitle: project.title,
      platform: newPost.platform,
      scheduledTime:
        newPost.scheduledTime ||
        new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "scheduled",
      caption: newPost.caption,
      hashtags: newPost.hashtags
        .split(" ")
        .filter(Boolean)
        .map((h) => h.replace(/^#/, "")),
      thumbnail: project.thumbnail,
    };
    setPosts((prev) => [post, ...prev]);
    setShowNewPost(false);
    setNewPost({
      projectId: "",
      platform: "instagram",
      scheduledTime: "",
      caption: "",
      hashtags: "",
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6" data-ocid="planner.page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">
              Content Planner
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Schedule and manage your content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setView("list")}
                data-ocid="planner.list_view.toggle"
                className={`p-2 transition-colors ${view === "list" ? "bg-teal/20 text-teal" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("calendar")}
                data-ocid="planner.calendar_view.toggle"
                className={`p-2 transition-colors ${view === "calendar" ? "bg-teal/20 text-teal" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            <motion.button
              onClick={() => setShowNewPost(true)}
              data-ocid="planner.new_post.button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold btn-gradient"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" /> Schedule Post
            </motion.button>
          </div>
        </div>

        {/* New Post Form */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className="mb-5 rounded-xl border border-teal/40 overflow-hidden"
              data-ocid="planner.new_post.panel"
              style={{
                background: "oklch(0.12 0.022 233)",
                boxShadow: "0 0 20px oklch(0.78 0.17 178 / 0.15)",
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-foreground">
                    Schedule New Post
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewPost(false)}
                    data-ocid="planner.close_new_post.button"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      Project
                    </Label>
                    <Select
                      value={newPost.projectId}
                      onValueChange={(v) =>
                        setNewPost((p) => ({ ...p, projectId: v }))
                      }
                    >
                      <SelectTrigger
                        data-ocid="planner.project.select"
                        className="h-8 text-[12px] bg-input border-border"
                      >
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {MOCK_PROJECTS.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="text-[12px]"
                          >
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      Platform
                    </Label>
                    <Select
                      value={newPost.platform}
                      onValueChange={(v) =>
                        setNewPost((p) => ({
                          ...p,
                          platform: v as ScheduledPost["platform"],
                        }))
                      }
                    >
                      <SelectTrigger
                        data-ocid="planner.platform.select"
                        className="h-8 text-[12px] bg-input border-border"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="instagram" className="text-[12px]">
                          Instagram
                        </SelectItem>
                        <SelectItem value="youtube" className="text-[12px]">
                          YouTube
                        </SelectItem>
                        <SelectItem value="tiktok" className="text-[12px]">
                          TikTok
                        </SelectItem>
                        <SelectItem value="twitter" className="text-[12px]">
                          Twitter
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      Schedule Time
                    </Label>
                    <Input
                      type="datetime-local"
                      value={newPost.scheduledTime}
                      onChange={(e) =>
                        setNewPost((p) => ({
                          ...p,
                          scheduledTime: e.target.value,
                        }))
                      }
                      className="h-8 text-[12px] bg-input border-border"
                      data-ocid="planner.schedule_time.input"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      Hashtags
                    </Label>
                    <div className="flex gap-1.5">
                      <Input
                        value={newPost.hashtags}
                        onChange={(e) =>
                          setNewPost((p) => ({
                            ...p,
                            hashtags: e.target.value,
                          }))
                        }
                        placeholder="#travel #summer #vlog"
                        className="h-8 text-[12px] bg-input border-border flex-1"
                        data-ocid="planner.hashtags.input"
                      />
                      <motion.button
                        type="button"
                        onClick={handleGenerateHashtags}
                        disabled={generatingHashtags}
                        data-ocid="planner.generate_hashtags.button"
                        title="Generate trending hashtags"
                        className="h-8 px-2 rounded border border-teal/40 bg-teal/10 text-teal hover:bg-teal/20 transition-all disabled:opacity-40 flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[10px] font-semibold">
                          {generatingHashtags ? "..." : "AI"}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      Caption
                    </Label>
                    <Textarea
                      value={newPost.caption}
                      onChange={(e) =>
                        setNewPost((p) => ({ ...p, caption: e.target.value }))
                      }
                      placeholder="Write your caption..."
                      className="text-[12px] bg-input border-border resize-none h-16"
                      data-ocid="planner.caption.textarea"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewPost(false)}
                    data-ocid="planner.cancel_post.button"
                    className="flex-1 py-1.5 rounded border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleAddPost}
                    data-ocid="planner.submit_post.button"
                    disabled={!newPost.projectId || !newPost.caption}
                    className="flex-1 py-1.5 rounded text-[12px] font-semibold btn-gradient disabled:opacity-40 flex items-center justify-center gap-1.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-3.5 h-3.5" /> Schedule
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts List */}
        <div className="space-y-3" data-ocid="planner.list">
          {posts.map((post, index) => {
            const platform = PLATFORM_CONFIG[post.platform];
            const status = STATUS_CONFIG[post.status];
            return (
              <motion.div
                key={post.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                data-ocid={`planner.item.${index + 1}`}
              >
                <div className="flex items-center gap-4 p-4">
                  <img
                    src={post.thumbnail}
                    alt={post.projectTitle}
                    className="w-16 h-10 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-semibold text-foreground truncate">
                        {post.projectTitle}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <platform.icon
                          className="w-3.5 h-3.5"
                          style={{ color: platform.color }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {platform.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {post.caption}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.hashtags.slice(0, 3).map((h) => (
                        <span
                          key={h}
                          className="text-[9px] text-teal bg-teal/10 px-1.5 py-0.5 rounded-full"
                        >
                          #{h}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`flex items-center gap-1 justify-end text-[11px] font-medium ${status.color}`}
                    >
                      <status.icon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {post.scheduledTime}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {posts.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16"
              data-ocid="planner.empty_state"
            >
              <Calendar className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No scheduled posts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlannerPage;
