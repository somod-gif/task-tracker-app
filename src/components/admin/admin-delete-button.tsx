"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminDeleteUser, adminDeleteWorkspace } from "@/server/actions/admin-data-actions";
import { appToast } from "@/lib/toast";

export function AdminDeleteButton({
  type, id, label,
}: {
  type: "user" | "workspace"; id: string; label: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handle() {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    start(async () => {
      const res = type === "user"
        ? await adminDeleteUser(id)
        : await adminDeleteWorkspace(id);
      if (res.success) {
        appToast.success(`"${label}" deleted`);
        router.refresh();
      } else {
        appToast.error("Failed to delete");
      }
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-40"
    >
      <Trash2 className="size-3" />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
