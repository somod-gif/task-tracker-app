import { requireCompanyId, type SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/services/notification-service";
import type { SprintType } from "@/types/domain";

type SprintDelegate = {
  create: (args: {
    data: {
      name: string;
      description?: string;
      type: SprintType;
      companyId: string;
      departmentId?: string;
      assignedDepartmentId?: string;
      createdById: string;
      assignedById: string;
      startDate?: Date;
      endDate?: Date;
    };
  }) => Promise<unknown>;
  findMany: (args: {
    where: {
      companyId: string;
      deletedAt: null;
    };
    include: {
      department: { select: { id: true; name: true } };
      assignedDepartment: { select: { id: true; name: true } };
      createdBy: { select: { id: true; name: true } };
    };
    orderBy: { createdAt: "desc" };
  }) => Promise<unknown>;
  updateMany: (args: {
    where: {
      id: string;
      companyId: string;
      deletedAt: null;
    };
    data: {
      name?: string;
      description?: string;
      type?: SprintType;
      departmentId?: string;
      assignedDepartmentId?: string;
      assignedById?: string;
      startDate?: Date;
      endDate?: Date;
      deletedAt?: Date;
    };
  }) => Promise<{ count: number }>;
};

type PrismaWithSprint = typeof prisma & {
  sprint: SprintDelegate;
};

type CreateSprintInput = {
  name: string;
  description?: string;
  type: SprintType;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
};

type UpdateSprintInput = {
  sprintId: string;
  name: string;
  description?: string;
  type: SprintType;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
};

export async function createSprint(user: SessionUser, input: CreateSprintInput) {
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    throw new Error("Only Super Admin or Admin can create sprint/backlog");
  }

  const companyId = requireCompanyId(user);
  const db = prisma as unknown as PrismaWithSprint;

  const sprint = await db.sprint.create({
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      companyId,
      departmentId: input.departmentId,
      assignedDepartmentId: input.departmentId,
      createdById: user.id,
      assignedById: user.id,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });

  if (input.departmentId) {
    const departmentLeads = await prisma.user.findMany({
      where: {
        companyId,
        departmentId: input.departmentId,
        role: "DEPARTMENT_LEAD" as never,
      },
      select: { id: true },
    });

    await Promise.all(
      departmentLeads.map((lead) =>
        createNotification({
          userId: lead.id,
          companyId,
          title: "Sprint Assigned",
          message: `${input.type === "BACKLOG" ? "Backlog" : "Sprint"} \"${input.name}\" has been assigned to your department.`,
          type: "SPRINT_ASSIGNED",
        }),
      ),
    );
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "SPRINT_ASSIGNED" as never,
      description: `${input.type} \"${input.name}\" assigned${input.departmentId ? " to department" : ""}`,
    },
  });

  return sprint;
}

export async function listSprintsForCompany(user: SessionUser) {
  const companyId = requireCompanyId(user);
  const db = prisma as unknown as PrismaWithSprint;

  return db.sprint.findMany({
    where: {
      companyId,
      deletedAt: null,
    },
    include: {
      department: { select: { id: true, name: true } },
      assignedDepartment: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSprint(user: SessionUser, input: UpdateSprintInput) {
  if (![("SUPER_ADMIN"), ("ADMIN")].includes(user.role)) {
    throw new Error("Only Super Admin or Admin can update sprint/backlog");
  }

  const companyId = requireCompanyId(user);
  const db = prisma as unknown as PrismaWithSprint;

  const result = await db.sprint.updateMany({
    where: {
      id: input.sprintId,
      companyId,
      deletedAt: null,
    },
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      departmentId: input.departmentId,
      assignedDepartmentId: input.departmentId,
      assignedById: user.id,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });

  if (!result.count) {
    throw new Error("Sprint not found");
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "SPRINT_ASSIGNED" as never,
      description: `Sprint updated: ${input.name}`,
    },
  });

  return { success: true };
}

export async function softDeleteSprint(user: SessionUser, sprintId: string) {
  if (![("SUPER_ADMIN"), ("ADMIN")].includes(user.role)) {
    throw new Error("Only Super Admin or Admin can delete sprint/backlog");
  }

  const companyId = requireCompanyId(user);
  const db = prisma as unknown as PrismaWithSprint;

  const result = await db.sprint.updateMany({
    where: {
      id: sprintId,
      companyId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (!result.count) {
    throw new Error("Sprint not found");
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "SPRINT_ASSIGNED" as never,
      description: `Sprint deleted: ${sprintId}`,
    },
  });

  return { success: true };
}
