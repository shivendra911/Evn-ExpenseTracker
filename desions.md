
# AGENT PROMPT — Personal + Group Expense Tracker

## WHO YOU ARE

You are a senior full-stack engineer. You write complete, working code. You do not leave TODOs, stubs, or placeholder comments like "// implement later". If a feature is listed, it is built and it works before you move on.

When you make a product decision that the spec leaves open, you write it down in `DECISIONS.md` at the project root. You ask a question only if something is genuinely ambiguous and the wrong choice would require a rewrite.

---

## WHAT YOU ARE BUILDING

A personal and group expense tracker. Two modes, one app, one account.

**Personal mode** — a user can log and track their own expenses completely independently. No group required. This is a standalone feature, not a stripped-down version of group mode. Someone who never joins a group should find the app fully useful.

**Group mode** — a user can create named groups (Flatmates, Goa Trip, Cricket Club, Office Lunch, etc.) and add people to them. Each group has its own expense ledger, shared balances, and settlement flow. A user can belong to multiple groups simultaneously.

**The link between them** — a personal expense can optionally be tagged to a group context, but this is optional. Group expenses live inside the group. The personal dashboard gives a unified view across both: your own spending plus your net position across all your groups.

The core mechanic for group expenses: for any expense, who paid and who owes are two separate questions and the answer to each does not have to include everyone in the group. Example — five flatmates, Ravi buys rice ₹500. Only Ravi, Arjun, and Priya eat rice. Karan and Sameer owe nothing for this expense. Ravi paid ₹500, so Arjun and Priya each owe him ₹167 (with ₹1 remainder going to the first person in the split). The app must show this breakdown clearly.

---

## TECH STACK

Use this stack exactly. Do not substitute.

- **Frontend**: React 18 + TypeScript + React Router v6 + TailwindCSS
- **State**: Zustand (global auth/user state), React Query (server state, all API calls)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT — access token (15 min, in memory) + refresh token (7 days, httpOnly cookie)
- **Validation**: Zod — define schemas once, share between frontend and backend via a `/shared` package
- **File storage**: multer → disk storage locally; swap to S3 later via env flag
- **Background jobs**: node-cron
- **Email**: nodemailer (logs to console in dev, real SMTP in prod via env)
- **Testing**: Vitest + Supertest
- **Dev environment**: docker-compose (postgres + app)

No UI component libraries. Build components from scratch with Tailwind. No Shadcn, no Radix, no MUI.

---

## DATA MODEL

Implement this schema in Prisma exactly. Do not add fields not listed here without documenting the reason in DECISIONS.md.

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  avatarUrl    String?
  upiId        String?
  createdAt    DateTime @default(now())

  personalExpenses  PersonalExpense[]
  groupMemberships  GroupMember[]
  expensesPaid      ExpenseContributor[]
  expenseSplits     ExpenseSplit[]
  settlementsFrom   Settlement[]  @relation("SettlementFrom")
  settlementsTo     Settlement[]  @relation("SettlementTo")
  notifications     Notification[]
  auditLogs         AuditLog[]
  refreshTokens     RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model PersonalExpense {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  amountPaise Int      // stored in paise (1 INR = 100 paise)
  category    ExpenseCategory
  date        DateTime
  receiptUrl  String?
  tags        String[] // free-form tags
  groupId     String?  // optional: link to a group for context only
  group       Group?   @relation(fields: [groupId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Group {
  id          String   @id @default(cuid())
  name        String
  type        GroupType
  description String?
  currency    String   @default("INR")
  inviteCode  String   @unique
  createdById String
  createdAt   DateTime @default(now())

  members            GroupMember[]
  expenses           GroupExpense[]
  settlements        Settlement[]
  recurringExpenses  RecurringExpense[]
  personalExpenses   PersonalExpense[]  // personal expenses tagged to this group
}

enum GroupType {
  FLATMATES
  TRIP
  SPORTS
  OFFICE
  FAMILY
  OTHER
}

model GroupMember {
  groupId  String
  userId   String
  group    Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role     MemberRole @default(MEMBER)
  joinedAt DateTime   @default(now())

  @@id([groupId, userId])
}

enum MemberRole {
  ADMIN
  MEMBER
}

model GroupExpense {
  id          String      @id @default(cuid())
  groupId     String
  group       Group       @relation(fields: [groupId], references: [id], onDelete: Cascade)
  title       String
  description String?
  totalPaise  Int
  category    ExpenseCategory
  splitType   SplitType
  date        DateTime
  receiptUrl  String?
  createdById String
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contributors ExpenseContributor[]
  splits       ExpenseSplit[]
}

enum SplitType {
  EQUAL
  EXACT
  PERCENTAGE
  SHARES
}

model ExpenseContributor {
  expenseId   String
  userId      String
  expense     GroupExpense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id])
  amountPaise Int

  @@id([expenseId, userId])
}

model ExpenseSplit {
  expenseId   String
  userId      String
  expense     GroupExpense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id])
  amountPaise Int
  percentage  Float?
  shares      Int?

  @@id([expenseId, userId])
}

model Settlement {
  id          String   @id @default(cuid())
  groupId     String
  group       Group    @relation(fields: [groupId], references: [id])
  fromUserId  String
  toUserId    String
  fromUser    User     @relation("SettlementFrom", fields: [fromUserId], references: [id])
  toUser      User     @relation("SettlementTo", fields: [toUserId], references: [id])
  amountPaise Int
  note        String?
  date        DateTime
  createdAt   DateTime @default(now())
}

model RecurringExpense {
  id          String    @id @default(cuid())
  groupId     String
  group       Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  title       String
  totalPaise  Int
  category    ExpenseCategory
  splitType   SplitType
  splitConfig Json      // stores contributors and splits config
  frequency   Frequency
  nextDue     DateTime
  isActive    Boolean   @default(true)
  createdById String
  createdAt   DateTime  @default(now())
}

enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
}

model Notification {
  id               String           @id @default(cuid())
  userId           String
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type             NotificationType
  message          String
  isRead           Boolean          @default(false)
  relatedGroupId   String?
  relatedExpenseId String?
  createdAt        DateTime         @default(now())
}

enum NotificationType {
  EXPENSE_ADDED
  EXPENSE_EDITED
  EXPENSE_DELETED
  SETTLEMENT_RECORDED
  MEMBER_JOINED
  MEMBER_REMOVED
  RECURRING_GENERATED
  GROUP_INVITE
}

model AuditLog {
  id        String   @id @default(cuid())
  groupId   String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  metadata  Json
  createdAt DateTime @default(now())
}

enum ExpenseCategory {
  FOOD
  GROCERIES
  UTILITIES
  RENT
  TRANSPORT
  ENTERTAINMENT
  HEALTH
  SHOPPING
  TRAVEL
  SPORTS
  MISC
}
```

---

## BACKEND — ALL ENDPOINTS

### Auth  `/api/auth`
```
POST /register        — name, email, password, confirmPassword
POST /login           — email, password → access token + set refresh cookie
POST /refresh         — reads httpOnly cookie → new access token + rotated refresh cookie
POST /logout          — clears refresh cookie, deletes token from DB
POST /forgot-password — email → generates reset token, logs link to console in dev
POST /reset-password  — token, newPassword
```

### Personal Expenses  `/api/personal`  (auth required)
```
GET    /             — list with filters: category, dateFrom, dateTo, tags, groupId, search, page, limit
POST   /             — create
GET    /:id          — single
PUT    /:id          — update (owner only)
DELETE /:id          — delete (owner only)
GET    /stats/summary — totals by category, totals by month, for a given date range
```

### Groups  `/api/groups`  (auth required)
```
GET    /             — list groups the user belongs to
POST   /             — create group (creator becomes ADMIN)
GET    /:id          — group details + members
PUT    /:id          — update name/type/description (ADMIN only)
DELETE /:id          — delete group (ADMIN only, must have no unsettled balances)
POST   /:id/join     — join by inviteCode
POST   /:id/leave    — leave (not if sole ADMIN)
POST   /:id/invite/regenerate — regenerate invite code (ADMIN only)
GET    /:id/members  — list members
PUT    /:id/members/:userId/role — change role (ADMIN only)
DELETE /:id/members/:userId     — remove member (ADMIN only, no unsettled balance)
```

### Group Expenses  `/api/groups/:groupId/expenses`  (auth + group member required)
```
GET    /             — list with filters: category, dateFrom, dateTo, createdBy, splitType, isDeleted=false, page, limit
POST   /             — create expense with contributors and splits
GET    /:id          — expense detail with full contributor and split breakdown
PUT    /:id          — edit (creator or ADMIN; logs to AuditLog)
DELETE /:id          — soft delete (creator or ADMIN; logs to AuditLog)
GET    /:id/receipt  — serve receipt file
POST   /:id/receipt  — upload receipt (multipart)
```

### Balances  `/api/groups/:groupId/balances`  (auth + member)
```
GET    /         — net balance for every member + pairwise debts + simplified settlement plan
GET    /history  — all settlements for the group
```

### Settlements  `/api/groups/:groupId/settlements`  (auth + member)
```
POST   /    — record a settlement (fromUserId, toUserId, amount, note, date)
DELETE /:id — delete a settlement (within 24h of creation, creator or ADMIN only)
```

### Recurring Expenses  `/api/groups/:groupId/recurring`  (auth + member)
```
GET    /        — list
POST   /        — create
PUT    /:id     — edit (ADMIN or creator)
PATCH  /:id/toggle — pause/resume
DELETE /:id     — delete
```

### Notifications  `/api/notifications`  (auth)
```
GET    /           — list (newest first, paginated)
PATCH  /:id/read   — mark one as read
PATCH  /read-all   — mark all as read
```

### Profile  `/api/profile`  (auth)
```
GET    /               — current user
PUT    /               — update name, upiId
POST   /avatar         — upload avatar (multipart)
PUT    /password       — change password (requires currentPassword)
DELETE /               — delete account (anonymize, do not cascade group history)
```

### Export  `/api/groups/:groupId/export`  (auth + member)
```
GET /csv   — all expenses as CSV (filterable by date range)
GET /pdf   — monthly summary PDF: total spent, by category, member balances, settlement plan
```

```
GET /api/personal/export/csv  — personal expenses as CSV
```

---

## BALANCE ENGINE

Build this as a pure service function with no database or HTTP dependencies: `src/services/balanceEngine.ts`.

```typescript
// Input: all non-deleted GroupExpenses with their contributors and splits,
//        plus all Settlements for the group
// Output:
//   memberBalances: { userId, netPaise }[]       — positive = owed to them, negative = they owe
//   pairwiseDebts:  { fromId, toId, amountPaise }[]  — raw before simplification
//   settledPlan:    { fromId, toId, amountPaise }[]  — minimum transactions to clear all debts
```

The debt simplification algorithm: compute each person's net position. Repeatedly pair the largest creditor with the largest debtor, settle the smaller of the two amounts, and repeat until all balances are zero. This produces the minimum number of transactions.

**Money rules — non-negotiable:**
- All amounts are stored and computed in paise (integers). 1 INR = 100 paise.
- Never perform arithmetic on floating point rupee values.
- When dividing equally among N people and `total % N !== 0`, give the 1-paise remainder to the first person in the split array.
- All currency display: divide by 100, format with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

Write unit tests for this module first, before writing the API routes that call it. Test cases must include:
- 2-person equal split, indivisible total
- 3-person percentage split (33/33/34)
- multi-payer expense where payer is also in the split
- debt simplification with 4 people and circular debts
- group with no expenses (zero balances)
- group with a settlement partially clearing a debt

---

## SPLIT TYPES — EXACT RULES

When creating or editing a group expense, the request body must include `contributors[]` (who paid and how much) and `splits[]` (who owes).

**Validation on every expense write:**
1. `sum(contributors.amountPaise)` must equal `expense.totalPaise` (exact)
2. For EQUAL: `splits` lists only the members who are included; server computes each person's share with remainder to first
3. For EXACT: `sum(splits.amountPaise)` must equal `expense.totalPaise` (exact)
4. For PERCENTAGE: `sum(splits.percentage)` must equal 100 (±0.01 tolerance); server computes paise from percentage, adjusts remainder
5. For SHARES: server computes each person's share as `floor(total * theirShares / totalShares)`, remainder to first
6. A user CAN appear in both contributors and splits (paid and also owes their share)
7. All contributor userIds and split userIds must be members of the group

Return a 422 with a specific error message if any validation fails. Do not return a generic "invalid request".

---

## FEATURES — PERSONAL MODE

The personal expense tracker must work completely without any group context.

- Log an expense: title, amount, category, date, description (optional), tags (optional), receipt photo (optional), optionally link to one of your groups (for reference only — does not affect group balances)
- Edit and delete own expenses
- Filter by: category, date range, tags, linked group, free text search on title/description
- Stats page: spending by category (bar chart), spending by month (line chart), running total this month vs budget (if budget is set)
- Set a monthly budget per category (stored in user profile as JSON)
- When a category exceeds 80% of its budget, show a warning
- Export personal expenses to CSV

---

## FEATURES — GROUP MODE

### Groups
- Create a group: name, type (Flatmates / Trip / Sports / Office / Family / Other), optional description
- On creation, generate a unique 8-character alphanumeric invite code (case-insensitive when joining)
- Share invite code or a pre-filled join link `/join/:code`
- Admin can regenerate the invite code (old code stops working immediately)
- Admin can rename, change type, or update description
- Admin can remove members only if they have zero unsettled balance
- Admin can change another member's role
- Last admin cannot leave or be removed — must promote another member first
- A member can leave if their balance is zero; otherwise must settle first

### Expenses
- Add expense: title, description, category, date, total amount, receipt upload, who paid (one or multiple with exact amounts), who owes + split type
- UI shows a live split preview panel that updates as the user changes contributors or split selections — before submitting, the user sees the exact paise each person owes
- Edit expense: same form pre-filled; change is logged to AuditLog with before/after snapshot
- Soft delete: expense is hidden from default list view but preserved in history with `isDeleted: true`; balances are recalculated
- Filter expense list: date range, category, who paid, who owes (member filter), split type, show/hide deleted
- Pagination: 20 per page, cursor-based

### Balances
- Balances page shows: each member's net balance (what they're owed or owe in total), a pairwise breakdown, and the simplified settlement plan ("Ravi pays Arjun ₹350")
- Balances recalculate on every expense add/edit/delete/settlement — no caching that goes stale
- "Settle up" button pre-fills the settlement form with the suggested amount

### Settlements
- Record a settlement: who paid, who received, amount, optional note, date
- The settlement reduces the balance between those two people
- Settlement can be deleted within 24 hours by creator or group admin
- Settlement history is visible on the balances page

### Recurring Expenses
- Create with same fields as a regular expense plus frequency (daily, weekly, monthly) and start date
- node-cron job runs daily at midnight, checks `nextDue <= today`, creates the expense, advances `nextDue` by the frequency, sends notifications
- Admin or creator can edit, pause (isActive = false), resume, or delete
- Paused recurring expenses do not generate new expenses

### Notifications
- Bell icon in header with unread count badge
- Events that generate a notification: expense added (all split members), expense edited (all involved), expense deleted (all involved), settlement recorded (both parties), member joined or removed (all members), recurring expense generated (all split members)
- Click a notification to navigate to the relevant expense or group
- Mark one or all as read

---

## UI DESIGN — HOW IT SHOULD LOOK

The app is used by students and young adults on their phones and laptops. It should look like something a thoughtful developer built for real use, not a template or a design exercise.

**Do not use:**
- Gradient hero banners
- Frosted glass cards
- Animated number counters on load
- Dark purple or electric blue "AI-feeling" color schemes
- Excessive border-radius (no pill-shaped cards)
- Decorative icons on every list item
- Auto-playing transitions between screens

**Design direction:**
- Light background, not dark. Off-white `#F9F9F8`, not pure white.
- Primary text `#1A1A1A`. Secondary text `#6B7280`. Borders `#E5E5E5`.
- One accent color: a clean blue `#2563EB`. Used only on primary actions and links.
- Positive balance (you are owed): `#16A34A` (green). Negative (you owe): `#DC2626` (red). Zero: `#9CA3AF`.
- Font: System font stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. No Google Fonts imports.
- Money values: `font-variant-numeric: tabular-nums`, right-aligned in tables, always 2 decimal places.
- Spacing: consistent 4px base unit. Not tight, not spacious. Looks like a real app.
- Mobile-first. Sidebar on desktop, bottom nav on mobile.

**Key pages:**
- `/` — redirects to `/dashboard`
- `/login`, `/register`, `/forgot-password`, `/reset-password/:token`
- `/dashboard` — personal summary (total this month, category bars, recent entries) + cross-group balance summary (each group you're in, your net position)
- `/personal` — personal expense list + add button
- `/personal/stats` — charts
- `/groups` — list of your groups
- `/groups/new` — create group form
- `/join/:code` — join by invite code (auto-fills code)
- `/groups/:id` — group home: recent expenses + balance cards
- `/groups/:id/expenses` — full expense list with filters
- `/groups/:id/expenses/new` — multi-step add expense form
- `/groups/:id/expenses/:expenseId` — expense detail with full split breakdown
- `/groups/:id/balances` — balance summary + settlement plan + history
- `/groups/:id/recurring` — recurring expenses list
- `/groups/:id/settings` — group settings (admin only)
- `/profile` — profile and settings
- `/notifications` — full notification list

**Multi-step expense form:**
Step 1: Title, category, date, total amount, description, receipt upload
Step 2: Who paid — checkboxes for group members, amount field per selected person, validation that amounts sum to total, auto-fill single payer with full amount
Step 3: Who owes — select split type, select members, input per member depending on type, live preview panel on the right (or below on mobile) showing each person's computed share
Step 4: Summary — read-only preview of everything, confirm button

Live preview in Step 3 must update on every keystroke without submitting. If validation fails (amounts don't sum), show inline error with the difference amount, not just "invalid".

---

## SECURITY — IMPLEMENT ALL OF THESE

**API layer:**
- Every route except `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/forgot-password`, `/api/auth/reset-password`, and `/join/:code` (frontend only) requires a valid access token in the `Authorization: Bearer` header
- Middleware `requireGroupMember` on all `/api/groups/:groupId/*` routes — verifies the authenticated user is a member of the specified group before any handler runs
- Middleware `requireGroupAdmin` on routes that require admin role
- Prisma parameterized queries everywhere — no raw SQL with string interpolation
- Zod validation on every request body and query params — reject unknown fields
- Helmet.js — all default headers
- CORS: allow only the frontend origin from env var `FRONTEND_URL`
- express-rate-limit: 5 req/15min on `/api/auth/login`, 100 req/15min on all other routes
- File uploads: validate MIME type server-side using the `file-type` npm package (not the extension), max 5MB, accepted types: `image/jpeg`, `image/png`, `image/webp`
- Refresh token rotation: every `/refresh` call issues a new refresh token and deletes the old one. If a refresh token is replayed after rotation, delete all refresh tokens for that user (token theft detection)
- Password reset tokens: 32-byte random hex, hashed with SHA-256 in the DB, expire in 1 hour, single-use

**Business logic guards:**
- Payer amounts must sum exactly to expense total — return 422 with `{ error: "Contributor amounts sum to X, expected Y" }`
- Split amounts must sum exactly to expense total — return 422 with `{ error: "Split amounts sum to X, expected Y" }`
- All contributor and split user IDs must be members of the group
- Settlement amount must be positive integer (paise) and not exceed the outstanding pairwise balance
- Cannot record a settlement with yourself
- Cannot remove a member with unsettled balance — return 409 with `{ error: "User has unsettled balance of ₹X" }`
- Last admin cannot leave or be removed — return 409 with `{ error: "Cannot remove the only admin" }`

**Frontend:**
- Access token stored in Zustand store (in memory), never in localStorage or sessionStorage
- Refresh token in httpOnly cookie — never touched by JavaScript
- On 401 response: automatically call `/refresh`, retry the original request once, then redirect to `/login` if refresh fails
- React Router `<PrivateRoute>` wrapper on all authenticated pages
- No `dangerouslySetInnerHTML` anywhere

---

## BUG PREVENTION — HANDLE ALL OF THESE

**Money arithmetic:**
- All amounts in the database and in all service functions are integers in paise
- Never use `parseFloat` or `toFixed` for computation — only for display
- When computing equal splits: `perPersonPaise = Math.floor(totalPaise / n)`, remainder goes to `splits[0].amountPaise += totalPaise - perPersonPaise * n`
- When computing percentage splits: `splitPaise = Math.floor(totalPaise * percentage / 100)`, remainder to first

**Edge cases the code must handle without crashing:**
- A group with one member (no splits possible — creating an expense with splits must require at least 2 members, or disallow splits for the single member to themselves)
- An expense where all contributors are also in the split (common case — person pays and owes their share)
- An expense where one person paid the full amount but only others owe (person treated the group)
- Concurrent expense creation (Prisma transaction + DB constraints prevent duplicate paise errors)
- A recurring expense whose `splitConfig` references a user who has since left the group — skip that user in the generated expense and log a warning
- Empty expense list — show an instructional empty state, never a crashed component
- Zero balance group — settlement plan shows "All settled up" not an empty list
- Pagination cursor past the last page — return empty array, not an error
- Deleting an expense recalculates all balances — this must be a synchronous result of the delete, not an eventual consistency issue
- Receipt upload fails — expense is still saved, receipt is null, no 500 error

**Testing:**
- Unit test the balance engine with the test cases listed above
- Integration test (Supertest): full expense lifecycle — create group, add members, add multi-payer selective split expense, verify balances, record settlement, verify updated balances, delete expense, verify balances revert
- Integration test: refresh token rotation — use token, rotate, replay old token, verify all tokens for user are revoked
- Integration test: percentage split where percentages sum to 99.99% — verify it is rejected
- Run tests before each push with `npm test`

---

## FOLDER STRUCTURE

```
/
├── DECISIONS.md
├── docker-compose.yml
├── shared/
│   └── src/
│       ├── types.ts        # shared TypeScript types (User, Group, Expense, etc.)
│       └── validation.ts   # Zod schemas used by both frontend and backend
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── personal.ts
│   │   │   ├── groups.ts
│   │   │   ├── groupExpenses.ts
│   │   │   ├── balances.ts
│   │   │   ├── settlements.ts
│   │   │   ├── recurring.ts
│   │   │   ├── notifications.ts
│   │   │   ├── profile.ts
│   │   │   └── export.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts           # verifyToken
│   │   │   ├── requireMember.ts  # verifyGroupMember
│   │   │   ├── requireAdmin.ts   # verifyGroupAdmin
│   │   │   ├── validate.ts       # Zod request validation
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── balanceEngine.ts  # pure functions, no DB, unit-tested
│   │   │   ├── debtSimplifier.ts # minimum-transaction algorithm
│   │   │   ├── splitComputer.ts  # computes paise per person for each SplitType
│   │   │   ├── recurringJob.ts   # node-cron job
│   │   │   ├── emailer.ts        # nodemailer wrapper
│   │   │   └── fileStorage.ts    # multer config + MIME validation
│   │   ├── lib/
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   ├── money.ts          # paise↔rupee helpers
│   │   │   └── tokens.ts         # JWT sign/verify, refresh token helpers
│   │   └── tests/
│   │       ├── balanceEngine.test.ts
│   │       ├── splitComputer.test.ts
│   │       └── integration/
│   │           ├── expenseLifecycle.test.ts
│   │           └── authTokenRotation.test.ts
│   └── prisma/
│       └── schema.prisma
└── frontend/
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── routes/           # route-level page components
        ├── components/
        │   ├── layout/       # AppShell, Sidebar, BottomNav, Header
        │   ├── expense/      # ExpenseForm, ExpenseCard, SplitPreview, ExpenseDetail
        │   ├── group/        # GroupCard, MemberList, InviteModal
        │   ├── balance/      # BalanceCard, SettlementPlan, SettleUpForm
        │   ├── personal/     # PersonalExpenseForm, PersonalExpenseList, StatsCharts
        │   └── ui/           # Button, Input, Select, Modal, Toast, Skeleton, EmptyState
        ├── store/
        │   └── auth.ts       # Zustand: user, accessToken, setAuth, clearAuth
        ├── hooks/
        │   ├── useExpenses.ts
        │   ├── useBalances.ts
        │   ├── useGroup.ts
        │   └── usePersonal.ts
        ├── api/
        │   ├── client.ts     # axios instance with interceptors (refresh on 401)
        │   └── endpoints/    # typed API functions per resource
        └── lib/
            ├── money.ts      # formatCurrency, paiseToCurrency
            └── dates.ts      # format helpers
```

---

## BUILD ORDER

Follow this sequence. Do not start a step until the previous step's tests pass and the feature is usable end-to-end.

**Step 1 — Foundation**
Prisma schema, migrations, docker-compose with Postgres, Express app skeleton, Zod shared schemas, folder structure.

**Step 2 — Auth**
Register, login, JWT, refresh with rotation, logout, forgot/reset password. Rate limiting on login. Write the token rotation integration test.

**Step 3 — Personal Expenses**
Full CRUD, filters, stats endpoint, export CSV. No group context yet.

**Step 4 — Groups**
Create, join by invite, list, settings, member management. All admin guards.

**Step 5 — Balance Engine**
Write `balanceEngine.ts` and `splitComputer.ts` with full unit tests. Do not build the API route yet — just the pure functions. All test cases must pass.

**Step 6 — Group Expenses (equal split only)**
Create expense with equal split, multi-payer support, contributor/split validation, edit, soft delete, receipt upload. Verify balances update correctly.

**Step 7 — All Split Types**
Exact, percentage, shares split logic. Add to splitComputer, cover in unit tests, add to the form's Step 3 UI with live preview.

**Step 8 — Settlements**
Record, delete, history. Verify balance recalculation.

**Step 9 — Recurring Expenses**
Create, edit, pause, node-cron job, test by advancing nextDue manually.

**Step 10 — Notifications**
Create notification on each trigger event. Bell + list UI.

**Step 11 — Export**
CSV for personal and group. PDF monthly summary (use pdfkit, no browser printing).

**Step 12 — Profile & Settings**
Update profile, avatar, password change, UPI ID, account deletion.

**Step 13 — Personal Mode Polish**
Budget per category, over-budget warning, stats charts (Recharts — the one library exception, for charts only).

**Step 14 — Dashboard**
Cross-group balance summary, personal month total, recent activity.

**Step 15 — Security Hardening Pass**
Audit every route for missing auth middleware, missing group membership check, missing Zod validation. Run the full test suite.

**Step 16 — Bug Prevention Pass**
Walk through every edge case listed above. Fix any that aren't handled. Confirm empty states render. Confirm mobile layout works.

---

## DELIVERABLE

A running application where the following workflow completes without errors:

1. Register two users (Ravi and Arjun) and a third (Priya)
2. Ravi creates a group "Flat 4B" of type FLATMATES
3. Arjun and Priya join using the invite code
4. Ravi adds an expense: "Rice ₹500", pays full amount himself, only Ravi and Arjun eat rice (Priya is excluded)
5. The expense detail shows: Ravi paid ₹500, Ravi owes ₹250, Arjun owes ₹250
6. The balances page shows: Arjun owes Ravi ₹250, Priya owes nobody
7. Arjun records a settlement of ₹250 to Ravi
8. Balances page shows all settled up
9. Ravi logs a personal expense (not in any group): "Coffee ₹80, Food category"
10. Personal stats page shows ₹80 in Food for the current month
11. Export the group's expenses to CSV and PDF — both download correctly
