"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getAdminSession } from "@/lib/admin/auth";
import {
  assertCanCreateDocumentation,
  canCreateDocumentation,
  resolveDocumentationRole,
} from "@/lib/rbac/documentation";

export async function getDocumentationPermissionAction() {
  const user = await getCurrentUser();
  const isAdminSession = await getAdminSession();
  const role = resolveDocumentationRole({ email: user?.email, isAdminSession });

  return {
    role,
    canCreate: canCreateDocumentation(role),
  };
}

export async function createDocumentationAction(input: { title: string; content: string }) {
  const user = await getCurrentUser();
  const isAdminSession = await getAdminSession();
  const role = resolveDocumentationRole({ email: user?.email, isAdminSession });

  assertCanCreateDocumentation(role);

  return {
    success: true,
    role,
    document: {
      title: input.title,
      content: input.content,
      createdAt: new Date().toISOString(),
    },
  };
}
