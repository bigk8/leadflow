import { z } from "zod";

export const leadSchema = z.object({
  first_name: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים").max(50),
  last_name:  z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים").max(50),
  email: z
    .string()
    .email("כתובת אימייל לא תקינה")
    .optional()
    .or(z.literal("")),
  phone:    z.string().max(20, "מספר טלפון ארוך מדי").optional().or(z.literal("")),
  company:  z.string().max(100).optional().or(z.literal("")),
  position: z.string().max(100).optional().or(z.literal("")),
  website:  z.string().url("כתובת אתר לא תקינה").optional().or(z.literal("")),
  status: z.enum([
    "new", "contacted", "meeting",
    "proposal", "negotiation", "closed_won", "closed_lost",
  ]).default("new"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  source:     z.string().max(100).optional().or(z.literal("")),
  deal_value: z.coerce
    .number({ invalid_type_error: "ערך עסקה חייב להיות מספר" })
    .min(0, "ערך עסקה לא יכול להיות שלילי")
    .optional()
    .nullable(),
  notes: z.string().max(2000, "הערות ארוכות מדי").optional().or(z.literal("")),
  next_follow_up_at: z.string().optional().nullable(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
