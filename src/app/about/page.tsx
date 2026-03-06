import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicShell } from "@/components/marketing/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Kanban, Users, Zap, Shield } from "lucide-react";
import { ReadingProgress } from "@/components/marketing/reading-progress";

export default function AboutPage() {
  return (
    <PublicShell activePath="/about">
      <ReadingProgress />
      <main className="mx-auto max-w-5xl px-4 py-14 space-y-14">

        {/* Header */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Badge variant="outline">About us</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Built for teams who want clarity</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Sprint Desk is a visual project management platform — Kanban boards, workspaces, and
            real-time collaboration, designed to be simple for individuals and powerful for teams.
          </p>
        </div>

        {/* Mission / Vision / Approach / Why */}
        <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Card>
            <CardHeader>
              <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                <Zap className="size-5 text-primary" />
              </div>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Help every team — from solo freelancers to large orgs — organise their work visually
              and ship with confidence, without bureaucratic overhead.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                <Kanban className="size-5 text-primary" />
              </div>
              <CardTitle>Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Become the go-to Kanban workspace for teams who value simplicity, speed,
              and transparency over complex enterprise tooling.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                <Users className="size-5 text-primary" />
              </div>
              <CardTitle>Our Approach</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A flat, intuitive hierarchy: Workspace → Board → List → Card. No rigid company
              structures. Anyone can sign up, create a workspace, and invite their team in minutes.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                <Shield className="size-5 text-primary" />
              </div>
              <CardTitle>Why Sprint Desk</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Role-based access, email invitations, real-time notifications, and drag-and-drop
              Kanban — all in a clean, fast interface that gets out of your way.
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <CardHeader>
            <CardTitle>Ready to get started?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">
                Create a free account
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>

      </main>
    </PublicShell>
  );
}
