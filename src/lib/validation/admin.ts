import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(80),
});

export const createCompanySchema = z.object({
  name: z.string().min(2).max(120),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  departmentId: z.string().cuid(),
});

export const createSuperAdminUserSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    role: z.enum(["ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]),
    companyId: z.string().cuid(),
    departmentId: z.string().cuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "ADMIN" && !data.departmentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required for Department Lead and Employee",
        path: ["departmentId"],
      });
    }
  });

export const promoteToTeamLeadSchema = z.object({
  userId: z.string().cuid(),
});
