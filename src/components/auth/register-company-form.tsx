"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/lib/toast";
import { registerCompanyRequestAction } from "@/server/actions/platform-owner-actions";

const initialState = { success: false, error: "", message: "" };

export function RegisterCompanyForm() {
  const [state, formAction, isPending] = useActionState(registerCompanyRequestAction, initialState);

  useEffect(() => {
    if (state.success && state.message) {
      appToast.success(state.message);
    }
  }, [state.success, state.message]);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Company Registration Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input id="companyEmail" name="companyEmail" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone">Company Phone</Label>
            <Input id="companyPhone" name="companyPhone" required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Input id="companyAddress" name="companyAddress" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ceoName">CEO Name</Label>
            <Input id="ceoName" name="ceoName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ceoEmail">CEO Email</Label>
            <Input id="ceoEmail" name="ceoEmail" type="email" required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input id="website" name="website" type="url" placeholder="https://example.com" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" name="note" placeholder="Any onboarding notes for platform owner review." />
          </div>

          {state.error ? <p className="text-sm text-destructive md:col-span-2">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-primary md:col-span-2">Request submitted successfully. Await platform owner approval.</p>
          ) : null}

          <Button type="submit" disabled={isPending} className="md:col-span-2 md:w-fit">
            {isPending ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
