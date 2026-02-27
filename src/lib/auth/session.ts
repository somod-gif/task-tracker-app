import { auth } from "@/auth";
import type { Role } from "@/types/domain";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  companyId?: string | null;
  departmentId?: string | null;
  companyName?: string | null;
  departmentName?: string | null;
  mustChangePassword?: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    companyId: session.user.companyId,
    departmentId: session.user.departmentId,
    companyName: session.user.companyName,
    departmentName: session.user.departmentName,
    mustChangePassword: session.user.mustChangePassword,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireCompanyId(user: SessionUser): string {
  if (!user.companyId) {
    throw new Error("Company-scoped operation requires a company context");
  }

  return user.companyId;
}
