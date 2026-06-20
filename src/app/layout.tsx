import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Evn — Personal & Group Expense Tracker',
  description:
    'Track personal expenses, split group bills, and settle debts with friends. Built for flatmates, trips, and everyday shared expenses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
