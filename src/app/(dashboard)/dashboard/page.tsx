import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskTable } from "@/components/tasks/task-table";
import { AdminManagement } from "@/components/dashboard/admin-management";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PlatformOwnerCompanyManagement } from "@/components/dashboard/platform-owner-company-management";
import { SprintManagement } from "@/components/dashboard/sprint-management";
import { TaskStatusChart } from "@/components/dashboard/task-status-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
	getAdminOverview,
	getEmployeeOverview,
	getPlatformOwnerOverview,
	getSuperAdminOverview,
	getTeamLeadOverview,
} from "@/server/services/dashboard-service";
import { listAssignableMembers, listTasksForUser } from "@/server/services/task-service";

function buildTaskStatusData(tasks: Array<{ status: "TODO" | "IN_PROGRESS" | "DONE" }>) {
	const todo = tasks.filter((task) => task.status === "TODO").length;
	const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
	const done = tasks.filter((task) => task.status === "DONE").length;

	return [
		{ label: "To Do", value: todo, colorClass: "bg-primary/35" },
		{ label: "In Progress", value: inProgress, colorClass: "bg-primary/60" },
		{ label: "Done", value: done, colorClass: "bg-primary" },
	];
}

function RoleHero({
	title,
	description,
	badge,
	className,
}: {
	title: string;
	description: string;
	badge: string;
	className?: string;
}) {
	return (
		<Card className={cn("border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-sm", className)}>
			<CardHeader className="pb-5">
				<p className="mb-2 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
					{badge}
				</p>
				<CardTitle className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</CardTitle>
				<CardDescription className="max-w-3xl text-sm md:text-base">{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
	return (
		<Card className="border-primary/15 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

export default async function DashboardPage() {
	const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]);

	if (user.role === "PLATFORM_OWNER") {
		const overview = await getPlatformOwnerOverview();

		return (
			<DashboardShell user={user} title="Dashboard">
				<div className="space-y-8">
					<RoleHero
						title="Executive Platform Intelligence"
						description="High-level tenant analytics, company health, and executive governance controls in one premium command center."
						badge="Platform Owner"
						className="border-primary/30 bg-primary text-primary-foreground"
					/>

					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
						<MetricCard title="Companies" value={overview.metrics.companies} helper="Tenant organizations" />
						<MetricCard title="Active Companies" value={overview.metrics.activeCompanies} helper="Operational tenants" />
						<MetricCard title="Users" value={overview.metrics.users} helper="Cross-company active users" />
						<MetricCard title="Super Admins" value={overview.metrics.superAdmins} helper="Executive account holders" />
					</div>

					<div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
						<TaskStatusChart
							title="Platform Distribution"
							description="Organization and user footprint snapshot."
							data={[
								{ label: "Active Companies", value: overview.metrics.activeCompanies, colorClass: "bg-primary" },
								{
									label: "Inactive Companies",
									value: overview.metrics.companies - overview.metrics.activeCompanies,
									colorClass: "bg-primary/35",
								},
								{ label: "Super Admins", value: overview.metrics.superAdmins, colorClass: "bg-primary/65" },
							]}
						/>
						<Card className="border-primary/20 bg-primary/5 shadow-sm">
							<CardHeader>
								<CardTitle className="text-base font-semibold">Strategic Snapshot</CardTitle>
								<CardDescription>Executive roll-up for investor and leadership reviews.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<p className="rounded-md border border-primary/15 bg-background/80 p-3">Activation rate remains the key tenant health indicator.</p>
								<p className="rounded-md border border-primary/15 bg-background/80 p-3">Super admin coverage should scale with active company growth.</p>
							</CardContent>
						</Card>
					</div>

					<PlatformOwnerCompanyManagement companies={overview.companies} />
				</div>
			</DashboardShell>
		);
	}

	if (user.role === "SUPER_ADMIN") {
		const [overview, tasks, departments] = await Promise.all([
			getSuperAdminOverview(),
			listTasksForUser(user),
			user.companyId
				? prisma.department.findMany({
						where: { companyId: user.companyId },
						select: { id: true, name: true },
						orderBy: { name: "asc" },
					})
				: Promise.resolve([]),
		]);

		return (
			<DashboardShell user={user} title="Dashboard">
				<div className="space-y-8">
					<RoleHero
						title="Operations Command Center"
						description="Keep delivery flow stable with balanced oversight across departments, sprint planning, and execution signals."
						badge="Super Admin"
					/>

					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
						<MetricCard title="Companies" value={overview.metrics.companies} helper="Tenant organizations" />
						<MetricCard title="Departments" value={overview.metrics.departments} helper="Operational units" />
						<MetricCard title="Users" value={overview.metrics.users} helper="Platform users" />
						<MetricCard title="Tasks" value={overview.metrics.tasks} helper="Open and completed" />
						<MetricCard title="Completion" value={overview.metrics.completionRate} subtitle="%" helper="Delivery performance" />
					</div>

					<div className="grid gap-6 xl:grid-cols-2">
						<TaskStatusChart
							title="Task Status"
							description="Current task progress across your scope."
							data={buildTaskStatusData(tasks)}
						/>
						<SprintManagement departments={departments} />
					</div>

					<SectionCard title="Recent Tasks" description="Latest tasks visible in your dashboard scope.">
						<TaskTable tasks={tasks} canDelete canUpdate />
					</SectionCard>
				</div>
			</DashboardShell>
		);
	}

	if (user.role === "ADMIN") {
		const [overview, tasks] = await Promise.all([getAdminOverview(user), listTasksForUser(user)]);

		return (
			<DashboardShell user={user} title="Dashboard">
				<div className="space-y-10">
					<RoleHero
						title="Business Insight Workspace"
						description="Executive-ready view for people performance, department execution, and company-level delivery outcomes."
						badge="Admin / CEO"
					/>

					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
						<MetricCard title="Departments" value={overview.metrics.departments} helper="Managed units" />
						<MetricCard title="Employees" value={overview.metrics.employees} helper="Company workforce" />
						<MetricCard title="Team Leads" value={overview.metrics.teamLeads} helper="Department leaders" />
						<MetricCard title="Tasks" value={overview.metrics.tasks} helper="Company task volume" />
						<MetricCard
							title="Members"
							value={overview.users.length}
							helper="Total users in your company"
						/>
					</div>

					<div className="grid gap-8">
						<TaskStatusChart
							title="Task Status"
							description="Progress for tasks in your visible scope."
							data={buildTaskStatusData(tasks)}
						/>

						<SprintManagement departments={overview.departments} />
						<AdminManagement departments={overview.departments} users={overview.users} />
					</div>

					<SectionCard title="Task Board" description="Monitor and maintain execution quality.">
						<TaskTable tasks={tasks} canDelete canUpdate />
					</SectionCard>
				</div>
			</DashboardShell>
		);
	}

	if (user.role === "DEPARTMENT_LEAD") {
		const [overview, tasks, assignees] = await Promise.all([
			getTeamLeadOverview(user),
			listTasksForUser(user),
			listAssignableMembers(user),
		]);

		return (
			<DashboardShell user={user} title="Dashboard">
				<div className="space-y-7">
					<RoleHero
						title="Execution Hub"
						description="Drive sprint output with clear workload visibility and fast team-level action."
						badge="Department Lead"
					/>

					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
						<MetricCard title="Team Members" value={overview.metrics.teamMembers} helper="Assignable teammates" />
						<MetricCard title="Tasks" value={overview.metrics.tasks} helper="Department tasks" />
						<MetricCard title="Completed" value={overview.metrics.completedTasks} helper="Finished deliveries" />
						<MetricCard title="Completion" value={overview.metrics.completionRate} subtitle="%" helper="Delivery performance" />
						<MetricCard title="My Scope" value={tasks.length} helper="Visible task rows" />
					</div>

					<div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
						<div>
							<p className="text-sm font-semibold">Sprint Delivery Controls</p>
							<p className="text-xs text-muted-foreground">Prioritize, assign, and close tasks without leaving this view.</p>
						</div>
						<CreateTaskDialog assignees={assignees} />
					</div>

					<div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
						<TaskStatusChart
							title="Sprint Progress"
							description="Your department task distribution."
							data={buildTaskStatusData(tasks)}
						/>
						<Card className="border-primary/20 shadow-sm">
							<CardHeader>
								<CardTitle className="text-base font-semibold">Workload Pulse</CardTitle>
								<CardDescription>Live capacity view from your current task board.</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-3 text-sm">
								<p className="rounded-md border border-primary/15 bg-primary/5 p-3">Open workload: {tasks.filter((task) => task.status !== "DONE").length}</p>
								<p className="rounded-md border border-primary/15 bg-primary/5 p-3">Completed momentum: {overview.metrics.completionRate}%</p>
							</CardContent>
						</Card>
					</div>

					<SectionCard title="Task Board" description="Create, assign, update, and archive department work.">
						<TaskTable tasks={tasks} canDelete canUpdate />
					</SectionCard>
				</div>
			</DashboardShell>
		);
	}

	const [overview, tasks] = await Promise.all([getEmployeeOverview(user), listTasksForUser(user)]);

	return (
		<DashboardShell user={user} title="Dashboard">
			<div className="space-y-6">
				<RoleHero
					title="My Productivity"
					description="A focused view of your assigned work, progress, and deadlines."
					badge="Employee"
					className="bg-background"
				/>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
					<MetricCard title="Assigned" value={overview.metrics.assignedTasks} helper="Tasks assigned to you" />
					<MetricCard title="In Progress" value={overview.metrics.inProgress} helper="Currently active" />
					<MetricCard title="Done" value={overview.metrics.done} helper="Completed tasks" />
					<MetricCard title="Overdue" value={overview.metrics.overdue} helper="Pending past deadline" />
					<MetricCard title="Completion" value={overview.metrics.completionRate} subtitle="%" helper="Personal delivery score" />
				</div>

				<div className="grid gap-6 xl:grid-cols-[1fr]">
					<TaskStatusChart
						title="My Task Status"
						description="Current status across your assignments."
						data={buildTaskStatusData(tasks)}
					/>
				</div>

				<SectionCard title="My Tasks" description="Update status as you move work forward.">
					<TaskTable tasks={tasks} canUpdate />
				</SectionCard>
			</div>
		</DashboardShell>
	);
}
