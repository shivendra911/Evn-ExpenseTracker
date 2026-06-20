# Expense Tracker (Splitwise Alternative)

A modern, full-stack expense tracking and bill-splitting application built with **Next.js**, **React**, **Tailwind CSS**, and **MongoDB**. Designed to seamlessly manage personal finances, group trips, and complex flatmate living arrangements.

## ✨ Features

### 👥 Groups & Expense Splitting
- **Create Custom Groups**: Organize expenses by Trips, Office, Friends, or custom categories.
- **Advanced Splitting Mechanics**: Split bills equally, by exact amounts, or by custom percentages.
- **Debt Simplification**: Automatically calculates the most efficient way to settle debts between group members.
- **Settlement Tracking**: Record and verify payments between friends.

### 🏠 House & Flatmate Management
- **Dedicated House Mode**: Specially designed for roommates living together.
- **Fixed Monthly Costs**: Set up recurring rent, internet, and utility bills.
- **Monthly Closing**: Finalize the month's expenses, lock balances, and generate final settlement reports.

### 🔒 Security & User Management
- **Robust Authentication**: Secure email and password registration with OTP email verification.
- **Rate Limiting**: Built-in IP-based rate limiting to prevent brute-force attacks and credential stuffing.
- **JWT Sessions**: Secure HTTP-only cookies for session management.
- **Admin Dashboard**: A comprehensive admin panel to monitor platform usage, view user analytics, and manage groups.

### 📊 Personal Tracking
- **Personal Expenses**: Track individual spending that doesn't involve splitting.
- **Budgeting**: Set custom budgets for different expense categories.
- **Analytics**: Visualize your spending habits and financial health.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & React Query
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and npm installed.

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd expense_tracker
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following variables:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker"

# Authentication Secrets (Generate strong random strings)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup
Push the Prisma schema to your MongoDB instance:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🌐 Deployment
This project is fully configured for deployment on [Vercel](https://vercel.com).
- Ensure your Vercel project environment variables match your `.env.local`.
- The `package.json` includes a `postinstall` script to automatically generate the Prisma client during Vercel builds.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
