import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Crown, Star, Zap } from "lucide-react";
import { motion } from "motion/react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  "3 active projects",
  "1080p export",
  "10 AI credits/month",
  "Basic effects library",
  "Watermarked exports",
  "Standard templates",
];

const PRO_FEATURES = [
  "Unlimited projects",
  "4K export (up to 60fps)",
  "Unlimited AI credits",
  "Premium effects & LUTs",
  "Watermark-free exports",
  "200+ premium templates",
  "Priority rendering",
  "Direct social posting",
  "Custom brand kit",
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl glass border-border"
        data-ocid="upgrade.dialog"
        style={{
          background: "oklch(0.12 0.022 233 / 0.97)",
          backdropFilter: "blur(20px)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Crown className="w-5 h-5 text-yellow-400" />
            Upgrade to Luminar Pro
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Free Tier */}
            <div className="rounded-lg border border-border p-4 bg-muted/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    Free
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    $0 / month
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground"
                  >
                    <Check className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Tier */}
            <div
              className="rounded-lg border p-4 relative overflow-hidden"
              style={{
                borderColor: "oklch(0.78 0.17 178 / 0.6)",
                background: "oklch(0.14 0.024 233)",
                boxShadow: "0 0 30px oklch(0.78 0.17 178 / 0.15)",
              }}
            >
              <div
                className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.75 0.16 178), oklch(0.82 0.20 170))",
                  color: "oklch(0.09 0.018 233)",
                }}
              >
                POPULAR
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.78 0.17 178 / 0.2)" }}
                >
                  <Crown className="w-3.5 h-3.5 text-teal" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    Pro
                  </p>
                  <p className="text-[11px] text-teal">$12 / month</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[12px] text-foreground"
                  >
                    <Check className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              data-ocid="upgrade.cancel_button"
              className="flex-1 py-2.5 rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 text-[13px] font-medium transition-all"
            >
              Maybe Later
            </button>
            <motion.button
              data-ocid="upgrade.confirm_button"
              className="flex-2 px-8 py-2.5 rounded text-[13px] font-semibold flex items-center gap-2 btn-gradient transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ flex: 2 }}
            >
              <Zap className="w-4 h-4" />
              Upgrade to Pro — $12/mo
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;
