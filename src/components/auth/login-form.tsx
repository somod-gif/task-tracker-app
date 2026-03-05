"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";

export function LoginForm() {
  const router = useRouter();

  async function handleLogin(_prevState: unknown, formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      return { success: false, error: "Invalid email or password" };
    }

    return { success: true, error: "" };
  }

  const [state, formAction, pending] = useActionState(handleLogin, { success: false, error: "" });

  useEffect(() => {
    if (state.success) {
      appToast.success("Signed in successfully!");
      router.push("/workspace");
      router.refresh();
    } else if (state.error) {
      appToast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md border border-border/60 bg-card shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-3xl font-bold tracking-tight">Welcome back</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Sign in to your Sprint Desk account</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" required />
          </div>
          <Button className="h-11 w-full font-semibold text-base" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

