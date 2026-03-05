import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PublicShell } from "@/components/marketing/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Kanban,
  Users,
  Bell,
  Mail,
  Flag,
  LayoutList,
  GripVertical,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Kanban,
    title: "Visual Kanban Boards",
    desc: "Drag-and-drop boards with fully customisable lists. Move cards between columns as work progresses — updates are instant for every member.",
  },
  {
    icon: LayoutList,
    title: "Workspaces",
    desc: "Create one workspace per team, project, or client. Each workspace has its own members, boards, and role assignments — completely isolated.",
  },
  {
    icon: Users,
    title: "Role-based Access",
    desc: "Assign teammates as Owner, Admin, or Member. Granular permissions ensure the right people can create, edit, or only view content.",
  },
  {
    icon: Mail,
    title: "Email Invitations",
    desc: "Invite anyone by email. Existing users join immediately; new users receive a secure 7-day invitation link to create their account and join.",
  },
  {
    icon: Flag,
    title: "Card Priorities & Due Dates",
    desc: "Mark every card Low, Medium, High, or Urgent. Attach due dates so the team always knows what needs attention first.",
  },
  {
    icon: GripVertical,
    title: "Drag-and-drop Reordering",
    desc: "Reorder cards within a list or move them across lists with smooth drag-and-drop powered by @hello-pangea/dnd.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Live in-app notifications when you are assigned to a card, mentioned, or a deadline is approaching — no page refresh needed.",
  },
  {
    icon: MessageSquare,
    title: "Card Comments & Activity",
    desc: "Every card has a dedicated comment thread and a full activity log so the whole team can trace decisions and history.",
  },
];

export default function ServicesPage() {
  return (
    <PublicShell activePath="/services">
      <main className="mx-auto max-w-5xl px-4 py-14 space-y-12">

        {/* Header */}
        <div className="space-y-4">
          <Badge variant="outline">What we offer</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Platform features</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Everything you need to organise your team&apos;s work — from a single Kanban board
            to a multi-team workspace with roles, invites, and real-time updates.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.title} className="border-border/70 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                  <service.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{service.title}</CardTitle>
                <CardDescription>{service.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Start using these features today</CardTitle>
            <CardDescription>Free forever. No credit card required.</CardDescription>
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
