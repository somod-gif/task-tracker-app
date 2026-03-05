"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { registerAction } from "@/server/actions/auth-actions";

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
    if (state.success) {
      appToast.success("Account created! Signing you in…");
      router.push("/login");
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-3xl font-bold tracking-tight">Create your account</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Free forever. No credit card required.</p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Sarah Johnson" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" minLength={8} required />
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>
          <Button className="h-11 w-full font-semibold text-base" type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create free account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
