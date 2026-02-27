import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicShell } from "@/components/marketing/public-shell";

export default function AboutPage() {
  return (
    <PublicShell activePath="/about">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">About Sprint Desk</h1>
        <Card>
          <CardHeader>
            <CardTitle>Enterprise-first by Design</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sprint Desk is built to support multi-tenant enterprises that require structured authority layers, operational transparency, and secure role boundaries.
          </CardContent>
        </Card>
      </main>
    </PublicShell>
  );
}
