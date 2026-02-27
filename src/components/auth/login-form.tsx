"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await signIn("credentials", {
      identifier: String(formData.get("identifier") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });

    if (result?.error) {
      appToast.error("Invalid credentials.");
      setLoading(false);
      return;
    }

    appToast.success("Signed in successfully.");
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-lg border-border/70 bg-background/90 shadow-md">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex justify-end">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Back to Home
          </Link>
        </div>
        <CardTitle className="text-center text-4xl font-bold tracking-tight">Welcome Back</CardTitle>
        <p className="text-center text-lg text-muted-foreground">Sign in to continue</p>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email Address</Label>
            <Input id="identifier" name="identifier" type="text" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" required />
          </div>
          <Button className="h-12 w-full text-2xl font-bold" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
