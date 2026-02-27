import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES, TASK_WORK_TYPES } from "@/types/domain";

export const createTaskSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().max(240).optional(),
  description: z.string().min(5).max(1000),
  richContent: z.string().max(8000).optional(),
  deadline: z.coerce.date(),
  priority: z.enum(TASK_PRIORITIES),
  workType: z.enum(TASK_WORK_TYPES),
  sprintName: z.string().max(80).optional(),
  labels: z.array(z.string().min(1).max(30)).max(10).optional().default([]),
  referenceLinks: z.array(z.url()).max(10).optional().default([]),
  assignedToIds: z.array(z.string().cuid()).min(1).max(20),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().cuid(),
  status: z.enum(TASK_STATUSES),
  comment: z.string().max(500).optional(),
});

export const deleteTaskSchema = z.object({
  taskId: z.string().cuid(),
});
