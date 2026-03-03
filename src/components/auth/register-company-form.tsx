"use client";

import { Building2, CheckCircle2, Clock, KeyRound, ShieldCheck } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerCompanyRequestAction } from "@/server/actions/platform-owner-actions";

const initialState = { success: false, error: "", message: "" };

const STEPS = [
  {
    icon: Building2,
    title: "Submit Your Details",
    body: "Fill in your company info and CEO credentials. No payment or login required.",
  },
  {
    icon: Clock,
    title: "Await Platform Review",
    body: "Our team reviews every submission — usually within 1 business day.",
  },
  {
    icon: KeyRound,
    title: "Receive Temporary Password",
    body: "On approval, the CEO account is activated with a temporary password you must change on first login.",
  },
  {
    icon: ShieldCheck,
    title: "Start Building",
    body: "Log in, invite admins, create departments, assign sprints, and track tasks.",
  },
];

export function RegisterCompanyForm() {
  const [state, formAction, isPending] = useActionState(registerCompanyRequestAction, initialState);

  if (state.success) {
    return (
      <Card className="border-green-500/30 bg-green-50/40 shadow-sm dark:bg-green-950/20">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Registration Submitted!</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your request is being reviewed by the Sprint Desk team. Once approved, the CEO will receive in-app notification and can log in with their temporary password.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-lg border border-amber-400/40 bg-amber-50/60 p-3 text-left dark:bg-amber-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Important</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your temporary password is <span className="font-mono font-bold text-foreground">ChangeMe@123</span> — you will be required to change it on first login.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-border/60 bg-card/70 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug">{s.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Company Registration Request</CardTitle>
          <CardDescription>
            All fields marked with <span className="text-destructive">*</span> are required. Company details and CEO credentials are reviewed before access is granted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 md:grid-cols-2">
            {/* Company section */}
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company Information</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
              <Input id="companyName" name="companyName" placeholder="Acme Corp" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyEmail">Company Email <span className="text-destructive">*</span></Label>
              <Input id="companyEmail" name="companyEmail" type="email" placeholder="contact@acme.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone">Company Phone <span className="text-destructive">*</span></Label>
              <Input id="companyPhone" name="companyPhone" placeholder="+1 555 000 0000" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyAddress">Registered Address <span className="text-destructive">*</span></Label>
              <Input id="companyAddress" name="companyAddress" placeholder="123 Business Ave, City, Country" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Website <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
              <Input id="website" name="website" type="url" placeholder="https://acme.com" />
            </div>

            {/* CEO section */}
            <div className="space-y-1 md:col-span-2 mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Super Admin (CEO) Account</p>
              <p className="text-xs text-muted-foreground">This person becomes the primary workspace owner and receives the temporary password on approval.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceoName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="ceoName" name="ceoName" placeholder="Jane Smith" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceoEmail">Work Email <span className="text-destructive">*</span></Label>
              <Input id="ceoEmail" name="ceoEmail" type="email" placeholder="jane@acme.com" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Message to Platform Team <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
              <Textarea id="note" name="note" placeholder="Anything you'd like the review team to know about your organisation." rows={3} />
            </div>

            {state.error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">{state.error}</p>
            ) : null}

            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center">
              <Button type="submit" disabled={isPending} className="md:w-fit">
                {isPending ? "Submitting Request…" : "Submit Registration Request"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Already registered?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
