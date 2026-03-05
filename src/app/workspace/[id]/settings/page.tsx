import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

type Props = { params: Promise<{ id: string }> };

export default async function SettingsPage({ params }: Props) {
  const { id: workspaceId } = await params;
  const session = await requireAuth();

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.id, workspaceId } },
    include: { workspace: true },
  });

  if (!membership) redirect("/workspace");

  const isOwner = membership.role === "OWNER";
  // Only OWNER and ADMIN can access settings
  if (!isOwner && membership.role !== "ADMIN") redirect(`/workspace/${workspaceId}`);

  return (
    <SettingsClient
      workspaceId={workspaceId}
      name={membership.workspace.name}
      description={membership.workspace.description}
      isOwner={isOwner}
    />
  );
}
