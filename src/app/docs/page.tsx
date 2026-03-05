import { PublicShell } from "@/components/marketing/public-shell";
import { DocsClient } from "@/components/docs/docs-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Full feature documentation for Sprint Desk  learn how workspaces, boards, Kanban cards, roles, notifications, and invitations work end to end.",
};

export default function DocsPage() {
  return (
    <PublicShell activePath="/docs">
      <DocsClient />
    </PublicShell>
  );
}
