import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckCheck, MessageSquare, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { type CommentMock, MOCK_COMMENTS } from "../data/mockData";

interface CollabPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CollabPanel({ open, onClose }: CollabPanelProps) {
  const [comments, setComments] = useState<CommentMock[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: CommentMock = {
      id: `c${Date.now()}`,
      author: "You",
      avatar: "💬",
      time: "Just now",
      text: newComment.trim(),
      resolved: false,
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-80 p-0 border-border"
        style={{
          background: "oklch(0.12 0.022 233 / 0.98)",
          backdropFilter: "blur(20px)",
        }}
        data-ocid="collab.panel"
      >
        <SheetHeader
          className="px-4 py-3 flex-row items-center gap-2"
          style={{ borderBottom: "1px solid oklch(0.26 0.028 228 / 0.45)" }}
        >
          <MessageSquare className="w-4 h-4 text-teal flex-shrink-0" />
          <SheetTitle className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            Comments
            {unresolvedCount > 0 && (
              <span className="text-[10px] bg-teal/20 text-teal px-1.5 py-0.5 rounded-full font-bold">
                {unresolvedCount}
              </span>
            )}
          </SheetTitle>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              className={`rounded-lg border p-3 ${
                comment.resolved
                  ? "border-border/40 bg-white/2 opacity-60"
                  : "border-border bg-white/4"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`collab.comment.${i + 1}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0">
                  {comment.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12px] font-semibold text-foreground">
                      {comment.author}
                    </span>
                    {comment.resolved && (
                      <CheckCheck className="w-3 h-3 text-teal flex-shrink-0" />
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {comment.time}
                    </span>
                  </div>
                  <p
                    className={`text-[12px] leading-relaxed ${
                      comment.resolved
                        ? "line-through text-muted-foreground/60"
                        : "text-foreground/80"
                    }`}
                  >
                    {comment.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add comment */}
        <div
          className="p-3"
          style={{ borderTop: "1px solid oklch(0.26 0.028 228 / 0.45)" }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment…"
              className="flex-1 bg-input border border-border rounded-lg py-2 px-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/40 transition-colors"
              data-ocid="collab.new_comment.input"
            />
            <motion.button
              type="button"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              data-ocid="collab.post_comment.button"
              className="p-2 rounded-lg btn-gradient disabled:opacity-40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CollabPanel;
