"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { adminLoginAction } from "@/server/actions/admin-auth-actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(adminLoginAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
    if (state.success) { router.push("/admin"); router.refresh(); }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-slate-300">Admin email</Label>
        <Input
          id="email" name="email" type="email" required autoFocus
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          placeholder="admin@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-slate-300">Password</Label>
        <PasswordInput
          id="password" name="password" required
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in to Admin"}
      </button>
    </form>
  );
}
