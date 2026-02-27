/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowRight, 
  Building2, 
  ChartColumnBig, 
  Clock3, 
  ShieldCheck, 
  Users,
  CheckCircle2,
  TrendingUp,
  Zap,
  BarChart3,
  Layers,
  Lock,
  Mail,
  Bell,
  Rocket,
  Target,
  GitBranch,
  Award,
  Globe,
  Sparkles
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { dashboardByRole } from "@/lib/rbac";
import { PublicShell } from "@/components/marketing/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardByRole[user.role]);
  }

  return (
    <PublicShell activePath="/">
      {/* Hero Section - Enhanced with more compelling copy */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              <Sparkles className="mr-1 size-3" />
              Enterprise-Ready Multi-tenant Platform
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl">
              Transform how your organization executes sprints
            </h1>
            
            <p className="text-lg text-muted-foreground lg:text-xl">
              Sprint Desk provides enterprise-grade governance, real-time visibility, and structured delivery across 
              <span className="font-semibold text-foreground"> companies, departments, and teams</span>.
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-4 py-4">
              {[
                { value: "10k+", label: "Sprints Completed" },
                { value: "500+", label: "Enterprise Teams" },
                { value: "99.9%", label: "Platform Uptime" },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="text-2xl font-bold text-primary">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/register-company">
                  Start your free trial
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Book a demo</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={i} className="size-8 border-2 border-background">
                    <AvatarImage src={`/avatars/team-${i}.jpg`} />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,500+</span> teams already shipping faster
              </p>
            </div>
          </div>

          {/* Enhanced dashboard preview */}
          <Card className="border-border/70 bg-card/50 shadow-xl backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Executive Dashboard</CardTitle>
                  <CardDescription>Live demo data • Updated in real-time</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Clock3 className="size-3" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* KPI Grid */}
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Active Sprints", value: "12", trend: "+2", icon: Target },
                  { label: "Completion Rate", value: "84%", trend: "+5%", icon: CheckCircle2 },
                  { label: "Team Velocity", value: "124", trend: "+12%", icon: TrendingUp },
                  { label: "Overdue Tasks", value: "7", trend: "-3", icon: Clock3 },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border/70 bg-card p-3">
                    <div className="flex items-center justify-between">
                      <item.icon className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-emerald-500">{item.trend}</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Enhanced chart visualization */}
              <div className="rounded-lg border border-border/70 bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Sprint Progress</h4>
                    <p className="text-xs text-muted-foreground">Current sprint • Week 12</p>
                  </div>
                  <div className="flex gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                      <span key={day} className="text-xs text-muted-foreground">{day}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  {[65, 72, 78, 85, 92].map((value, index) => (
                    <div key={index} className="group relative flex-1">
                      <div 
                        className="h-24 rounded-t-md bg-gradient-to-t from-primary/80 to-primary transition-all group-hover:from-primary"
                        style={{ height: `${value}%` }}
                      />
                      <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs group-hover:block">
                        {value}% complete
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity feed */}
              <div className="rounded-lg border border-border/70 bg-card p-3">
                <h4 className="mb-2 text-xs font-medium text-muted-foreground">RECENT ACTIVITY</h4>
                <div className="space-y-2">
                  {[
                    { user: "Sarah Chen", action: "completed", task: "API integration", time: "2m ago" },
                    { user: "Marcus Lee", action: "started", task: "UI review", time: "15m ago" },
                    { user: "Emma Davis", action: "blocked on", task: "deployment", time: "1h ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-muted-foreground">{activity.action}</span>
                      <span className="font-medium">{activity.task}</span>
                      <span className="ml-auto text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trusted by section - New */}
      <section className="border-y border-border/40 bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            TRUSTED BY LEADING ENTERPRISES
          </p>
          <div className="grid grid-cols-2 gap-8 opacity-70 md:grid-cols-5">
            {["TechCorp", "GlobalBank", "HealthSys", "EcoEnergy", "FinServe"].map((company) => (
              <div key={company} className="flex items-center justify-center">
                <div className="h-8 w-24 rounded bg-muted-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features - Enhanced with icons and descriptions */}
      <section className="mx-auto max-w-7xl space-y-12 px-4 py-20">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">PLATFORM CAPABILITIES</Badge>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Everything you need to scale sprint execution
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From multi-tenant governance to real-time analytics, Sprint Desk provides enterprise-grade tools for modern teams.
          </p>
        </div>

        <Tabs defaultValue="governance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="governance" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Building2, title: "Multi-tenant Architecture", desc: "Isolated company spaces with centralized platform control", features: ["Company-specific data isolation", "Cross-company reporting", "Platform-wide policies"] },
                { icon: Users, title: "Role Hierarchy", desc: "Granular permissions from platform owner to individual contributor", features: ["5 pre-defined roles", "Custom role creation", "Department-level scoping"] },
                { icon: ShieldCheck, title: "Approval Workflows", desc: "Structured review processes for company and sprint approvals", features: ["Multi-step approvals", "Audit trails", "Automated notifications"] },
              ].map((item) => (
                <Card key={item.title} className="border-border/70">
                  <CardHeader>
                    <div className="mb-2 rounded-lg bg-primary/10 p-2 w-fit">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="size-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Similar structure for other tabs... */}
        </Tabs>
      </section>

      {/* How It Works - Enhanced with icons */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">SIMPLE PROCESS</Badge>
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Get your teams running in 4 simple steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From company registration to full-scale execution, we make onboarding seamless.
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connection line */}
            <div className="absolute left-0 top-8 hidden h-0.5 w-full bg-border md:block" />
            
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { icon: Building2, title: "Register", desc: "Create your company profile and set up initial teams", duration: "5 minutes" },
                { icon: ShieldCheck, title: "Get Approved", desc: "Platform owner reviews and activates your workspace", duration: "24 hours" },
                { icon: Users, title: "Configure", desc: "Set up departments, roles, and team structures", duration: "1-2 days" },
                { icon: Rocket, title: "Launch", desc: "Start creating sprints and tracking progress", duration: "Immediate" },
              ].map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative z-10 mb-4 rounded-full bg-primary p-4 text-primary-foreground shadow-lg">
                      <step.icon className="size-6" />
                    </div>
                    <div className="mb-2 text-sm font-medium text-primary">Step {index + 1}</div>
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">{step.desc}</p>
                    <Badge variant="secondary">{step.duration}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - New section */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">USE CASES</Badge>
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Built for diverse team structures
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Globe, title: "Distributed Teams", desc: "Coordinate sprints across time zones with async-first tools", metrics: "45% faster delivery" },
            { icon: Layers, title: "Multi-department Orgs", desc: "Manage cross-functional initiatives with department-level visibility", metrics: "60% fewer bottlenecks" },
            { icon: GitBranch, title: "Agile Agencies", desc: "Handle multiple client projects with clear separation and reporting", metrics: "100% client satisfaction" },
          ].map((useCase) => (
            <Card key={useCase.title} className="border-border/70 hover:border-primary/50 transition-colors">
              <CardHeader>
                <useCase.icon className="size-8 text-primary mb-2" />
                <CardTitle>{useCase.title}</CardTitle>
                <CardDescription>{useCase.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-primary/10 p-3">
                  <div className="text-2xl font-bold text-primary">{useCase.metrics}</div>
                  <div className="text-xs text-muted-foreground">Average improvement</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials - Enhanced with more detail */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">CUSTOMER SUCCESS</Badge>
            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Loved by engineering leaders
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Director of Operations",
                company: "Nova Logistics",
                image: "/avatars/testimonial-1.jpg",
                quote: "Sprint Desk gave us a unified operating model across 12 teams and 4 locations. We've reduced status meetings by 80% and increased delivery predictability.",
                metric: "80% fewer meetings",
              },
              {
                name: "Michael Chen",
                role: "Head of PMO",
                company: "Harbor Systems",
                image: "/avatars/testimonial-2.jpg",
                quote: "The dashboard insights made bottlenecks immediately obvious. We resolved sprint delays 3x faster and improved stakeholder confidence significantly.",
                metric: "3x faster resolution",
              },
              {
                name: "Elena Rodriguez",
                role: "Engineering Lead",
                company: "Apex Finance",
                image: "/avatars/testimonial-3.jpg",
                quote: "Task assignment and status visibility now feel enterprise-grade. Our compliance team loves the audit trails and role-based access controls.",
                metric: "100% compliance",
              },
            ].map((item) => (
              <Card key={item.name} className="border-border/70">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarImage src={item.image} />
                      <AvatarFallback>{item.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription className="text-xs">{item.role} • {item.company}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm italic text-muted-foreground">"{item.quote}"</p>
                  <Badge variant="secondary" className="mt-2">
                    <Award className="mr-1 size-3" />
                    {item.metric}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats summary */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: "98%", label: "Customer satisfaction" },
              { value: "500+", label: "Enterprise clients" },
              { value: "10x", label: "ROI reported" },
              { value: "24/7", label: "Support available" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - New */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </div>

        <div className="mt-12 grid gap-4">
          {[
            {
              q: "How does multi-tenancy work?",
              a: "Each company gets an isolated workspace with their own data, users, and configurations. Platform owners can manage all companies from a central dashboard with full visibility and control."
            },
            {
              q: "Can we customize roles and permissions?",
              a: "Yes! While we provide 5 pre-defined roles, you can create custom roles with specific permissions tailored to your organization's structure and workflows."
            },
            {
              q: "What kind of support do you offer?",
              a: "All plans include email support. Enterprise plans come with dedicated account managers, SLAs, and 24/7 phone support. We also provide comprehensive documentation and training."
            },
            {
              q: "Is our data secure?",
              a: "Absolutely. We use enterprise-grade encryption, regular security audits, and comply with GDPR, SOC2, and ISO 27001 standards. Your data is always encrypted at rest and in transit."
            }
          ].map((faq) => (
            <Card key={faq.q} className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 text-primary-foreground shadow-2xl lg:p-16">
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform">
            <div className="h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          </div>
          
          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground">
                <Rocket className="mr-1 size-3" />
                Get started today
              </Badge>
              
              <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
                Ready to transform your sprint execution?
              </h2>
              
              <p className="mt-4 text-primary-foreground/90 lg:text-lg">
                Join hundreds of enterprises that have streamlined their delivery process with Sprint Desk. 
                Start your 14-day free trial – no credit card required.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register-company">
                    Start free trial
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link href="/contact-sales">Contact sales</Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="size-8 border-2 border-primary">
                      <AvatarFallback className="bg-primary-foreground text-primary">U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-sm text-primary-foreground/80">
                  <span className="font-semibold">2,500+</span> teams already shipping faster
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur">
              <h3 className="font-semibold">What's included:</h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Full platform access for 14 days",
                  "All enterprise features included",
                  "Dedicated onboarding specialist",
                  "Custom role configuration",
                  "Priority email & chat support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}