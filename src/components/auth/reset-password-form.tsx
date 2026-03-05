"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { resetPasswordAction } from "@/server/actions/auth-actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(resetPasswordAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
    if (state.success) {
      appToast.success("Password updated! Please sign in.");
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [state, router]);

  if (state.success) {
    return (
      <Card className="w-full max-w-md border border-border/60 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Password updated!</h2>
          <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">Set a new password</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <PasswordInput id="password" name="password" minLength={8} required autoFocus />
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>
          <Button className="w-full h-11 font-semibold" type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
