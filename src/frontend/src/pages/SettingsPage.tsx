import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Check,
  Clock,
  Crown,
  Download,
  History,
  RotateCcw,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { MOCK_VERSIONS } from "../data/mockData";

interface SettingsPageProps {
  onUpgrade: () => void;
}

export function SettingsPage({ onUpgrade }: SettingsPageProps) {
  const [displayName, setDisplayName] = useState("Alex Creator");
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    exports: true,
    updates: false,
    tips: true,
  });
  const [defaultResolution, setDefaultResolution] = useState("1080p");
  const [defaultFps, setDefaultFps] = useState("30");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRestore = (label: string) => {
    toast.success(`Restored to "${label}"`);
  };

  return (
    <div className="h-full overflow-y-auto p-6" data-ocid="settings.page">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-5">
          {/* Profile Section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-teal" />
              <h2 className="text-[14px] font-semibold text-foreground">
                Profile
              </h2>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-teal/20 border-2 border-teal/40 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-teal">A</span>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  data-ocid="settings.avatar.upload_button"
                  className="text-[12px] text-teal hover:text-teal-bright border border-teal/30 hover:border-teal/60 px-3 py-1.5 rounded-lg transition-all"
                >
                  Change Avatar
                </button>
                <p className="text-[11px] text-muted-foreground mt-1">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Display Name
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-8 text-[13px] bg-input border-border"
                  data-ocid="settings.display_name.input"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Email
                </Label>
                <Input
                  defaultValue="alex@creator.studio"
                  disabled
                  className="h-8 text-[13px] bg-input border-border opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-yellow-400" />
              <h2 className="text-[14px] font-semibold text-foreground">
                Subscription
              </h2>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    FREE
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    Free Plan
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    10 AI credits · 3 projects · 1080p export
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onUpgrade}
                data-ocid="settings.upgrade.button"
                className="px-4 py-1.5 rounded-lg text-[12px] font-semibold btn-gradient"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Upgrade to Pro
              </motion.button>
            </div>
            <div className="space-y-2">
              {[
                "Unlimited projects & AI credits",
                "4K export with 60fps",
                "200+ premium templates",
                "Watermark-free exports",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-[12px] text-muted-foreground"
                >
                  <Check className="w-3.5 h-3.5 text-teal/60 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Export Preferences */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-teal" />
              <h2 className="text-[14px] font-semibold text-foreground">
                Export Preferences
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Default Resolution
                </Label>
                <Select
                  value={defaultResolution}
                  onValueChange={setDefaultResolution}
                >
                  <SelectTrigger
                    data-ocid="settings.resolution.select"
                    className="h-8 text-[12px] bg-input border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="720p">720p HD</SelectItem>
                    <SelectItem value="1080p">1080p Full HD</SelectItem>
                    <SelectItem value="2k">2K QHD</SelectItem>
                    <SelectItem value="4k">4K Ultra HD (Pro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">
                  Default Frame Rate
                </Label>
                <Select value={defaultFps} onValueChange={setDefaultFps}>
                  <SelectTrigger
                    data-ocid="settings.fps.select"
                    className="h-8 text-[12px] bg-input border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="24">24 fps</SelectItem>
                    <SelectItem value="30">30 fps</SelectItem>
                    <SelectItem value="60">60 fps (Pro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-teal" />
              <h2 className="text-[14px] font-semibold text-foreground">
                Notifications
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  key: "exports" as const,
                  label: "Export complete notifications",
                  desc: "Get notified when your export finishes",
                },
                {
                  key: "updates" as const,
                  label: "Product updates",
                  desc: "New features and improvements",
                },
                {
                  key: "tips" as const,
                  label: "Creator tips & tricks",
                  desc: "Weekly content tips",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(v) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: v }))
                    }
                    data-ocid={`settings.notify_${item.key}.switch`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Version History */}
          <div
            className="rounded-xl border border-border bg-card p-5"
            data-ocid="settings.version_history.section"
          >
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-teal" />
              <h2 className="text-[14px] font-semibold text-foreground">
                Version History
              </h2>
            </div>
            <div className="space-y-2">
              {MOCK_VERSIONS.map((version, i) => (
                <motion.div
                  key={version.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    version.isCurrent
                      ? "border-teal/40 bg-teal/5"
                      : "border-border bg-muted/10"
                  }`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`settings.version.${version.id}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      version.isCurrent ? "bg-teal/20" : "bg-muted/30"
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        version.isCurrent
                          ? "text-teal"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-semibold text-foreground truncate">
                        {version.label}
                      </p>
                      {version.isCurrent && (
                        <span className="text-[9px] bg-teal/20 text-teal px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        {version.timestamp}
                      </p>
                      <span className="text-muted-foreground/30">·</span>
                      <p className="text-[10px] text-muted-foreground">
                        {version.size}
                      </p>
                    </div>
                  </div>
                  {!version.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRestore(version.label)}
                      data-ocid={`settings.restore_${version.id}.button`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-white/3 hover:bg-white/6 hover:border-teal/30 text-[11px] text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <motion.button
              onClick={handleSave}
              data-ocid="settings.save.button"
              className={`px-6 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                saved
                  ? "bg-teal/20 text-teal border border-teal/40"
                  : "btn-gradient"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saved ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Saved!
                </span>
              ) : (
                "Save Changes"
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
