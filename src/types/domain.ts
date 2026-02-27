export const ROLES = ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"] as const;
export type Role = (typeof ROLES)[number];

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_WORK_TYPES = ["GENERAL", "BACKLOG", "SPRINT"] as const;
export type TaskWorkType = (typeof TASK_WORK_TYPES)[number];

export const SPRINT_TYPES = ["SPRINT", "BACKLOG"] as const;
export type SprintType = (typeof SPRINT_TYPES)[number];

export const ACTIVITY_ACTIONS = [
  "TASK_CREATED",
  "TASK_ASSIGNED",
  "TASK_STATUS_UPDATED",
  "TASK_COMMENT_ADDED",
  "TASK_SOFT_DELETED",
  "TASK_OVERDUE",
  "SPRINT_ASSIGNED",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];
