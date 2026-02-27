"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/rbac";
import { createTaskSchema, deleteTaskSchema, updateTaskStatusSchema } from "@/lib/validation/task";
import { createTask, softDeleteTask, updateTaskStatus } from "@/server/services/task-service";

export async function createTaskAction(_prevState: unknown, formData: FormData) {
  const user = await requireRole(["DEPARTMENT_LEAD"]);

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    description: formData.get("description"),
    richContent: formData.get("richContent") || undefined,
    deadline: formData.get("deadline"),
    priority: formData.get("priority"),
    workType: formData.get("workType"),
    sprintName: formData.get("sprintName") || undefined,
    labels: formData
      .getAll("labels")
      .map((value) => String(value).trim())
      .filter(Boolean),
    referenceLinks: formData
      .getAll("referenceLinks")
      .map((value) => String(value).trim())
      .filter(Boolean),
    assignedToIds: formData.getAll("assignedToIds").map((value) => String(value)),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") || "Invalid form values" };
  }

  await createTask(user, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/department-lead");
  revalidatePath("/dashboard/team-lead");
  return { success: true };
}

export async function updateTaskStatusAction(input: { taskId: string; status: string; comment?: string }) {
  const user = await requireRole(["EMPLOYEE", "DEPARTMENT_LEAD", "ADMIN", "SUPER_ADMIN"]);

  const parsed = updateTaskStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid task status payload");
  }

  await updateTaskStatus(user, parsed.data);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/employee");
  revalidatePath("/dashboard/department-lead");
  revalidatePath("/dashboard/team-lead");
  revalidatePath("/dashboard/admin");
}

export async function softDeleteTaskAction(taskId: string) {
  const user = await requireRole(["DEPARTMENT_LEAD", "ADMIN", "SUPER_ADMIN"]);

  const parsed = deleteTaskSchema.safeParse({ taskId });
  if (!parsed.success) {
    throw new Error("Invalid task deletion request");
  }

  await softDeleteTask(user, taskId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/department-lead");
  revalidatePath("/dashboard/team-lead");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/super-admin");
}
