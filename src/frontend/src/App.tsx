import { Toaster } from "@/components/ui/sonner";
import {
  BarChart2,
  Calendar,
  Cloud,
  Cpu,
  Crown,
  Download,
  Film,
  FolderOpen,
  LayoutTemplate,
  Menu,
  MessageSquare,
  Pencil,
  Settings,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CollabPanel } from "./components/CollabPanel";
import { ExportModal } from "./components/ExportModal";
import { NewProjectModal } from "./components/NewProjectModal";
import { UpgradeModal } from "./components/UpgradeModal";
import { MOCK_COMMENTS } from "./data/mockData";
import { AIContentEnginePage } from "./pages/AIContentEnginePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { EditorPage } from "./pages/EditorPage";
import { PlannerPage } from "./pages/PlannerPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TemplatesPage } from "./pages/TemplatesPage";

type Page =
  | "editor"
  | "projects"
  | "templates"
  | "analytics"
  | "planner"
  | "ai-engine"
  | "settings";

const NAV_ITEMS: Array<{
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "editor", label: "Editor", icon: Film },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "planner", label: "Planner", icon: Calendar },
  { id: "ai-engine", label: "AI Engine", icon: Cpu },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("editor");
  const [showExport, setShowExport] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showCollab, setShowCollab] = useState(false);
  const [projectTitle, setProjectTitle] = useState(
    "Summer Travel Vlog 2024.lum",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unresolvedComments = MOCK_COMMENTS.filter((c) => !c.resolved).length;

  const handleShare = () => toast.success("Share link copied to clipboard!");

  const handleNewProject = (title: string) => {
    setProjectTitle(`${title}.lum`);
    setCurrentPage("editor");
    toast.success(`Project "${title}" created!`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── Top Navigation Bar (L1 elevation) ──────────────────────── */}
      <header
        className="flex items-center h-11 px-3 flex-shrink-0 z-50"
        data-ocid="app.header.panel"
        style={{
          background: "var(--elev-1)",
          borderBottom: "1px solid oklch(0.23 0.026 230 / 0.8)",
          boxShadow:
            "0 1px 0 oklch(1 0 0 / 0.04) inset, 0 2px 8px oklch(0 0 0 / 0.35)",
        }}
      >
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 min-w-0 mr-4">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="app.sidebar_toggle.button"
          >
            <Menu className="w-4 h-4" />
          </button>
          <img
            src="/assets/generated/luminar-logo-icon-transparent.dim_64x64.png"
            alt="Luminar Edit"
            className="w-5 h-5 flex-shrink-0"
          />
          <span className="text-label-lg font-bold font-display tracking-tight gradient-text select-none">
            LUMINAR EDIT
          </span>
        </div>

        {/* Center: Project title + save status */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-label-sm text-foreground/80 font-medium truncate max-w-[220px]">
              {projectTitle}
            </span>
            <button
              type="button"
              className="p-0.5 rounded text-muted-foreground/60 hover:text-teal transition-colors"
              onClick={() => {
                const newTitle = prompt(
                  "Project name:",
                  projectTitle.replace(".lum", ""),
                );
                if (newTitle) setProjectTitle(`${newTitle}.lum`);
              }}
            >
              <Pencil className="w-2.5 h-2.5" />
            </button>
            <div
              className="flex items-center gap-1 text-label-xs px-1.5 py-0.5 rounded-full"
              style={{
                color: "var(--teal-dim)",
                background: "oklch(0.80 0.18 178 / 0.08)",
              }}
            >
              <Cloud className="w-2.5 h-2.5" />
              <span>Saved</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 ml-4">
          <motion.button
            type="button"
            onClick={() => setShowUpgrade(true)}
            data-ocid="app.upgrade.button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-semibold btn-gradient"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              boxShadow:
                "0 2px 8px oklch(0 0 0 / 0.4), 0 0 14px oklch(0.80 0.18 178 / 0.30)",
            }}
          >
            <Crown className="w-3.5 h-3.5" /> Upgrade to Pro
          </motion.button>
          <button
            type="button"
            onClick={() => setShowExport(true)}
            data-ocid="app.export.button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-medium border border-border bg-white/4 text-muted-foreground hover:text-foreground hover:border-teal/40 hover:bg-white/6 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            type="button"
            onClick={() => setShowCollab(true)}
            data-ocid="app.comments.button"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-medium border border-border bg-white/4 text-muted-foreground hover:text-foreground hover:border-teal/40 hover:bg-white/6 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Comments
            {unresolvedComments > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal text-[8px] font-bold text-black flex items-center justify-center">
                {unresolvedComments}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleShare}
            data-ocid="app.share.button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-medium border border-border bg-white/4 text-muted-foreground hover:text-foreground hover:border-teal/40 hover:bg-white/6 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (L1 elevation — same level as header, continuous) */}
        <motion.nav
          animate={{ width: sidebarCollapsed ? 44 : 152 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            background: "var(--elev-1)",
            borderRight: "1px solid oklch(0.23 0.026 230 / 0.7)",
          }}
          data-ocid="app.sidebar.panel"
        >
          <div className="flex-1 py-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                data-ocid={`nav.${item.id}.link`}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 text-left relative ${
                  currentPage === item.id
                    ? "text-teal"
                    : "text-muted-foreground hover:text-foreground/80 hover:bg-white/4"
                }`}
              >
                {/* Active indicator bar */}
                {currentPage === item.id && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "var(--teal-full)" }}
                  />
                )}
                {/* Active bg */}
                {currentPage === item.id && (
                  <span
                    className="absolute inset-0"
                    style={{ background: "oklch(0.80 0.18 178 / 0.07)" }}
                  />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                {!sidebarCollapsed && (
                  <span className="text-label-sm font-medium truncate relative z-10">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>

          {!sidebarCollapsed && (
            <div className="px-3 py-2.5 border-t border-border/60">
              <p className="text-label-xs text-muted-foreground/40 text-center leading-snug">
                &copy; {new Date().getFullYear()}{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          )}
        </motion.nav>

        {/* Main content area (L0 — darkest canvas) */}
        <main className="flex-1 overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {currentPage === "editor" && <EditorPage />}
              {currentPage === "projects" && (
                <ProjectsPage
                  onOpenProject={() => setCurrentPage("editor")}
                  onNewProject={() => setShowNewProject(true)}
                />
              )}
              {currentPage === "templates" && <TemplatesPage />}
              {currentPage === "analytics" && <AnalyticsPage />}
              {currentPage === "planner" && <PlannerPage />}
              {currentPage === "ai-engine" && <AIContentEnginePage />}
              {currentPage === "settings" && (
                <SettingsPage onUpgrade={() => setShowUpgrade(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <ExportModal open={showExport} onClose={() => setShowExport(false)} />
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={handleNewProject}
      />
      <CollabPanel open={showCollab} onClose={() => setShowCollab(false)} />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.145 0.024 233)",
            border: "1px solid oklch(0.26 0.028 228 / 0.55)",
            color: "oklch(0.93 0.010 220)",
            fontSize: "var(--text-sm)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.5)",
          },
        }}
      />
    </div>
  );
}
