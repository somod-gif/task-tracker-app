import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Kanban,
  Users,
  Bell,
  Mail,
  Layers,
  Flag,
  GripVertical,
  PlusCircle,
  UserCircle,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { PublicShell } from "@/components/marketing/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/workspace");
  }

  return (
    <PublicShell activePath="/">

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-7">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              <Sparkles className="mr-1 size-3" />
              Visual Kanban for every team
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl">
              Organize your team work with visual boards
            </h1>
            <p className="text-lg text-muted-foreground lg:text-xl">
              Create a <span className="font-semibold text-foreground">workspace</span>, build{" "}
              <span className="font-semibold text-foreground">boards</span>, drag cards from{" "}
              <span className="font-semibold text-foreground">To Do to In Progress to Done</span>.
              Built for individuals and teams of any size.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get started free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Free forever - No credit card required</p>
          </div>

          {/* Kanban preview */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Website Redesign</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  title: "To Do",
                  color: "bg-slate-500",
                  cards: [
                    { label: "Write copy", priority: "MEDIUM", assignee: "JD" },
                    { label: "Wireframes", priority: "HIGH", assignee: "SA" },
                  ],
                },
                {
                  title: "In Progress",
                  color: "bg-blue-500",
                  cards: [
                    { label: "Homepage", priority: "HIGH", assignee: "ML" },
                    { label: "Branding", priority: "LOW", assignee: "EC" },
                  ],
                },
                {
                  title: "Done",
                  color: "bg-emerald-500",
                  cards: [
                    { label: "Research", priority: "LOW", assignee: "JD" },
                    { label: "Sitemap", priority: "MEDIUM", assignee: "SA" },
                  ],
                },
              ].map((list) => (
                <div key={list.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={"h-2 w-2 rounded-full " + list.color} />
                    <span className="text-xs font-semibold">{list.title}</span>
                  </div>
                  {list.cards.map((card) => (
                    <div key={card.label} className="rounded-lg border border-border/70 bg-background p-2 shadow-sm">
                      <p className="text-xs font-medium leading-snug">{card.label}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span
                          className={
                            "rounded px-1 py-0.5 text-[10px] font-medium " +
                            (card.priority === "HIGH"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : card.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400")
                          }
                        >
                          {card.priority}
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                          {card.assignee}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-1 rounded-lg border border-dashed border-border/60 p-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    <PlusCircle className="size-3" /> Add card
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">HOW IT WORKS</Badge>
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              From sign-up to shipping in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              No approval queues, no company hierarchies. Sign up and start organising your work immediately.
            </p>
          </div>
          <div className="relative mt-16">
            <div className="absolute left-0 top-10 hidden h-0.5 w-full bg-border md:block" />
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: UserCircle,
                  title: "Create your account",
                  desc: "Sign up with your email and password. No company registration or admin approval needed - you are in immediately.",
                },
                {
                  step: "02",
                  icon: Layers,
                  title: "Build a Workspace and Board",
                  desc: "Create a workspace as your team home, then add boards. Each board comes with default lists: To Do, In Progress, Done.",
                },
                {
                  step: "03",
                  icon: GripVertical,
                  title: "Add cards and drag to done",
                  desc: "Create cards, assign members, set priorities and due dates, then drag cards across lists as work progresses.",
                },
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <item.icon className="size-8" />
                  </div>
                  <div className="mb-1 text-xs font-bold tracking-widest text-primary">STEP {item.step}</div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">FEATURES</Badge>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Everything you need to stay on track
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A focused set of tools designed around how real teams work.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Kanban,
              title: "Drag-and-drop Kanban",
              desc: "Reorder cards within a list or move them between lists. Your board updates instantly for everyone.",
            },
            {
              icon: Users,
              title: "Workspace roles",
              desc: "Invite teammates as Owner, Admin, or Member. Role-based permissions keep access controlled.",
            },
            {
              icon: Mail,
              title: "Email invitations",
              desc: "Invite collaborators by email. Existing users are added instantly; new users get a secure 7-day invite link.",
            },
            {
              icon: Bell,
              title: "Real-time notifications",
              desc: "Get notified when assigned a card, mentioned in a comment, or a due date is approaching.",
            },
            {
              icon: Flag,
              title: "Priority and due dates",
              desc: "Flag cards as Low, Medium, High, or Urgent. Set due dates to keep commitments visible.",
            },
            {
              icon: CheckCircle2,
              title: "Card detail and activity",
              desc: "Every card has a full detail view: description, comments, activity log, assignees, and cover colours.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-border/70 transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* APPLICATION FLOW */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">APPLICATION FLOW</Badge>
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              How the app is structured
            </h2>
          </div>
          <div className="mt-12 space-y-6">
            {[
              {
                level: "User",
                color: "border-l-blue-500",
                bg: "bg-blue-500",
                description:
                  "You sign up with an email and password. Your account belongs to you, not to a company. You can be a member of multiple workspaces simultaneously.",
              },
              {
                level: "Workspace",
                color: "border-l-indigo-500",
                bg: "bg-indigo-500",
                description:
                  "A workspace is your team home. Create one for your company, a project, or any group. Invite members and assign them roles: Owner, Admin, or Member.",
              },
              {
                level: "Board",
                color: "border-l-violet-500",
                bg: "bg-violet-500",
                description:
                  "Boards live inside a workspace. Each board represents a project or area of work. Set visibility to Private, Workspace, or Public.",
              },
              {
                level: "List",
                color: "border-l-purple-500",
                bg: "bg-purple-500",
                description:
                  "Lists are the columns on your board. New boards start with To Do, In Progress, and Done. Add, rename, or reorder lists to match your workflow.",
              },
              {
                level: "Card",
                color: "border-l-pink-500",
                bg: "bg-pink-500",
                description:
                  "Cards are individual tasks. Add a title, description, due date, priority (Low to Urgent), and assign members. Drag them between lists as work progresses.",
              },
            ].map((item) => (
              <div
                key={item.level}
                className={"flex gap-5 rounded-xl border-l-4 " + item.color + " bg-card/60 p-5 shadow-sm"}
              >
                <div
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
                    item.bg +
                    " text-xs font-bold text-white"
                  }
                >
                  {item.level[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{item.level}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2 text-sm">
            {["User", "to", "Workspace", "to", "Board", "to", "List", "to", "Card"].map((part, i) => (
              <span
                key={i}
                className={
                  part === "to"
                    ? "text-muted-foreground/40"
                    : "rounded-full border border-border px-3 py-1 text-foreground font-medium"
                }
              >
                {part}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/75 p-12 text-primary-foreground shadow-2xl lg:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Ready to bring order to your work?
            </h2>
            <p className="mt-4 text-primary-foreground/90 lg:text-lg">
              Sign up for free and create your first board in under two minutes.
              No credit card, no company approval.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Create your free account
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </PublicShell>
  );
}
