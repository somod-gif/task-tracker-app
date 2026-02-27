import { requireCompanyId, type SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getPlatformOwnerOverview() {
  const [companies, activeCompanies, users, superAdmins] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: { not: "PLATFORM_OWNER" } } }),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
  ]);

  const rows = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
      address: true,
      website: true,
      contactEmail: true,
      contactPhone: true,
      isActive: true,
      createdAt: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    metrics: { companies, activeCompanies, users, superAdmins },
    companies: rows,
  };
}

export async function getSuperAdminOverview() {
  const [companies, departments, users, tasks, completedTasks] = await Promise.all([
    prisma.company.count(),
    prisma.department.count(),
    prisma.user.count(),
    prisma.task.count({ where: { deletedAt: null } }),
    prisma.task.count({ where: { status: "DONE", deletedAt: null } }),
  ]);

  return {
    metrics: {
      companies,
      departments,
      users,
      tasks,
      completionRate: tasks ? Math.round((completedTasks / tasks) * 100) : 0,
    },
    companies: await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tasks: true,
            departments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    users: await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    departments: await prisma.department.findMany({
      include: {
        company: { select: { name: true } },
        _count: { select: { users: true, tasks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  };
}

export async function getAdminOverview(user: SessionUser) {
  const companyId = requireCompanyId(user);
  const departmentFilter = user.departmentId ? { departmentId: user.departmentId } : {};

  const [departments, employees, teamLeads, tasks] = await Promise.all([
    prisma.department.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where: { companyId, role: "EMPLOYEE" } }),
    prisma.user.count({ where: { companyId, role: "DEPARTMENT_LEAD" } }),
    prisma.task.count({ where: { companyId, deletedAt: null, ...departmentFilter } }),
  ]);

  const users = await prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: { select: { name: true, id: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return {
    metrics: { departments: departments.length, employees, teamLeads, tasks },
    departments,
    users,
  };
}

export async function getTeamLeadOverview(user: SessionUser) {
  const companyId = requireCompanyId(user);
  const [teamMembers, tasks, completedTasks] = await Promise.all([
    prisma.user.count({
      where: {
        companyId,
        departmentId: user.departmentId,
        role: "EMPLOYEE",
      },
    }),
    prisma.task.count({
      where: {
        companyId,
        departmentId: user.departmentId,
        deletedAt: null,
      },
    }),
    prisma.task.count({
      where: {
        companyId,
        departmentId: user.departmentId,
        status: "DONE",
        deletedAt: null,
      },
    }),
  ]);

  const team = await prisma.user.findMany({
    where: {
      companyId,
      departmentId: user.departmentId,
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          assignedTasks: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return {
    metrics: {
      teamMembers,
      tasks,
      completedTasks,
      completionRate: tasks ? Math.round((completedTasks / tasks) * 100) : 0,
    },
    team,
  };
}

export async function getEmployeeOverview(user: SessionUser) {
  requireCompanyId(user);
  const [assignedTasks, inProgress, done, overdue] = await Promise.all([
    prisma.task.count({ where: { assignments: { some: { userId: user.id } }, deletedAt: null } }),
    prisma.task.count({ where: { assignments: { some: { userId: user.id } }, status: "IN_PROGRESS", deletedAt: null } }),
    prisma.task.count({ where: { assignments: { some: { userId: user.id } }, status: "DONE", deletedAt: null } }),
    prisma.task.count({
      where: {
        assignments: { some: { userId: user.id } },
        deletedAt: null,
        deadline: { lt: new Date() },
        status: { not: "DONE" },
      },
    }),
  ]);

  return {
    metrics: {
      assignedTasks,
      inProgress,
      done,
      overdue,
      completionRate: assignedTasks ? Math.round((done / assignedTasks) * 100) : 0,
    },
  };
}
