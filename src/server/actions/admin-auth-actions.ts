"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAdminCredentials, ADMIN_COOKIE } from "@/lib/admin/auth";

export async function adminLoginAction(_prev: unknown, formData: FormData) {
  const email    = String(formData.get("email")    ?? "");
  const password = String(formData.get("password") ?? "");

  const ok = await verifyAdminCredentials(email, password);
  if (!ok) return { success: false, error: "Invalid admin credentials" };

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return { success: true, error: "" };
}

export async function adminLogoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
