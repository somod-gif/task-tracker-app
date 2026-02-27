import type { ReactNode } from "react";

import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicNavbar } from "@/components/marketing/public-navbar";

export function PublicShell({ activePath, children }: { activePath: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar activePath={activePath} />
      {children}
      <PublicFooter />
    </div>
  );
}
