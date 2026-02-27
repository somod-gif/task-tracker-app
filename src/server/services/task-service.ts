import { requireCompanyId, type SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/services/notification-service";
import type { TaskPriority, TaskStatus, TaskWorkType } from "@/types/domain";

const ActivityAction = {
  TASK_CREATED: "TASK_CREATED",
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_STATUS_UPDATED: "TASK_STATUS_UPDATED",
  TASK_COMMENT_ADDED: "TASK_COMMENT_ADDED",
  TASK_SOFT_DELETED: "TASK_SOFT_DELETED",
  TASK_OVERDUE: "TASK_OVERDUE",
} as const;

const TaskStatusValue = {
  DONE: "DONE",
} as const;

type CreateTaskInput = {
  title: string;
  summary?: string;
  description: string;
  richContent?: string;
  deadline: Date;
  priority: TaskPriority;
  workType: TaskWorkType;
  sprintName?: string;
  labels?: string[];
  referenceLinks?: string[];
  assignedToIds: string[];
};

type UpdateTaskStatusInput = {
  taskId: string;
  status: TaskStatus;
  comment?: string;
};

function buildTaskScope(user: SessionUser) {
  const companyId = requireCompanyId(user);

  if (user.role === "SUPER_ADMIN") {
    return {};
  }

  if (user.role === "ADMIN") {
    return {
      companyId,
      departmentId: user.departmentId ?? "NO_DEPARTMENT",
    };
  }

  if (user.role === "DEPARTMENT_LEAD") {
    return {
      companyId,
      departmentId: user.departmentId ?? "NO_DEPARTMENT",
    };
  }

  return {
    companyId,
    assignments: {
      some: {
        userId: user.id,
      },
    },
  };
}

export async function listTasksForUser(user: SessionUser) {
  const companyId = requireCompanyId(user);
  await detectOverdueTasks(companyId);

  return prisma.task.findMany({
    where: {
      deletedAt: null,
      ...buildTaskScope(user),
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { assignedAt: "asc" },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
  });
}

export async function listAssignableMembers(user: SessionUser) {
  if (user.role !== "DEPARTMENT_LEAD") {
    return [];
  }

  const companyId = requireCompanyId(user);

  return prisma.user.findMany({
    where: {
      companyId,
      departmentId: user.departmentId ?? "NO_DEPARTMENT",
      role: {
        in: ["EMPLOYEE", "DEPARTMENT_LEAD"],
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function createTask(user: SessionUser, input: CreateTaskInput) {
  if (user.role !== "DEPARTMENT_LEAD") {
    throw new Error("Only team leads can create tasks");
  }

  const companyId = requireCompanyId(user);

  const uniqueAssigneeIds = Array.from(new Set(input.assignedToIds));
  const assignees = await prisma.user.findMany({
    where: {
      id: { in: uniqueAssigneeIds },
      companyId,
      departmentId: user.departmentId,
      role: {
        in: ["EMPLOYEE", "DEPARTMENT_LEAD"],
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (assignees.length !== uniqueAssigneeIds.length) {
    throw new Error("All assignees must belong to your department and company");
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      summary: input.summary,
      description: input.description,
      richContent: input.richContent,
      deadline: input.deadline,
      priority: input.priority,
      workType: input.workType,
      sprintName: input.sprintName,
      labels: input.labels ?? [],
      referenceLinks: input.referenceLinks ?? [],
      assignedAt: new Date(),
      assignedToId: user.id,
      createdById: user.id,
      companyId,
      departmentId: user.departmentId,
      assignments: {
        create: assignees.map((assignee) => ({
          userId: assignee.id,
          assignedById: user.id,
        })),
      },
      activityLogs: {
        create: {
          userId: user.id,
          action: ActivityAction.TASK_CREATED,
          description: `Task \"${input.title}\" created and assigned to ${assignees.length} team member(s)`,
        },
      },
    },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const assigneeNames = assignees.map((member) => member.name).join(", ");

  await Promise.all([
    ...assignees.map((member) =>
      createNotification(member.id, "New Task Assigned", `You have been assigned: ${task.title}`),
    ),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        taskId: task.id,
        action: ActivityAction.TASK_ASSIGNED,
        description: `Task assigned to ${assigneeNames}`,
      },
    }),
  ]);

  return task;
}

export async function updateTaskStatus(user: SessionUser, input: UpdateTaskStatusInput) {
  const task = await prisma.task.findFirst({
    where: {
      id: input.taskId,
      deletedAt: null,
      ...buildTaskScope(user),
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const isEmployeeAssignee = await prisma.taskAssignment.findFirst({
    where: {
      taskId: task.id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (user.role === "EMPLOYEE" && !isEmployeeAssignee) {
    throw new Error("Employees can update only their assigned tasks");
  }

  const updatedTask = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: input.status,
      comments: input.comment
        ? {
            create: {
              content: input.comment,
              userId: user.id,
            },
          }
        : undefined,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        taskId: task.id,
        action: ActivityAction.TASK_STATUS_UPDATED,
        description: `Task status changed to ${input.status}`,
      },
      ...(input.comment
        ? [
            {
              userId: user.id,
              taskId: task.id,
              action: ActivityAction.TASK_COMMENT_ADDED,
              description: "Task comment added",
            },
          ]
        : []),
    ],
  });

  await createNotification(task.createdById, "Task Status Updated", `${task.title} is now ${input.status}`);

  return updatedTask;
}

export async function softDeleteTask(user: SessionUser, taskId: string) {
  if (!["DEPARTMENT_LEAD", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new Error("You are not allowed to delete tasks");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
      ...buildTaskScope(user),
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const deleted = await prisma.task.update({
    where: { id: task.id },
    data: {
      deletedAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      taskId: task.id,
      action: ActivityAction.TASK_SOFT_DELETED,
      description: `Task ${task.title} soft deleted`,
    },
  });

  return deleted;
}

export async function detectOverdueTasks(companyId: string) {
  const overdueTasks = await prisma.task.findMany({
    where: {
      companyId,
      deletedAt: null,
      deadline: { lt: new Date() },
      status: { not: TaskStatusValue.DONE },
      activityLogs: {
        none: {
          action: ActivityAction.TASK_OVERDUE,
        },
      },
    },
  });

  for (const task of overdueTasks) {
    await prisma.activityLog.create({
      data: {
        userId: task.assignedToId,
        // task.assignedToId stores owner (team lead). Assignment notifications are sent to all assignees below.
        taskId: task.id,
        action: ActivityAction.TASK_OVERDUE,
        description: `Task ${task.title} is overdue`,
      },
    });

    const assignees = await prisma.taskAssignment.findMany({
      where: { taskId: task.id },
      select: { userId: true },
    });

    await Promise.all(
      assignees.map((assignee) =>
        createNotification(assignee.userId, "Task Overdue", `${task.title} is overdue. Please update progress.`),
      ),
    );
  }

  return overdueTasks.length;
}
