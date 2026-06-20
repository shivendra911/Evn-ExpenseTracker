import { z } from 'zod';

// ─── Shared Zod validation schemas ──────────────────────
// Used by both frontend and backend for request validation.
// Backend validates incoming requests; frontend validates forms.

// ─── Common ─────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  'FOOD', 'GROCERIES', 'UTILITIES', 'RENT', 'TRANSPORT',
  'ENTERTAINMENT', 'HEALTH', 'SHOPPING', 'TRAVEL', 'SPORTS', 'MISC',
] as const;

export const GROUP_TYPES = [
  'FLATMATES', 'TRIP', 'SPORTS', 'OFFICE', 'FAMILY', 'HOUSE', 'FRIENDS', 'OTHER',
] as const;

export const SPLIT_TYPES = ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] as const;

export const MEMBER_ROLES = ['ADMIN', 'MEMBER', 'HEAD'] as const;

export const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const;

const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);
const groupTypeSchema = z.enum(GROUP_TYPES);
const splitTypeSchema = z.enum(SPLIT_TYPES);
const memberRoleSchema = z.enum(MEMBER_ROLES);
const frequencySchema = z.enum(FREQUENCIES);

// ─── Auth Schemas ───────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

// ─── Profile Schemas ────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  upiId: z.string().max(100).optional().nullable(),
});

export const updateBudgetSchema = z.record(
  expenseCategorySchema,
  z.number().int().min(0)
);

// ─── Personal Expense Schemas ───────────────────────────

export const createPersonalExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional().nullable(),
  amountPaise: z.number().int().positive('Amount must be positive'),
  category: expenseCategorySchema,
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  groupId: z.string().optional().nullable(),
});

export const updatePersonalExpenseSchema = createPersonalExpenseSchema.partial();

export const personalExpenseFiltersSchema = z.object({
  category: expenseCategorySchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  groupId: z.string().optional(),
  search: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Group Schemas ──────────────────────────────────────

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  type: groupTypeSchema,
  description: z.string().max(500).optional().nullable(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required').max(20),
});

export const changeRoleSchema = z.object({
  role: memberRoleSchema,
});

// ─── Group Expense Schemas ──────────────────────────────

const contributorSchema = z.object({
  userId: z.string().min(1),
  amountPaise: z.number().int().positive('Contributor amount must be positive'),
});

const splitItemSchema = z.object({
  userId: z.string().min(1),
  amountPaise: z.number().int().min(0).optional(), // for EXACT
  percentage: z.number().min(0).max(100).optional(), // for PERCENTAGE
  shares: z.number().int().min(1).optional(), // for SHARES
});

export const createGroupExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional().nullable(),
  totalPaise: z.number().int().positive('Total amount must be positive'),
  category: expenseCategorySchema,
  splitType: splitTypeSchema,
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  contributors: z.array(contributorSchema).min(1, 'At least one contributor is required'),
  splits: z.array(splitItemSchema).min(1, 'At least one split member is required'),
});

export const updateGroupExpenseSchema = createGroupExpenseSchema.partial();

export const groupExpenseFiltersSchema = z.object({
  category: expenseCategorySchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  createdBy: z.string().optional(),
  splitType: splitTypeSchema.optional(),
  showDeleted: z.coerce.boolean().default(false),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Settlement Schemas ─────────────────────────────────

export const createSettlementSchema = z.object({
  fromUserId: z.string().min(1, 'Payer is required'),
  toUserId: z.string().min(1, 'Recipient is required'),
  amountPaise: z.number().int().positive('Amount must be positive'),
  note: z.string().max(500).optional().nullable(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

// ─── Recurring Expense Schemas ──────────────────────────

export const createRecurringExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  totalPaise: z.number().int().positive('Total amount must be positive'),
  category: expenseCategorySchema,
  splitType: splitTypeSchema,
  splitConfig: z.object({
    contributors: z.array(contributorSchema).min(1),
    splits: z.array(splitItemSchema).min(1),
  }),
  frequency: frequencySchema,
  nextDue: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateRecurringExpenseSchema = createRecurringExpenseSchema.partial();

// ─── Notification Schemas ───────────────────────────────

export const notificationFiltersSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Export Schemas ─────────────────────────────────────

export const exportFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// ─── Stats Schemas ──────────────────────────────────────

export const statsFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// ─── Type exports ───────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePersonalExpenseInput = z.infer<typeof createPersonalExpenseSchema>;
export type UpdatePersonalExpenseInput = z.infer<typeof updatePersonalExpenseSchema>;
export type PersonalExpenseFilters = z.infer<typeof personalExpenseFiltersSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type CreateGroupExpenseInput = z.infer<typeof createGroupExpenseSchema>;
export type UpdateGroupExpenseInput = z.infer<typeof updateGroupExpenseSchema>;
export type GroupExpenseFilters = z.infer<typeof groupExpenseFiltersSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type CreateRecurringExpenseInput = z.infer<typeof createRecurringExpenseSchema>;
export type UpdateRecurringExpenseInput = z.infer<typeof updateRecurringExpenseSchema>;
export type ExportFilters = z.infer<typeof exportFiltersSchema>;
export type StatsFilters = z.infer<typeof statsFiltersSchema>;
