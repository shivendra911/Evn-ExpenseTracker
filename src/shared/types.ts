// ─── Shared TypeScript types ────────────────────────────
// Used by both frontend and backend.
// These mirror the Prisma models but as plain interfaces
// for API responses and client-side usage.

export type ExpenseCategory =
  | 'FOOD'
  | 'GROCERIES'
  | 'UTILITIES'
  | 'RENT'
  | 'TRANSPORT'
  | 'ENTERTAINMENT'
  | 'HEALTH'
  | 'SHOPPING'
  | 'TRAVEL'
  | 'SPORTS'
  | 'MISC';

export type GroupType =
  | 'FLATMATES'
  | 'TRIP'
  | 'SPORTS'
  | 'OFFICE'
  | 'FAMILY'
  | 'HOUSE'
  | 'FRIENDS'
  | 'OTHER';

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

export type MemberRole = 'ADMIN' | 'MEMBER' | 'HEAD';

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type NotificationType =
  | 'EXPENSE_ADDED'
  | 'EXPENSE_EDITED'
  | 'EXPENSE_DELETED'
  | 'SETTLEMENT_RECORDED'
  | 'SETTLEMENT_ACCEPTED'
  | 'SETTLEMENT_DISPUTED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REMOVED'
  | 'RECURRING_GENERATED'
  | 'GROUP_INVITE'
  | 'HOUSE_EXPENSE_ADDED'
  | 'MONTH_FINALIZED';

// ─── User ───────────────────────────────────────────────

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  upiId: string | null;
  isAdmin?: boolean;
  createdAt: string;
}

export interface UserProfile extends UserPublic {
  budgets: Record<ExpenseCategory, number> | null;
}

// ─── Personal Expense ───────────────────────────────────

export interface PersonalExpenseResponse {
  id: string;
  title: string;
  description: string | null;
  amountPaise: number;
  category: ExpenseCategory;
  date: string;
  receiptUrl: string | null;
  tags: string[];
  groupId: string | null;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Group ──────────────────────────────────────────────

export interface GroupResponse {
  id: string;
  name: string;
  type: GroupType;
  description: string | null;
  currency: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  memberCount: number;
  myRole: MemberRole;
}

export interface GroupDetailResponse extends GroupResponse {
  members: GroupMemberResponse[];
}

export interface GroupMemberResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: MemberRole;
  joinedAt: string;
}

// ─── Group Expense ──────────────────────────────────────

export interface ContributorResponse {
  userId: string;
  name: string;
  amountPaise: number;
}

export interface SplitResponse {
  userId: string;
  name: string;
  amountPaise: number;
  percentage?: number;
  shares?: number;
}

export interface GroupExpenseResponse {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  totalPaise: number;
  category: ExpenseCategory;
  splitType: SplitType;
  date: string;
  receiptUrl: string | null;
  createdById: string;
  createdByName: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  contributors: ContributorResponse[];
  splits: SplitResponse[];
}

// ─── Balances ───────────────────────────────────────────

export interface MemberBalance {
  userId: string;
  name: string;
  netPaise: number; // positive = owed to them, negative = they owe
}

export interface PairwiseDebt {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountPaise: number;
}

export interface BalanceResponse {
  memberBalances: MemberBalance[];
  pairwiseDebts: PairwiseDebt[];
  settledPlan: PairwiseDebt[];
}

// ─── Settlement ─────────────────────────────────────────

export interface SettlementResponse {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amountPaise: number;
  note: string | null;
  date: string;
  createdAt: string;
}

// ─── Recurring Expense ──────────────────────────────────

export interface RecurringExpenseResponse {
  id: string;
  groupId: string;
  title: string;
  totalPaise: number;
  category: ExpenseCategory;
  splitType: SplitType;
  frequency: Frequency;
  nextDue: string;
  isActive: boolean;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

// ─── Notification ───────────────────────────────────────

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  relatedGroupId: string | null;
  relatedExpenseId: string | null;
  createdAt: string;
}

// ─── Stats ──────────────────────────────────────────────

export interface CategoryTotal {
  category: ExpenseCategory;
  totalPaise: number;
  count: number;
}

export interface MonthlyTotal {
  year: number;
  month: number;
  totalPaise: number;
}

export interface PersonalStatsResponse {
  categoryTotals: CategoryTotal[];
  monthlyTotals: MonthlyTotal[];
  currentMonthTotal: number;
  budgets: Record<ExpenseCategory, number> | null;
}

// ─── API Response Wrapper ───────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ─────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

// ─── Input Types ────────────────────────────────────────

export interface CreatePersonalExpenseInput {
  title: string;
  description?: string | null;
  amountPaise: number;
  category: ExpenseCategory;
  date: string;
  tags?: string[];
  groupId?: string | null;
}

export interface UpdatePersonalExpenseInput extends Partial<CreatePersonalExpenseInput> {}

export interface PersonalExpenseFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string;
  groupId?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateGroupInput {
  name: string;
  type: GroupType;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  type?: GroupType;
  description?: string;
}

export interface JoinGroupInput {
  inviteCode: string;
}

export interface CreateGroupExpenseInput {
  title: string;
  description?: string | null;
  totalPaise: number;
  category: ExpenseCategory;
  splitType: SplitType;
  date: string;
  contributors: { userId: string; amountPaise: number }[];
  splits: { userId: string; amountPaise?: number; percentage?: number; shares?: number }[];
}

export interface CreateSettlementInput {
  fromUserId: string;
  toUserId: string;
  amountPaise: number;
  note?: string;
  date: string;
}

export interface GroupBalancesResponse {
  balances: {
    user: { id: string; name: string; avatarUrl: string | null };
    balancePaise: number;
  }[];
  settlementPlan: {
    fromUser: { id: string; name: string; avatarUrl: string | null };
    toUser: { id: string; name: string; avatarUrl: string | null };
    amountPaise: number;
  }[];
}
