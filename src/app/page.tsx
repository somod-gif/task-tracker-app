import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { PublicShell } from "@/components/marketing/public-shell";
import { HomePageClient } from "@/components/marketing/homepage-client";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/workspace");
  }

  return (
    <PublicShell activePath="/">
      <HomePageClient />
    </PublicShell>
  );
}
