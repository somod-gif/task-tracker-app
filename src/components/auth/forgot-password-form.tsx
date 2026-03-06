"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toast";
import { forgotPasswordAction } from "@/server/actions/auth-actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, { success: false, error: "", email: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
  }, [state]);

  if (state.success) {
    return (
      <Card className="w-full max-w-md border border-border/60 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If that email address is registered, a password reset link has been sent to <span className="font-medium text-foreground">{state.email}</span>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The link expires in 1 hour.
          </p>
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">Forgot your password?</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Enter your email and we will send you a reset link.
        </p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
          </div>
          <Button className="w-full h-11 font-semibold" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
