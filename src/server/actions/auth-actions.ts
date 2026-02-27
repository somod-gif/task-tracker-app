"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8).max(64),
    confirmPassword: z.string().min(8).max(64),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation must match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(_prevState: unknown, formData: FormData) {
  const user = await requireAuth();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] ?? "Invalid password values" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!existingUser) {
    return { success: false, error: "User not found" };
  }

  const isCurrentValid = await bcrypt.compare(parsed.data.currentPassword, existingUser.passwordHash);
  if (!isCurrentValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const nextHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: nextHash,
      mustChangePassword: false,
      passwordUpdatedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");

  return { success: true, error: "" };
}
