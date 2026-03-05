import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/marketing/public-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/workspace");
  }

  return (
    <PublicShell activePath="/login">
      <main className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl lg:grid-cols-2">
        <section className="hidden rounded-2xl bg-gradient-to-br from-[#1a1560] via-[#262166] to-[#1593c6] text-white lg:flex lg:items-center lg:justify-center lg:m-6">
          <div className="max-w-md px-10 text-center">
            <h1 className="text-5xl font-bold tracking-tight">Sprint Desk</h1>
            <p className="mt-4 text-xl font-medium text-white/80">
              Your collaborative workspace for shipping great work
            </p>
            <div className="mt-8 space-y-3 text-left text-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-[#1593c6]">✓</span> Kanban boards with drag &amp; drop
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1593c6]">✓</span> Invite your team instantly
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1593c6]">✓</span> Real-time collaboration
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1593c6]">✓</span> Multiple workspaces
              </div>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to home
            </Link>
            <LoginForm />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

