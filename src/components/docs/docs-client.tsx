"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  UserCircle,
  Layers,
  Kanban,
  Mail,
  Bell,
  GripVertical,
  Settings,
  Shield,
  Zap,
  BookOpen,
  LayoutList,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  Search,
  Users,
  Flag,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/* ─── Section registry ──────────────────────────────────────────────────── */
const NAV = [
  { id: "overview",        label: "Overview",           icon: Zap },
  { id: "getting-started", label: "Getting Started",    icon: UserCircle },
  { id: "workspaces",      label: "Workspaces",         icon: Layers },
  { id: "invitations",     label: "Inviting Your Team", icon: Mail },
  { id: "boards",          label: "Boards",             icon: LayoutList },
  { id: "kanban",          label: "Kanban Board",       icon: Kanban },
  { id: "cards",           label: "Card Details",       icon: GripVertical },
  { id: "notifications",   label: "Notifications",      icon: Bell },
  { id: "settings",        label: "Settings",           icon: Settings },
  { id: "roles",           label: "Roles & Permissions",icon: Shield },
  { id: "flow",            label: "End-to-End Flow",    icon: ArrowRight },
];

/* ─── Sidebar item ──────────────────────────────────────────────────────── */
function SidebarItem({
  id, label, icon: Icon, active, onClick,
}: {
  id: string; label: string; icon: React.ElementType;
  active: boolean; onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className={`size-3.5 shrink-0 transition-transform duration-150 ${active ? "" : "group-hover:scale-110"}`} />
      <span className="truncate">{label}</span>
      {active && <ChevronRight className="ml-auto size-3 shrink-0 opacity-70" />}
    </button>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────────────── */
function Section({
  id, title, icon: Icon, children,
}: {
  id: string; title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Icon className="size-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ─── Progress bar ──────────────────────────────────────────────────────── */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-border/40">
      <div
        className="h-full bg-primary transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ─── Mobile nav drawer ─────────────────────────────────────────────────── */
function MobileNav({
  active, onNav,
}: {
  active: string; onNav: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handle = (id: string) => {
    onNav(id);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* drawer */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Sections
              </span>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
              {NAV.map((n) => (
                <SidebarItem key={n.id} {...n} active={active === n.id} onClick={handle} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function DocsClient({
  canCreateDocs,
  docsRole,
}: {
  canCreateDocs: boolean;
  docsRole: "PLATFORM_OWNER" | "ADMIN" | "USER";
}) {
  const [activeId, setActiveId] = useState("overview");
  const [search, setSearch] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Intersection Observer — highlights active section in sidebar */
  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  /* Smooth scroll to section */
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  /* Filter nav by search */
  const filteredNav = search.trim()
    ? NAV.filter((n) => n.label.toLowerCase().includes(search.toLowerCase()))
    : NAV;

  return (
    <>
      <ReadingProgress />
      <MobileNav active={activeId} onNav={scrollTo} />

      <div className="mx-auto max-w-7xl px-4 py-12">

        {/* Page header */}
        <div className="mb-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="gap-1">
              <BookOpen className="size-3" />
              Documentation
            </Badge>
            {canCreateDocs ? (
              <Button size="sm" asChild>
                <Link href="/admin">Create documentation</Link>
              </Button>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Role: {docsRole}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Sprint Desk Docs</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Everything you need to understand, use, and get the most out of Sprint Desk —
            from signing up to running a full team workflow.
          </p>
        </div>

        <div className="flex gap-10">

          {/* ── Desktop sidebar ───────────────────────────────────────── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 space-y-2">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter sections..."
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                On this page
              </p>

              <nav className="space-y-0.5">
                {filteredNav.length > 0 ? (
                  filteredNav.map((n) => (
                    <SidebarItem
                      key={n.id}
                      {...n}
                      active={activeId === n.id}
                      onClick={scrollTo}
                    />
                  ))
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No matches</p>
                )}
              </nav>

              {/* Progress indicator */}
              <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Progress
                </p>
                <div className="space-y-1">
                  {NAV.map((n) => {
                    const idx = NAV.findIndex((x) => x.id === n.id);
                    const activeIdx = NAV.findIndex((x) => x.id === activeId);
                    const done = idx <= activeIdx;
                    return (
                      <div key={n.id} className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full transition-colors ${done ? "bg-primary" : "bg-border"}`} />
                        <span className={`text-[10px] truncate transition-colors ${done ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {n.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* ── Content ───────────────────────────────────────────────── */}
          <main className="min-w-0 flex-1 space-y-16">

            {/* ── OVERVIEW ──────────────────────────────────────────── */}
            <Section id="overview" title="Overview" icon={Zap}>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Sprint Desk</strong> is a visual project management
                platform built around Kanban boards. It lets individuals and teams organise their work
                into boards and cards, track progress by moving cards across columns, collaborate with
                teammates in real time, and stay on top of deadlines — all from a clean, fast web interface.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Think of it like a digital whiteboard with sticky notes, but smarter. No rigid company
                structures, no approval gates — sign up and start working in under two minutes.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Free forever",        desc: "No credit card, no trial expiry" },
                  { label: "No approval gates",   desc: "Sign up and get in immediately" },
                  { label: "Real-time updates",   desc: "Board changes live for everyone" },
                ].map((item) => (
                  <Card key={item.label} className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-5">
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── GETTING STARTED ───────────────────────────────────── */}
            <Section id="getting-started" title="Getting Started" icon={UserCircle}>
              <div className="space-y-6">
                {[
                  {
                    title: "Sign Up",
                    body: <>Visit the homepage and click <strong className="text-foreground">Get Started Free</strong>. Enter your name, email address, and password. You are immediately inside the app — no waiting for approval, no company verification. Your account belongs to <em>you personally</em>, not any organisation.</>,
                  },
                  {
                    title: "Sign In",
                    body: <>Returning users sign in at <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">/login</code>. Your session is maintained via JWT so you stay logged in across browser tabs and page refreshes.</>,
                  },
                  {
                    title: "After Sign-in",
                    body: <>You are redirected to <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">/workspace</code>. If you have no workspaces yet, you will be prompted to create your first one. All protected routes require authentication — unauthenticated visitors are automatically redirected to login.</>,
                  },
                ].map(({ title, body }) => (
                  <div key={title} className="rounded-xl border border-border/60 bg-card/50 p-5">
                    <h3 className="mb-2 font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── WORKSPACES ────────────────────────────────────────── */}
            <Section id="workspaces" title="Workspaces" icon={Layers}>
              <p className="text-muted-foreground leading-relaxed">
                A <strong className="text-foreground">Workspace</strong> is the top-level container —
                your team&apos;s home. Everything else (boards, lists, cards, members) lives inside a workspace.
                One user can belong to <strong className="text-foreground">many workspaces</strong> simultaneously. Each workspace is fully isolated.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Creating a Workspace", items: ["Click New Workspace in the sidebar", "Enter a name (e.g. 'Marketing Team', 'Freelance Projects')", "Add an optional description", "You automatically become the Owner"] },
                  { title: "Multiple Workspaces",  items: ["One account, unlimited workspaces", "Switch instantly from the left sidebar", "Members, boards, and data are fully isolated", "Each workspace has its own roles and settings"] },
                ].map(({ title, items }) => (
                  <Card key={title} className="border-border/70">
                    <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── INVITATIONS ───────────────────────────────────────── */}
            <Section id="invitations" title="Inviting Your Team" icon={Mail}>
              <div className="space-y-5">
                <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <h3 className="mb-3 font-semibold">How to Invite</h3>
                  <ol className="ml-4 list-decimal space-y-1.5 text-sm text-muted-foreground">
                    <li>Go to your workspace&apos;s <strong className="text-foreground">Members</strong> page</li>
                    <li>Enter the teammate&apos;s email address</li>
                    <li>Choose their role — Admin or Member</li>
                    <li>Click <strong className="text-foreground">Send Invite</strong></li>
                  </ol>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" /> Existing User
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Added to the workspace immediately. They see it in their sidebar right away — no email needed.
                    </CardContent>
                  </Card>
                  <Card className="border-blue-500/30 bg-blue-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <Mail className="size-4" /> New User
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Receives a secure invitation email with a link valid for 7 days. When they register, they automatically join your workspace.
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <h3 className="mb-3 font-semibold">Managing Members</h3>
                  <ul className="space-y-1.5">
                    {[
                      "View all members, roles, and join dates on the Members page",
                      "Promote a Member to Admin or demote an Admin to Member",
                      "Remove a member from the workspace at any time",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── BOARDS ────────────────────────────────────────────── */}
            <Section id="boards" title="Boards" icon={LayoutList}>
              <p className="text-muted-foreground leading-relaxed">
                A <strong className="text-foreground">Board</strong> lives inside a workspace and
                represents a single project, product area, or workflow. You can have unlimited boards per workspace.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Title",       desc: "The project or board name" },
                  { label: "Description", desc: "Optional context about what this board tracks" },
                  { label: "Visibility",  desc: "Private (you only), Workspace (all members), or Public (anyone with the link)" },
                  { label: "Cover Colour",desc: "A colour accent to visually distinguish boards in the workspace view" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-sm font-semibold text-primary mb-1">Default Setup</p>
                <p className="text-sm text-muted-foreground">
                  Every new board is automatically seeded with three starter lists:
                  <strong className="text-foreground"> To Do</strong>,
                  <strong className="text-foreground"> In Progress</strong>, and
                  <strong className="text-foreground"> Done</strong>.
                  You can rename, delete, or reorder these and add unlimited new lists.
                </p>
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── KANBAN ────────────────────────────────────────────── */}
            <Section id="kanban" title="The Kanban Board" icon={Kanban}>
              <p className="text-muted-foreground leading-relaxed">
                Opening a board shows the full <strong className="text-foreground">drag-and-drop Kanban view</strong> —
                the heart of the app. Lists are columns; cards are tasks stacked inside those columns.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Lists (Columns)",
                    items: [
                      "Each list represents a stage in your workflow",
                      "Add unlimited lists — Backlog, In Review, Blocked, Released…",
                      "Rename or delete any list at any time",
                    ],
                  },
                  {
                    title: "Cards (Tasks)",
                    items: [
                      "Each card is one task, feature, bug, idea, or unit of work",
                      "Cards show title, priority badge, due date, and assignee avatars",
                      "Click a card to open its full detail modal",
                    ],
                  },
                  {
                    title: "Drag and Drop",
                    items: [
                      "Drag up or down to reorder within the same list",
                      "Drag sideways to move between lists (e.g. To Do → In Progress)",
                      "Board updates instantly for all members — no refresh needed",
                    ],
                  },
                ].map(({ title, items }) => (
                  <div key={title} className="rounded-xl border border-border/60 bg-card/50 p-5">
                    <h3 className="mb-3 font-semibold">{title}</h3>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── CARD DETAILS ──────────────────────────────────────── */}
            <Section id="cards" title="Card Details" icon={GripVertical}>
              <p className="text-muted-foreground leading-relaxed">
                Click any card to open its <strong className="text-foreground">full detail modal</strong>.
                This is where the real depth of a task lives.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Flag,           title: "Priority",          desc: "Set Low, Medium, High, or Urgent. The badge appears on the card tile in colour." },
                  { icon: CheckCircle2,   title: "Due Date",          desc: "Attach a deadline so teams can track delivery commitments clearly." },
                  { icon: Users,          title: "Assignees",         desc: "Assign one or more workspace members. They are notified immediately." },
                  { icon: MessageSquare,  title: "Comments",          desc: "Threaded comments with timestamps — for status updates, questions, or decisions." },
                  { icon: Zap,            title: "Activity Log",      desc: "Auto-recorded audit trail: every move, priority change, assignment, and edit — permanent." },
                  { icon: Layers,         title: "Cover Colour",      desc: "Visual colour header for categorisation — e.g. red for bugs, green for features." },
                ].map(({ icon: Icon, title, desc }) => (
                  <Card key={title} className="border-border/70 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Icon className="size-4 text-primary" />
                        {title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">Priority Levels</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "LOW",    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
                    { label: "MEDIUM", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
                    { label: "HIGH",   color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
                    { label: "URGENT", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                  ].map(({ label, color }) => (
                    <span key={label} className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide ${color}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── NOTIFICATIONS ─────────────────────────────────────── */}
            <Section id="notifications" title="Notifications" icon={Bell}>
              <p className="text-muted-foreground leading-relaxed">
                Sprint Desk includes a dedicated <strong className="text-foreground">Notifications Center</strong> at
                <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">/workspace/notifications</code>.
                Use the sidebar bell icon to open it quickly and monitor activity.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Card assignment notifications",
                  "Card comment notifications",
                  "Workspace invitation notifications",
                  "Login activity notifications",
                ].map((trigger) => (
                  <div key={trigger} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
                    <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">{trigger}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                <h3 className="mb-3 font-semibold">Managing notifications</h3>
                <ul className="space-y-1.5">
                  {[
                    "Unread count appears beside the sidebar bell icon",
                    "Open any notification directly from the center",
                    "Mark individual notifications as read",
                    "Mark all notifications as read in one click",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── SETTINGS ──────────────────────────────────────────── */}
            <Section id="settings" title="Workspace Settings" icon={Settings}>
              <p className="text-muted-foreground leading-relaxed">
                Available to <strong className="text-foreground">Owners</strong> only from the Settings page of any workspace they own.
              </p>
              <div className="space-y-3">
                {[
                  { action: "Rename",           desc: "Change the workspace name at any time." },
                  { action: "Update Description", desc: "Edit the description shown to all members." },
                  { action: "Delete Workspace",  desc: "Permanent and cascading — removes all boards, lists, cards, members, activity history, and notifications." },
                ].map(({ action, desc }) => (
                  <div
                    key={action}
                    className={`flex gap-4 rounded-xl border p-4 ${action === "Delete Workspace" ? "border-destructive/30 bg-destructive/5" : "border-border/60 bg-card/50"}`}
                  >
                    <Settings className={`mt-0.5 size-4 shrink-0 ${action === "Delete Workspace" ? "text-destructive" : "text-primary"}`} />
                    <div>
                      <p className="text-sm font-semibold">{action}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── ROLES ─────────────────────────────────────────────── */}
            <Section id="roles" title="Roles & Permissions" icon={Shield}>
              <p className="text-muted-foreground leading-relaxed">
                Every workspace member holds one of three roles. Permissions are enforced on both the client and server — not just hidden in the UI.
              </p>

              <div className="overflow-x-auto rounded-xl border border-border/70">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                      <th className="px-4 py-3 text-center font-semibold">Owner</th>
                      <th className="px-4 py-3 text-center font-semibold">Admin</th>
                      <th className="px-4 py-3 text-center font-semibold">Member</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      ["Create / delete workspace",     true,  false, false],
                      ["Rename workspace",              true,  true,  false],
                      ["Invite members",                true,  true,  false],
                      ["Remove members",                true,  true,  false],
                      ["Change member roles",           true,  true,  false],
                      ["Create / delete boards",        true,  true,  false],
                      ["Create / edit / move cards",    true,  true,  true ],
                      ["Comment on cards",              true,  true,  true ],
                      ["View workspace boards",         true,  true,  true ],
                    ].map(([action, owner, admin, member]) => (
                      <tr key={action as string} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{action as string}</td>
                        <td className="px-4 py-3 text-center">{owner ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-muted-foreground/30">—</span>}</td>
                        <td className="px-4 py-3 text-center">{admin ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-muted-foreground/30">—</span>}</td>
                        <td className="px-4 py-3 text-center">{member ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-muted-foreground/30">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── FLOW ──────────────────────────────────────────────── */}
            <Section id="flow" title="End-to-End Flow" icon={ArrowRight}>
              <p className="text-muted-foreground leading-relaxed">
                The complete journey from a brand-new visitor to a fully running team workflow.
              </p>

              <div className="relative">
                {/* vertical connector */}
                <div className="absolute left-[18px] top-8 h-[calc(100%-4rem)] w-0.5 bg-border/60" />

                <div className="space-y-4">
                  {[
                    { step: "01", title: "Visit the homepage",             desc: "Read about the platform, features, and flow." },
                    { step: "02", title: "Click Get Started Free",         desc: "Register with name, email, and password. No credit card required." },
                    { step: "03", title: "Redirected to /workspace",       desc: "No workspaces yet — prompted to create the first one." },
                    { step: "04", title: "Create Workspace \"My Team\"",   desc: "You are automatically the Owner." },
                    { step: "05", title: "Invite teammates",               desc: "Enter emails and pick roles. Existing users join instantly; new users get an invite email." },
                    { step: "06", title: "Create Board \"Website Launch\"", desc: "Board is seeded with To Do, In Progress, and Done lists." },
                    { step: "07", title: "Add cards to To Do",             desc: "\"Write homepage copy\", \"Design mockups\", \"Set up hosting\"." },
                    { step: "08", title: "Open a card and fill in details", desc: "Set priority: High, due date: March 10, assign to Sarah." },
                    { step: "09", title: "Sarah sees the assignment on board", desc: "The task appears under assigned work and is visible immediately." },
                    { step: "10", title: "Sarah drags card to In Progress", desc: "Board updates live for all workspace members." },
                    { step: "11", title: "Sarah finishes",                 desc: "Drags card to Done, adds comment: \"Copy approved by client.\"" },
                    { step: "12", title: "Activity log records everything", desc: "Who moved it, when, from which list to which — permanent audit trail." },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="relative flex gap-4 pl-2">
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow">
                        {step}
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card/50 p-4 flex-1">
                        <p className="font-semibold text-sm">{title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <hr className="border-border/40" />

            {/* ── CTA ───────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center space-y-4">
              <h2 className="text-2xl font-bold">Ready to get started?</h2>
              <p className="text-muted-foreground">
                Create your free account and have your first board running in under two minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-1">
                <Button asChild size="lg">
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
