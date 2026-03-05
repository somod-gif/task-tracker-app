"use client";

import { ReactNode, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBoardAction } from "@/server/actions/board-actions";
import { appToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const COVER_COLORS = [
  "#262166", "#1593c6", "#0f766e", "#9333ea", "#dc2626",
  "#d97706", "#16a34a", "#0284c7", "#7c3aed", "#db2777",
];

type Props = {
  workspaceId: string;
  children: ReactNode;
};

export function CreateBoardDialog({ workspaceId, children }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "WORKSPACE">("WORKSPACE");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      const res = await createBoardAction({
        workspaceId,
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        coverColor,
      });
      if (res.success && res.data) {
        appToast.success("Board created!");
        setOpen(false);
        setTitle("");
        setDescription("");
        router.push(`/workspace/${workspaceId}/board/${(res.data as { id: string }).id}`);
      } else {
        appToast.error(res.error ?? "Failed to create board");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Cover preview */}
          <div className="h-16 rounded-lg transition-colors" style={{ backgroundColor: coverColor }} />

          <div className="space-y-1.5">
            <Label htmlFor="board-title">Title *</Label>
            <Input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Roadmap"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="board-desc">Description</Label>
            <Textarea
              id="board-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board for?"
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <div className="flex gap-2">
              {(["WORKSPACE", "PRIVATE"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`flex-1 rounded-md border py-1.5 text-sm transition-colors ${
                    visibility === v
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {v === "WORKSPACE" ? "Workspace" : "Private"}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Cover color</Label>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoverColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                    coverColor === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Creating..." : "Create board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
