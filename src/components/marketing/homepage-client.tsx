"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Flag,
  Kanban,
  Layers,
  Shield,
  Sparkles,
  Users,
  CalendarClock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const companies = [
  { name: "Notion", logo: "https://logo.clearbit.com/notion.so" },
  { name: "Linear", logo: "https://logo.clearbit.com/linear.app" },
  { name: "Atlassian", logo: "https://logo.clearbit.com/atlassian.com" },
  { name: "Figma", logo: "https://logo.clearbit.com/figma.com" },
  { name: "Slack", logo: "https://logo.clearbit.com/slack.com" },
  { name: "GitHub", logo: "https://logo.clearbit.com/github.com" },
];

const features = [
  {
    icon: Kanban,
    title: "Kanban boards",
    description: "Plan and execute work with drag-and-drop boards built for fast team delivery.",
  },
  {
    icon: Users,
    title: "Real-time collaboration",
    description: "Collaborate with teammates instantly as tasks move across stages.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay updated on assignments, comments, invites, and account activity.",
  },
  {
    icon: Shield,
    title: "Role-based access",
    description: "Control who can manage workspaces, boards, members, and settings.",
  },
  {
    icon: Flag,
    title: "Priority and due dates",
    description: "Set urgency and deadlines so teams always know what to tackle first.",
  },
];

const benefits = [
  {
    title: "Better productivity",
    description: "Spend less time in meetings and status chats. Work moves visually and clearly.",
  },
  {
    title: "Clear collaboration",
    description: "Everyone sees what is in progress, blocked, and done at a glance.",
  },
  {
    title: "Project visibility",
    description: "Leaders track outcomes without micromanaging day-to-day task details.",
  },
  {
    title: "Task accountability",
    description: "Each card has an owner, priority, and due date to drive ownership.",
  },
];

const testimonials = [
  {
    name: "Sofia Carter",
    role: "Product Manager, NovaLabs",
    quote: "Sprint Desk gave our team Notion-level clarity with Trello-like speed. We ship every week now.",
    avatar: "https://i.pravatar.cc/96?img=32",
  },
  {
    name: "David Kim",
    role: "Engineering Lead, OrbitOS",
    quote: "The board flow is incredibly smooth. Our backlog, sprint work, and reviews are finally in one place.",
    avatar: "https://i.pravatar.cc/96?img=12",
  },
  {
    name: "Maya Rodriguez",
    role: "Operations Director, ClearPath",
    quote: "Role permissions and notifications made coordination across teams much easier and more reliable.",
    avatar: "https://i.pravatar.cc/96?img=44",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function HomePageClient() {
  return (
    <main className="relative overflow-hidden">
      <section className="relative isolate mx-auto max-w-7xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-16">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(1,120,211,0.28),_transparent_45%),radial-gradient(circle_at_80%_10%,_rgba(20,161,239,0.22),_transparent_38%)]"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -left-4 top-24 hidden rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur md:block"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          +12 tasks completed today
        </motion.div>
        <motion.div
          className="absolute right-6 top-36 hidden rounded-xl border border-primary/20 bg-card/80 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur lg:block"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          98.2% team on-time delivery
        </motion.div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            animate="show"
            variants={cardVariants}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              <Sparkles className="mr-1 size-3" />
              Built for modern product teams
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl xl:text-6xl">
              Plan, track, and ship work faster with visual team workflows
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              Sprint Desk helps teams organize projects through workspaces, boards, lists, and cards — with the speed of Trello,
              the clarity of Notion, and the polish of Linear.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">No credit card required • Free forever plan available</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-white/25 bg-white/60 p-3 shadow-2xl backdrop-blur-xl">
              <Image
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1400&q=80"
                alt="Sprint Desk Kanban interface preview"
                width={1400}
                height={900}
                className="h-auto w-full rounded-2xl object-cover"
                priority
              />
            </div>
            <motion.div
              className="absolute -bottom-5 left-6 hidden rounded-xl border border-border/60 bg-card/90 px-3 py-2 text-sm shadow-lg backdrop-blur md:block"
              whileHover={{ scale: 1.03 }}
            >
              <div className="font-semibold">Sprint board velocity</div>
              <div className="text-muted-foreground">24 cards shipped this week</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y bg-muted/20 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by teams at growing companies
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {companies.map((company) => (
              <div key={company.name} className="flex items-center justify-center rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
                <Image src={company.logo} alt={`${company.name} logo`} width={96} height={24} className="h-6 w-auto object-contain opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline">Product Overview</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Simple system. Powerful execution.</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Organize work in a hierarchy your team instantly understands: workspaces hold boards, boards hold lists, and lists hold actionable cards.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {["Create a workspace", "Build your board", "Move cards to done"].map((step, index) => (
            <Card key={step} className="border-border/70 bg-card/70 backdrop-blur">
              <CardHeader>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Step {index + 1}</div>
                <CardTitle>{step}</CardTitle>
              </CardHeader>
              <CardContent>
                <Image
                  src={
                    index === 0
                      ? "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                      : index === 1
                      ? "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
                      : "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80"
                  }
                  alt={`${step} preview`}
                  width={900}
                  height={560}
                  className="h-44 w-full rounded-xl object-cover"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline">Feature Highlights</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Everything your team needs to deliver</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={cardVariants}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
              >
                <Card className="h-full border-border/70 bg-card/75 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 w-fit rounded-lg bg-primary/10 p-2">
                      <feature.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8">
          <Badge variant="outline">Interactive Demo</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">See how a real board flows</h2>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur lg:grid-cols-3">
          {[
            {
              title: "To Do",
              cards: ["Finalize onboarding copy", "Create sprint kickoff checklist"],
            },
            {
              title: "In Progress",
              cards: ["Design handoff for dashboard", "QA: notification center"],
            },
            {
              title: "Done",
              cards: ["Reset password flow", "Workspace invite permissions"],
            },
          ].map((list) => (
            <div key={list.title} className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <p className="mb-3 text-sm font-semibold">{list.title}</p>
              <div className="space-y-2">
                {list.cards.map((card) => (
                  <motion.div
                    key={card}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="cursor-pointer rounded-xl border border-border/70 bg-card p-3 text-sm shadow-sm transition-colors hover:border-primary/40"
                  >
                    {card}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Badge variant="outline">Workflow</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">From user to delivery, clearly mapped</h2>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {["User", "Workspace", "Board", "List", "Card"].map((node, index, arr) => (
              <div key={node} className="flex items-center gap-2 md:gap-4">
                <div className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm">{node}</div>
                {index < arr.length - 1 ? <ArrowRight className="size-4 text-muted-foreground" /> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="max-w-2xl">
          <Badge variant="outline">Benefits</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Why high-performing teams choose Sprint Desk</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-border/70 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="size-5 text-primary" />
                  {benefit.title}
                </CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Loved by product, engineering, and operations teams</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="border-border/70 bg-card/80">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className="rounded-full" />
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">“{item.quote}”</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-10 text-primary-foreground shadow-2xl md:p-14">
          <motion.div
            aria-hidden
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to run your team with clarity?</h2>
            <p className="mt-4 text-primary-foreground/90 md:text-lg">
              Join teams using Sprint Desk to plan faster, collaborate better, and deliver consistently.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1">
            <CalendarClock className="size-4" />
            Fast onboarding
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1">
            <Layers className="size-4" />
            Scalable workspace model
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1">
            <Shield className="size-4" />
            Role-based security
          </span>
        </div>
      </section>
    </main>
  );
}
