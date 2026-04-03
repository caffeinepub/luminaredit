import {
  ArrowUpRight,
  Download,
  FolderOpen,
  Share2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { MOCK_ANALYTICS, MOCK_PROJECTS } from "../data/mockData";

function SimpleLineChart({ data }: { data: typeof MOCK_ANALYTICS }) {
  const maxViews = Math.max(...data.map((d) => d.views));
  const width = 500;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 24, left: 40 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.views / maxViews) * chartH,
    views: d.views,
    date: d.date,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
    >
      <title>Views over time chart</title>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="oklch(0.78 0.17 178)"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.78 0.17 178)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padding.top + t * chartH;
        const val = Math.round(maxViews * (1 - t));
        return (
          <g key={t}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="oklch(0.22 0.025 230)"
              strokeDasharray="3,4"
            />
            <text
              x={padding.left - 4}
              y={y + 4}
              fontSize="9"
              textAnchor="end"
              fill="oklch(0.43 0.03 225)"
            >
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#lineGrad)" />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke="oklch(0.78 0.17 178)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 4px oklch(0.78 0.17 178 / 0.6))" }}
      />

      {/* Data points */}
      {points.map((p) => (
        <g key={p.date}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="oklch(0.78 0.17 178)"
            style={{ filter: "drop-shadow(0 0 6px oklch(0.78 0.17 178))" }}
          />
          <text
            x={p.x}
            y={height - padding.bottom + 12}
            fontSize="9"
            textAnchor="middle"
            fill="oklch(0.43 0.03 225)"
          >
            {p.date.split(" ")[1]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PlatformBar({
  label,
  value,
  max,
  color,
}: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-muted-foreground w-20 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-mono text-foreground w-12 text-right">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function AnalyticsPage() {
  const totalViews = MOCK_ANALYTICS.reduce((s, d) => s + d.views, 0);
  const totalExports = MOCK_ANALYTICS.reduce((s, d) => s + d.exports, 0);
  const totalShares = MOCK_ANALYTICS.reduce((s, d) => s + d.shares, 0);

  const statCards = [
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: TrendingUp,
      color: "text-teal",
      bg: "bg-teal/10",
      change: "+24%",
    },
    {
      label: "Total Exports",
      value: totalExports.toString(),
      icon: Download,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      change: "+18%",
    },
    {
      label: "Total Shares",
      value: totalShares.toString(),
      icon: Share2,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      change: "+31%",
    },
    {
      label: "Active Projects",
      value: MOCK_PROJECTS.length.toString(),
      icon: FolderOpen,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      change: "+2",
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6" data-ocid="analytics.page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your content performance
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              className="rounded-xl border border-border bg-card p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              data-ocid={`analytics.stat.card.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <span className="text-[11px] text-teal flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">
                {card.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Views Chart */}
        <motion.div
          className="rounded-xl border border-border bg-card p-5 mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">
                Views Over Time
              </h2>
              <p className="text-[11px] text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "oklch(0.78 0.17 178)" }}
              />
              <span className="text-[11px] text-muted-foreground">Views</span>
            </div>
          </div>
          <SimpleLineChart data={MOCK_ANALYTICS} />
        </motion.div>

        {/* Platform Breakdown + Recent Projects */}
        <div className="grid grid-cols-2 gap-5">
          <motion.div
            className="rounded-xl border border-border bg-card p-5"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-[14px] font-semibold text-foreground mb-4">
              Platform Breakdown
            </h2>
            <div className="space-y-3">
              <PlatformBar
                label="YouTube"
                value={18200}
                max={25000}
                color="#FF0000"
              />
              <PlatformBar
                label="Instagram"
                value={14500}
                max={25000}
                color="#E1306C"
              />
              <PlatformBar
                label="TikTok"
                value={22800}
                max={25000}
                color="#69C9D0"
              />
              <PlatformBar
                label="Twitter"
                value={6300}
                max={25000}
                color="#1DA1F2"
              />
            </div>
          </motion.div>

          <motion.div
            className="rounded-xl border border-border bg-card p-5"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-[14px] font-semibold text-foreground mb-4">
              Top Performing Projects
            </h2>
            <div className="space-y-2.5">
              {MOCK_PROJECTS.slice(0, 4).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-muted-foreground w-4">
                    {i + 1}
                  </span>
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-10 h-6 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.duration} · {p.resolution}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-teal">
                    {((4 - i) * 3200 + 1000).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
