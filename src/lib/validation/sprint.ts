import { z } from "zod";

import { SPRINT_TYPES } from "@/types/domain";

export const createSprintSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1200).optional(),
  type: z.enum(SPRINT_TYPES),
  departmentId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateSprintSchema = createSprintSchema.extend({
  sprintId: z.string().cuid(),
});

export const deleteSprintSchema = z.object({
  sprintId: z.string().cuid(),
});
