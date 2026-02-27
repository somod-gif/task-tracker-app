"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/rbac";
import { createSprintSchema } from "@/lib/validation/sprint";
import { createSprint } from "@/server/services/sprint-service";

export async function createSprintAction(_prevState: unknown, formData: FormData) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = createSprintSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    departmentId: formData.get("departmentId") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
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
