import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { FolderPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export function NewProjectModal({
  open,
  onClose,
  onCreate,
}: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title);
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md glass border-border"
        data-ocid="new_project.dialog"
        style={{
          background: "oklch(0.12 0.022 233 / 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FolderPlus className="w-5 h-5 text-teal" />
            New Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">
              Project Title *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Video"
              className="h-8 text-[13px] bg-input border-border"
              data-ocid="new_project.title.input"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              className="text-[12px] bg-input border-border resize-none h-16"
              data-ocid="new_project.description.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">
                Resolution
              </Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger
                  data-ocid="new_project.resolution.select"
                  className="h-8 text-[12px] bg-input border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="2k">2K QHD</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">
                Aspect Ratio
              </Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger
                  data-ocid="new_project.aspect.select"
                  className="h-8 text-[12px] bg-input border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Vertical</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="4:5">4:5 Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              data-ocid="new_project.cancel_button"
              className="flex-1 py-2 rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 text-[12px] font-medium transition-all"
            >
              Cancel
            </button>
            <motion.button
              type="button"
              onClick={handleCreate}
              data-ocid="new_project.submit_button"
              disabled={!title.trim()}
              className="flex-1 py-2 rounded text-[12px] font-semibold btn-gradient disabled:opacity-40 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Project
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewProjectModal;
