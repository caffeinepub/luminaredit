import { Crown, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { MOCK_TEMPLATES, type TemplateMock } from "../data/mockData";

const CATEGORIES = ["all", "reels", "shorts", "tiktok", "youtube"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  reels: "#E1306C",
  shorts: "#FF0000",
  tiktok: "#69C9D0",
  youtube: "#FF0000",
};

export function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const filtered = MOCK_TEMPLATES.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.includes(search.toLowerCase()));
    const matchCat = category === "all" || t.category === category;
    const matchFilter =
      filter === "all" || (filter === "free" ? !t.isPremium : t.isPremium);
    return matchSearch && matchCat && matchFilter;
  });

  return (
    <div className="h-full overflow-y-auto p-6" data-ocid="templates.page">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-foreground">
            Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Jump-start your next viral video
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="bg-input border border-border rounded-lg py-2 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/50 transition-colors w-48"
              data-ocid="templates.search.input"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                data-ocid={`templates.filter_${c}.tab`}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all ${
                  category === c
                    ? "bg-teal/20 text-teal border border-teal/40"
                    : "bg-muted/20 text-muted-foreground border border-border hover:border-teal/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            {(["all", "free", "premium"] as const).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-teal/20 text-teal border border-teal/40"
                    : "bg-muted/20 text-muted-foreground border border-border hover:border-teal/30"
                }`}
              >
                {f === "premium" ? (
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Pro
                  </span>
                ) : (
                  f
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-4 gap-4" data-ocid="templates.list">
          {filtered.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index + 1}
            />
          ))}
          {filtered.length === 0 && (
            <div
              className="col-span-4 flex flex-col items-center justify-center py-16"
              data-ocid="templates.empty_state"
            >
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  index,
}: { template: TemplateMock; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="group relative rounded-xl border border-border overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-ocid={`templates.item.${index}`}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.022 233), oklch(0.14 0.024 233))",
        boxShadow: hovered
          ? `0 8px 30px ${template.color}40`
          : "0 4px 20px oklch(0 0 0 / 0.3)",
        borderColor: hovered ? `${template.color}50` : undefined,
        transition: "box-shadow 0.3s, border-color 0.3s",
      }}
    >
      {/* Color preview area */}
      <div
        className="h-28 flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${template.color}30, ${template.color}10)`,
        }}
      >
        <div
          className="text-3xl font-display font-black tracking-tight"
          style={{
            color: template.color,
            textShadow: `0 0 30px ${template.color}80`,
          }}
        >
          {template.name.split(" ")[0]}
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
          {template.duration}
        </div>
        {/* Category badge */}
        <div
          className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
          style={{
            background: `${CATEGORY_COLORS[template.category]}30`,
            color: CATEGORY_COLORS[template.category],
          }}
        >
          {template.category}
        </div>
        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] font-bold text-yellow-400 bg-yellow-400/15 px-1.5 py-0.5 rounded">
            <Crown className="w-2.5 h-2.5" /> PRO
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="text-[12px] font-semibold text-foreground line-clamp-1">
          {template.name}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
          {template.style}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {template.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover overlay */}
      {hovered && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ background: "oklch(0.09 0.018 233 / 0.85)" }}
        >
          <button
            type="button"
            data-ocid={`templates.apply_template.button.${index}`}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold btn-gradient"
          >
            Use Template
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default TemplatesPage;
