import { PublicShell } from "@/components/marketing/public-shell";
import { DocsClient } from "@/components/docs/docs-client";
import type { Metadata } from "next";
import { getDocumentationPermissionAction } from "@/server/actions/documentation-actions";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Full feature documentation for Sprint Desk  learn how workspaces, boards, Kanban cards, roles, notifications, and invitations work end to end.",
};

export default async function DocsPage() {
  const permission = await getDocumentationPermissionAction();

  return (
    <PublicShell activePath="/docs">
      <DocsClient canCreateDocs={permission.canCreate} docsRole={permission.role} />
    </PublicShell>
  );
}
