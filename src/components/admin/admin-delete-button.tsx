"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminDeleteUser, adminDeleteWorkspace } from "@/server/actions/admin-data-actions";
import { appToast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminDeleteButton({
  type, id, label,
}: {
  type: "user" | "workspace"; id: string; label: string;
}) {
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  function handleConfirmDelete() {
    start(async () => {
      const res = type === "user"
        ? await adminDeleteUser(id)
        : await adminDeleteWorkspace(id);
      if (res.success) {
        setConfirmOpen(false);
        appToast.success(`"${label}" deleted`);
        router.refresh();
      } else {
        appToast.error("Failed to delete");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-900/30 disabled:opacity-40"
      >
        <Trash2 className="size-3" />
        {pending ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${label}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
