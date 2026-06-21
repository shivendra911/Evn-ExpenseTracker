import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.emailVerificationToken.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log(JSON.stringify(tokens.map(t => ({
    email: t.user.email,
    otp: t.token,
    expiresAt: t.expiresAt
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
