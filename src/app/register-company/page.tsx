import { RegisterCompanyForm } from "../../components/auth/register-company-form";
import { PublicShell } from "@/components/marketing/public-shell";

export default function RegisterCompanyPage() {
  return (
    <PublicShell activePath="/register-company">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Company Onboarding</p>
          <h1 className="text-3xl font-bold tracking-tight">Register Your Company</h1>
          <p className="text-sm text-muted-foreground">
            Submit your company and CEO details. Your organization stays pending until platform owner approval.
          </p>
        </div>
        <RegisterCompanyForm />
      </main>
    </PublicShell>
  );
}
