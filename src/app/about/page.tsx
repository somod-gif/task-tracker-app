import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicShell } from "@/components/marketing/public-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <PublicShell activePath="/about">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">About Sprint Desk</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Mission</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Help enterprise teams ship faster with clear governance and sprint discipline.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Vision</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Be the default multi-tenant execution system for modern organizations.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Our Approach</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Role-based responsibility, measurable delivery, and real-time transparency.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Why Choose Sprint Desk</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Enterprise-grade workflows, secure boundaries, and scalable team architecture.</CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Ready to onboard your company?</CardTitle></CardHeader>
          <CardContent>
            <Button asChild><Link href="/register-company">Register Company</Link></Button>
          </CardContent>
        </Card>
      </main>
    </PublicShell>
  );
}
