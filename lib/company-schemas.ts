import { CompanyRole } from "@prisma/client";
import { z } from "zod";

export const companyRegistrationSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  password: z
    .string()
    .min(12)
    .max(72)
    .refine((value) => new TextEncoder().encode(value).length <= 72, "Password must not exceed 72 UTF-8 bytes."),
  requestedRole: z.nativeEnum(CompanyRole),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  gstin: z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? null : value),
    z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid GSTIN.")
      .nullable()
      .optional(),
  ),
}).strict();

export const adminCompanyActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("APPROVE"),
    role: z.nativeEnum(CompanyRole),
  }),
  z.object({ action: z.literal("REJECT") }),
  z.object({ action: z.literal("SUSPEND") }),
]);
