"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { assignSuperAdminSchema, companyCrudSchema, registerCompanySchema } from "@/lib/validation/platform";
import { createNotification } from "@/server/services/notification-service";

function normalizeEmpty(value: FormDataEntryValue | null) {
  if (value == null) return undefined;
  const next = String(value).trim();
  return next.length ? next : undefined;
}

export async function createCompanyByPlatformOwnerAction(_prevState: unknown, formData: FormData) {
  await requireRole(["PLATFORM_OWNER"]);

  const parsed = companyCrudSchema.safeParse({
    name: formData.get("name"),
    logo: normalizeEmpty(formData.get("logo")),
    address: normalizeEmpty(formData.get("address")),
    website: normalizeEmpty(formData.get("website")),
    contactEmail: normalizeEmpty(formData.get("contactEmail")),
    contactPhone: normalizeEmpty(formData.get("contactPhone")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid company payload" };
  }

  await prisma.company.create({ data: parsed.data });
  revalidatePath("/dashboard");
  return { success: true, error: "" };
}

export async function updateCompanyByPlatformOwnerAction(_prevState: unknown, formData: FormData) {
  await requireRole(["PLATFORM_OWNER"]);

  const parsed = companyCrudSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    logo: normalizeEmpty(formData.get("logo")),
    address: normalizeEmpty(formData.get("address")),
    website: normalizeEmpty(formData.get("website")),
    contactEmail: normalizeEmpty(formData.get("contactEmail")),
    contactPhone: normalizeEmpty(formData.get("contactPhone")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: "Invalid company update payload" };
  }

  const { id, ...data } = parsed.data;
  await prisma.company.update({ where: { id }, data });
  revalidatePath("/dashboard");
  return { success: true, error: "" };
}

export async function toggleCompanyActiveAction(companyId: string) {
  await requireRole(["PLATFORM_OWNER"]);

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, isActive: true } });
  if (!company) throw new Error("Company not found");

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { isActive: !company.isActive },
    select: { id: true, name: true, isActive: true },
  });

  if (updated.isActive) {
    const superAdmins = await prisma.user.findMany({
      where: {
        companyId: updated.id,
        role: "SUPER_ADMIN",
      },
      select: { id: true },
    });

    await Promise.all(
      superAdmins.map((admin) =>
        createNotification({
          userId: admin.id,
          companyId: updated.id,
          title: "Company Approved",
          message: `${updated.name} is now approved and active on Sprint Desk.`,
          type: "COMPANY_APPROVED",
        }),
      ),
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pending-approvals");
}

export async function deleteCompanyAction(companyId: string) {
  await requireRole(["PLATFORM_OWNER"]);
  await prisma.company.delete({ where: { id: companyId } });
  revalidatePath("/dashboard");
}

export async function approveCompanyAction(companyId: string) {
  await requireRole(["PLATFORM_OWNER"]);

  const company = await prisma.company.update({
    where: { id: companyId },
    data: { isActive: true },
    select: { id: true, name: true },
  });

  // Notify all Super Admins in this company
  const superAdmins = await prisma.user.findMany({
    where: { companyId: company.id, role: "SUPER_ADMIN" },
    select: { id: true },
  });

  await Promise.all(
    superAdmins.map((admin) =>
      createNotification({
        userId: admin.id,
        companyId: company.id,
        title: "Company Approved",
        message: `${company.name} has been approved and is now active on Sprint Desk. You can now sign in and set up your workspace.`,
        type: "COMPANY_APPROVED",
      }),
    ),
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pending-approvals");
}

export async function rejectCompanyAction(companyId: string) {
  await requireRole(["PLATFORM_OWNER"]);
  // Deletes company and cascades to users
  await prisma.company.delete({ where: { id: companyId } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pending-approvals");
}

export async function assignUserAsSuperAdminAction(companyId: string, userId: string) {
  await requireRole(["PLATFORM_OWNER"]);
  const parsed = assignSuperAdminSchema.safeParse({ userId });
  if (!parsed.success) {
    throw new Error("Invalid user id");
  }

  await prisma.user.updateMany({
    where: { id: parsed.data.userId, companyId },
    data: { role: "SUPER_ADMIN" },
  });

  revalidatePath("/dashboard");
}

export async function registerCompanyRequestAction(_prevState: unknown, formData: FormData) {
  const parsed = registerCompanySchema.safeParse({
    companyName: formData.get("companyName"),
    companyEmail: formData.get("companyEmail"),
    companyPhone: formData.get("companyPhone"),
    companyAddress: formData.get("companyAddress"),
    ceoName: formData.get("ceoName"),
    ceoEmail: formData.get("ceoEmail"),
    website: normalizeEmpty(formData.get("website")) ?? "",
    note: normalizeEmpty(formData.get("note")) ?? "",
  });

  if (!parsed.success) {
    return { success: false, error: "Please provide valid company and CEO details." };
  }

  const existingCompany = await prisma.company.findFirst({
    where: {
      OR: [
        { name: parsed.data.companyName },
        { contactEmail: parsed.data.companyEmail },
      ],
    },
    select: { id: true },
  });

  if (existingCompany) {
    return { success: false, error: "A company with this name or contact email already exists." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.ceoEmail.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    return { success: false, error: "A user with this CEO email already exists." };
  }

  const temporaryPassword = process.env.NEW_COMPANY_TEMP_PASSWORD ?? "ChangeMe@123";
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const company = await prisma.company.create({
    data: {
      name: parsed.data.companyName,
      address: parsed.data.companyAddress,
      website: parsed.data.website || null,
      contactEmail: parsed.data.companyEmail,
      contactPhone: parsed.data.companyPhone,
      isActive: false,
    },
    select: { id: true },
  });

  await prisma.user.create({
    data: {
      name: parsed.data.ceoName,
      email: parsed.data.ceoEmail.toLowerCase(),
      role: "SUPER_ADMIN",
      companyId: company.id,
      passwordHash,
      mustChangePassword: true,
      passwordUpdatedAt: null,
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    error: "",
    message: "Registration submitted. A platform owner must approve your company before login is enabled.",
  };
}
