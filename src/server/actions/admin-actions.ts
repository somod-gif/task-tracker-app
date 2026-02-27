"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

import { requireCompanyId } from "@/lib/auth/session";
import { requireRole } from "@/lib/rbac";
import {
  createCompanySchema,
  createDepartmentSchema,
  createEmployeeSchema,
  createSuperAdminUserSchema,
  promoteToTeamLeadSchema,
} from "@/lib/validation/admin";
import { prisma } from "@/lib/prisma";

export async function createCompanyAction(_prevState: unknown, formData: FormData) {
  await requireRole(["PLATFORM_OWNER"]);

  const parsed = createCompanySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid company name" };
  }

  await prisma.company.create({
    data: {
      name: parsed.data.name,
    },
  });

  revalidatePath("/dashboard/super-admin");
  return { success: true, error: "" };
}

export async function createDepartmentAction(_prevState: unknown, formData: FormData) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const companyId = requireCompanyId(admin);

  const parsed = createDepartmentSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid department name" };
  }

  await prisma.department.create({
    data: {
      name: parsed.data.name,
      companyId,
    },
  });

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function createEmployeeAction(_prevState: unknown, formData: FormData) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const companyId = requireCompanyId(admin);

  const parsed = createEmployeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    departmentId: formData.get("departmentId"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid employee form data" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      mustChangePassword: true,
      passwordUpdatedAt: null,
      role: "EMPLOYEE",
      companyId,
      departmentId: parsed.data.departmentId,
    },
  });

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function createSuperAdminManagedUserAction(_prevState: unknown, formData: FormData) {
  await requireRole(["SUPER_ADMIN"]);

  const parsed = createSuperAdminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    companyId: formData.get("companyId"),
    departmentId: formData.get("departmentId") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") || "Invalid user form data" };
  }

  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    select: { id: true },
  });

  if (!company) {
    return { success: false, error: "Company not found" };
  }

  if (parsed.data.departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: parsed.data.departmentId,
        companyId: parsed.data.companyId,
      },
      select: { id: true },
    });

    if (!department) {
      return { success: false, error: "Department does not belong to selected company" };
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        mustChangePassword: true,
        passwordUpdatedAt: null,
        role: parsed.data.role,
        companyId: parsed.data.companyId,
        departmentId: parsed.data.role === "ADMIN" ? null : (parsed.data.departmentId ?? null),
      },
    });
  } catch {
    return { success: false, error: "Could not create user. Email may already exist." };
  }

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard");
  return { success: true, error: "" };
}

export async function promoteToDepartmentLeadAction(userId: string) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const companyId = requireCompanyId(admin);

  const parsed = promoteToTeamLeadSchema.safeParse({ userId });
  if (!parsed.success) {
    throw new Error("Invalid user id");
  }

  await prisma.user.updateMany({
    where: {
      id: parsed.data.userId,
      companyId,
    },
    data: {
      role: "DEPARTMENT_LEAD",
    },
  });

  revalidatePath("/dashboard/admin");
}
