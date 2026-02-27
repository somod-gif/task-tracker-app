"use client";

import { useActionState, useEffect } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { changePasswordAction } from "@/server/actions/auth-actions";

const initialState = { success: false, error: "" };

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    appToast.success("Password updated successfully. Please sign in again.");
    void signOut({ callbackUrl: "/login" });
  }, [state.success]);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>For security, update your password before continuing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <PasswordInput id="currentPassword" name="currentPassword" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput id="newPassword" name="newPassword" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput id="confirmPassword" name="confirmPassword" required />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
