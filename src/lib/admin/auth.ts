import { cookies } from "next/headers";

const ADMIN_COOKIE = "sd_admin_session";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export function adminEnabled(): boolean {
  return Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
}

export async function getAdminSession(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export { ADMIN_COOKIE };
