"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkspaceAction, deleteWorkspaceAction } from "@/server/actions/workspace-actions";
import { appToast } from "@/lib/toast";

type Props = {
  workspaceId: string;
  name: string;
  description: string | null;
  isOwner: boolean;
};

export function SettingsClient({ workspaceId, name: initName, description: initDesc, isOwner }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initName);
  const [description, setDescription] = useState(initDesc ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateWorkspaceAction({ workspaceId, name: name.trim(), description: description.trim() });
      if (res.success) appToast.success("Workspace updated");
      else appToast.error((res as { error?: string }).error ?? "Failed");
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${name}"? This will permanently delete all boards, lists, and cards. This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteWorkspaceAction(workspaceId);
      if (res.success) {
        appToast.success("Workspace deleted");
        router.push("/workspace");
      } else {
        appToast.error((res as { error?: string }).error ?? "Failed");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace details and preferences.</p>
      </div>

      {/* General */}
      <section className="rounded-xl border p-6 space-y-4">
        <h2 className="text-base font-semibold">General</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Name</Label>
            <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-desc">Description</Label>
            <Textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isPending || !name.trim()}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      {isOwner && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
          <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Deleting this workspace will permanently remove all boards, lists, cards, and members. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            Delete workspace
          </Button>
        </section>
      )}
    </div>
  );
}
