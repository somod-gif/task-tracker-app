import { z } from "zod";

export const companyCrudSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2).max(120),
  logo: z.string().url().optional().or(z.literal("")),
  address: z.string().min(3).max(255).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().min(7).max(32).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const assignSuperAdminSchema = z.object({
  userId: z.string().cuid(),
});

export const registerCompanySchema = z.object({
  companyName: z.string().min(2).max(120),
  companyEmail: z.string().email(),
  companyPhone: z.string().min(7).max(32),
  companyAddress: z.string().min(3).max(255),
  ceoName: z.string().min(2).max(120),
  ceoEmail: z.string().email(),
  website: z.string().url().optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
});
