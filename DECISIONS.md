# DECISIONS.md — Expense Tracker

This document records product and engineering decisions made during development that weren't explicitly specified in the original design spec.

---

## Architecture

### 1. PostgreSQL → MongoDB Atlas
**Decision**: Swapped PostgreSQL for MongoDB Atlas (free M0 cluster) to enable deployment on Vercel's free tier without provisioning a separate database server.

**Impact**: Prisma composite IDs (`@@id([field1, field2])`) are not supported on MongoDB. Models like `GroupMember`, `ExpenseContributor`, and `ExpenseSplit` use a generated `@id` with a `@@unique` constraint instead.

### 2. Express → Next.js API Routes
**Decision**: Replaced the Express backend with Next.js App Router API routes (Route Handlers). Vercel cannot run a persistent Express process.

**Impact**: Express middleware patterns are replaced with wrapper/utility functions. `node-cron` is replaced with Vercel Cron Jobs.

### 3. Monorepo → Single Next.js App
**Decision**: Instead of separate `frontend/` and `backend/` directories, the app is a single Next.js project. Shared code lives in `src/shared/`.

### 4. File Storage
**Decision**: Using Vercel Blob (free tier: 256MB) for receipt uploads instead of disk storage. Vercel has no persistent filesystem.

### 5. Rate Limiting
**Decision**: In-memory rate limiting (as used with Express) doesn't work across serverless invocations. Using simple request counting stored in MongoDB for login rate limiting.

### 6. Email
**Decision**: Email (password reset) logs to console only. No real SMTP configured for MVP. Can add Resend integration later via env flag.

### 7. Recurring Expenses
**Decision**: `node-cron` replaced with Vercel Cron Jobs. A cron endpoint at `/api/cron/recurring` runs daily, secured with a `CRON_SECRET` env var.

---

## Code Conventions

### 8. Error Response Format
**Decision**: All API errors follow a standardized format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### 9. Password Hashing Cost
**Decision**: bcrypt cost factor 12. Balances security with Vercel's 10-second function timeout.

### 10. Cursor-based Pagination
**Decision**: Using cursor-based pagination with `createdAt` + `id` for deterministic ordering. Page size defaults to 20.
