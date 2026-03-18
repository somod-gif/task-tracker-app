"use client";

import { ReactNode, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceAction } from "@/server/actions/workspace-actions";
import { appToast } from "@/lib/toast";

type Props = {
  children: ReactNode;
  onCreated?: (id: string) => void;
};

export function CreateWorkspaceDialog({ children, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createWorkspaceAction({ name: name.trim(), description: description.trim() || undefined });
      if (res.success && res.data) {
        appToast.success("Workspace created!");
        onCreated?.((res.data as { id: string }).id);
        setOpen(false);
        setName("");
        setDescription("");
      } else {
        appToast.error(res.error ?? "Failed to create workspace");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Workspaces organize your teams and projects. After creating one, you can invite members and create boards.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Name *</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-desc">Description</Label>
            <Textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Product roadmap and sprint delivery"
              className="resize-none"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
