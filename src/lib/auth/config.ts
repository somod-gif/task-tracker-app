import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/domain";

const signInSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

const bootstrapPlatformOwnerEmail = (process.env.BOOTSTRAP_PLATFORM_OWNER_EMAIL ?? "platform@sprintdesk.local").toLowerCase();
const bootstrapPlatformOwnerUsername = (process.env.BOOTSTRAP_PLATFORM_OWNER_USERNAME ?? "platform_owner").toLowerCase();
const bootstrapPlatformOwnerPassword = process.env.BOOTSTRAP_PLATFORM_OWNER_PASSWORD ?? "password";

function resolveLoginIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  const lookupEmail = normalized.includes("@") ? normalized : bootstrapPlatformOwnerEmail;

  return { normalized, lookupEmail };
}

async function getOrBootstrapUser(lookupEmail: string, identifier: string, password: string) {
  const existing = await prisma.user.findUnique({
    where: { email: lookupEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      departmentId: true,
      passwordHash: true,
      mustChangePassword: true,
      company: { select: { id: true, name: true, isActive: true } },
      department: { select: { id: true, name: true } },
    },
  });

  if (existing) {
    return existing;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const canBootstrapByEmail = identifier.includes("@") && identifier === bootstrapPlatformOwnerEmail;
  const canBootstrapByUsername = !identifier.includes("@") && identifier === bootstrapPlatformOwnerUsername;

  if ((!canBootstrapByEmail && !canBootstrapByUsername) || password !== bootstrapPlatformOwnerPassword) {
    return null;
  }

  const passwordHash = await bcrypt.hash(bootstrapPlatformOwnerPassword, 10);
  await prisma.user.create({
    data: {
      name: "Sprint Desk Platform Owner",
      email: lookupEmail,
      passwordHash,
      role: "PLATFORM_OWNER",
      companyId: null,
      departmentId: null,
      mustChangePassword: false,
      passwordUpdatedAt: null,
    } as never,
  } as never);

  return prisma.user.findUnique({
    where: { email: lookupEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      departmentId: true,
      passwordHash: true,
      mustChangePassword: true,
      company: { select: { id: true, name: true, isActive: true } },
      department: { select: { id: true, name: true } },
    },
  });
}

async function hasColumn(tableName: string, columnName: string) {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = ${tableName}
        AND column_name = ${columnName}
    ) as "exists"
  `;

  return Boolean(rows[0]?.exists);
}

async function isUserAllowedToLogin(userId: string) {
  const hasUserStatus = await hasColumn("User", "isActive");
  if (!hasUserStatus) {
    return true;
  }

  const rows = await prisma.$queryRaw<Array<{ isActive: boolean | null }>>`
    SELECT "isActive"
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0]?.isActive !== false;
}

async function isCompanyAllowedToLogin(companyId: string | null | undefined, fallbackIsActive: boolean) {
  if (!companyId) {
    return true;
  }

  const hasCompanyStatus = await hasColumn("Company", "status");
  if (hasCompanyStatus) {
    const rows = await prisma.$queryRaw<Array<{ status: string | null }>>`
      SELECT "status"
      FROM "Company"
      WHERE id = ${companyId}
      LIMIT 1
    `;

    return rows[0]?.status === "ACTIVE";
  }

  return fallbackIsActive;
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: Record<string, unknown> | undefined) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { normalized, lookupEmail } = resolveLoginIdentifier(parsed.data.identifier);

        const user = await getOrBootstrapUser(lookupEmail, normalized, parsed.data.password);

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        const [isUserActive, isCompanyActive] = await Promise.all([
          isUserAllowedToLogin(user.id),
          isCompanyAllowedToLogin(user.companyId, user.company?.isActive ?? true),
        ]);

        if (!isUserActive) {
          return null;
        }

        const rawRole = String(user.role);
        const normalizedRole = rawRole === "TEAM_LEAD" ? "DEPARTMENT_LEAD" : rawRole;
        const allowedRoles: Role[] = ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"];
        if (!allowedRoles.includes(normalizedRole as Role)) {
          return null;
        }
        const resolvedRole = normalizedRole as Role;

        if (resolvedRole !== "PLATFORM_OWNER" && (!user.company || !isCompanyActive)) {
          return null;
        }

        const mustChangePassword =
          typeof user === "object" && user && "mustChangePassword" in user
            ? Boolean((user as { mustChangePassword?: boolean }).mustChangePassword)
            : false;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolvedRole as Role,
          companyId: user.companyId,
          departmentId: user.departmentId,
          companyName: user.company?.name ?? null,
          departmentName: user.department?.name ?? null,
          mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
        token.departmentId = user.departmentId ?? null;
        token.companyName = user.companyName;
        token.departmentName = user.departmentName;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.companyId = token.companyId;
        session.user.departmentId = token.departmentId;
        session.user.companyName = token.companyName;
        session.user.departmentName = token.departmentName;
        session.user.mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
};
