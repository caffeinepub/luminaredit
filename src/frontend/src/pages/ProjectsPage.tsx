import {
  CheckCircle,
  Clock,
  Filter,
  Loader2,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { MOCK_PROJECTS, type ProjectMock } from "../data/mockData";

interface ProjectsPageProps {
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

const STATUS_COLORS = {
  ready: "text-teal bg-teal/15",
  draft: "text-yellow-400 bg-yellow-400/15",
  processing: "text-blue-400 bg-blue-400/15",
};

const STATUS_LABELS = {
  ready: "Ready",
  draft: "Draft",
  processing: "Processing",
};

export function ProjectsPage({
  onOpenProject,
  onNewProject,
}: ProjectsPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "ready" | "draft" | "processing"
  >("all");

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full overflow-y-auto p-6" data-ocid="projects.page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">
              My Projects
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {MOCK_PROJECTS.length} projects total
            </p>
          </div>
          <motion.button
            onClick={onNewProject}
            data-ocid="projects.new_project.button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold btn-gradient transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" /> New Project
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-input border border-border rounded-lg py-2 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/50 transition-colors"
              data-ocid="projects.search.input"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "ready", "draft", "processing"] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                data-ocid={`projects.filter_${f}.tab`}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-teal/20 text-teal border border-teal/40"
                    : "bg-muted/20 text-muted-foreground border border-border hover:border-teal/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-3 gap-4" data-ocid="projects.list">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index + 1}
                onOpen={() => onOpenProject(project.id)}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div
              className="col-span-3 flex flex-col items-center justify-center py-20"
              data-ocid="projects.empty_state"
            >
              <Filter className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No projects found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: { project: ProjectMock; index: number; onOpen: () => void }) {
  return (
    <motion.div
      className="group rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-teal/40 transition-all"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      onClick={onOpen}
      data-ocid={`projects.item.${index}`}
      style={{
        boxShadow: "0 4px 20px oklch(0 0 0 / 0.3)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <Clock className="w-3 h-3 text-white/70" />
          <span className="text-[11px] text-white/80 font-mono">
            {project.duration}
          </span>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="text-[10px] font-bold text-teal bg-black/60 px-1.5 py-0.5 rounded border border-teal/30">
            {project.resolution}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-foreground leading-tight line-clamp-1">
            {project.title}
          </h3>
          <button
            type="button"
            className="p-0.5 rounded text-muted-foreground hover:text-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
          {project.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
              STATUS_COLORS[project.status]
            }`}
          >
            {project.status === "processing" ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                {STATUS_LABELS[project.status]}
              </span>
            ) : (
              STATUS_LABELS[project.status]
            )}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {project.lastEdited}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectsPage;
