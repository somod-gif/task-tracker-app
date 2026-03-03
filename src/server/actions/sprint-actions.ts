"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/rbac";
import { createSprintSchema, deleteSprintSchema, updateSprintSchema } from "@/lib/validation/sprint";
import { createSprint, softDeleteSprint, updateSprint } from "@/server/services/sprint-service";

function normalizeDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw.length ? raw : undefined;
}

export async function createSprintAction(_prevState: unknown, formData: FormData) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = createSprintSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    departmentId: formData.get("departmentId") || undefined,
    startDate: normalizeDate(formData.get("startDate")),
    endDate: normalizeDate(formData.get("endDate")),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid sprint payload" };
  }

  await createSprint(user, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/super-admin");
  return { success: true, error: "" };
}

export async function updateSprintAction(_prevState: unknown, formData: FormData) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = updateSprintSchema.safeParse({
    sprintId: formData.get("sprintId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    departmentId: formData.get("departmentId") || undefined,
    startDate: normalizeDate(formData.get("startDate")),
    endDate: normalizeDate(formData.get("endDate")),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid sprint update payload" };
  }

  await updateSprint(user, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/super-admin");
  return { success: true, error: "" };
}

export async function deleteSprintAction(_prevState: unknown, formData: FormData) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = deleteSprintSchema.safeParse({ sprintId: formData.get("sprintId") });
  if (!parsed.success) {
    return { success: false, error: "Invalid sprint deletion payload" };
  }

  await softDeleteSprint(user, parsed.data.sprintId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/super-admin");
  return { success: true, error: "" };
}
