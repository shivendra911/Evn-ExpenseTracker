import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting test data seed...');

  // 1. Find Shivendra
  let shiv = await prisma.user.findUnique({
    where: { email: 'shiv@test.com' }
  });

  if (!shiv) {
    const { hash } = await import('bcryptjs');
    const hashedPassword = await hash('password123', 10);
    shiv = await prisma.user.create({
      data: {
        email: 'shiv@test.com',
        name: 'Shivendra',
        passwordHash: hashedPassword
      }
    });
    console.log('👤 Created missing user: shiv@test.com (password: password123)');
  }
  console.log(`✅ Found Shivendra (${shiv.id})`);

  // 2. Create 3 new users
  const usersToCreate = [
    { name: 'John Doe', email: 'john@test.com', passwordHash: 'hashedpassword' },
    { name: 'Emma Smith', email: 'emma@test.com', passwordHash: 'hashedpassword' },
    { name: 'Liam Neeson', email: 'liam@test.com', passwordHash: 'hashedpassword' },
  ];

  const createdUsers = [];
  for (const u of usersToCreate) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      createdUsers.push(existing);
    } else {
      const created = await prisma.user.create({ data: u });
      createdUsers.push(created);
    }
  }
  console.log('✅ Created 3 test users: John, Emma, Liam');

  const [john, emma, liam] = createdUsers;

  // 3. Create a Group
  const group = await prisma.group.create({
    data: {
      name: 'Goa Trip 2026',
      description: 'Expenses for our summer trip',
      type: 'TRIP',
      currency: 'INR',
      inviteCode: 'GOA2026X',
      createdById: shiv.id,
      members: {
        create: [
          { userId: shiv.id, role: 'ADMIN' },
          { userId: john.id, role: 'MEMBER' },
          { userId: emma.id, role: 'MEMBER' },
          { userId: liam.id, role: 'MEMBER' },
        ]
      }
    }
  });
  console.log(`✅ Created Group: Goa Trip 2026 (${group.id})`);

  // 4. Create Group Expenses
  
  // Expense 1: Shiv paid 2000 for Dinner, split equally (500 each)
  await prisma.groupExpense.create({
    data: {
      groupId: group.id,
      title: 'Dinner at Beach Shack',
      totalPaise: 200000, // ₹2000
      splitType: 'EQUAL',
      category: 'FOOD',
      createdById: shiv.id,
      contributors: { create: [{ userId: shiv.id, amountPaise: 200000 }] },
      date: new Date(),
      splits: {
        create: [
          { userId: shiv.id, amountPaise: 50000 },
          { userId: john.id, amountPaise: 50000 },
          { userId: emma.id, amountPaise: 50000 },
          { userId: liam.id, amountPaise: 50000 },
        ]
      }
    }
  });
  console.log('✅ Added Expense: Dinner (Shiv paid ₹2000)');

  // Expense 2: Emma paid 1500 for Taxi, split between Emma, Shiv, and John (500 each)
  await prisma.groupExpense.create({
    data: {
      groupId: group.id,
      title: 'Airport Taxi',
      totalPaise: 150000, // ₹1500
      splitType: 'EQUAL',
      category: 'TRANSPORT',
      createdById: shiv.id,
      contributors: { create: [{ userId: emma.id, amountPaise: 150000 }] },
      date: new Date(),
      splits: {
        create: [
          { userId: emma.id, amountPaise: 50000 },
          { userId: shiv.id, amountPaise: 50000 },
          { userId: john.id, amountPaise: 50000 },
        ]
      }
    }
  });
  console.log('✅ Added Expense: Taxi (Emma paid ₹1500)');

  // Expense 3: Liam paid 4000 for Hotel Booking, split equally
  await prisma.groupExpense.create({
    data: {
      groupId: group.id,
      title: 'Hotel Advance',
      totalPaise: 400000, // ₹4000
      splitType: 'EQUAL',
      category: 'TRAVEL',
      createdById: shiv.id,
      contributors: { create: [{ userId: liam.id, amountPaise: 400000 }] },
      date: new Date(),
      splits: {
        create: [
          { userId: shiv.id, amountPaise: 100000 },
          { userId: john.id, amountPaise: 100000 },
          { userId: emma.id, amountPaise: 100000 },
          { userId: liam.id, amountPaise: 100000 },
        ]
      }
    }
  });
  console.log('✅ Added Expense: Hotel (Liam paid ₹4000)');

  // Expense 4: John borrowed 500 cash from Shivendra (Unequal split)
  await prisma.groupExpense.create({
    data: {
      groupId: group.id,
      title: 'Cash for shopping',
      totalPaise: 50000, // ₹500
      splitType: 'EXACT',
      category: 'SHOPPING',
      createdById: shiv.id,
      contributors: { create: [{ userId: shiv.id, amountPaise: 50000 }] },
      date: new Date(),
      splits: {
        create: [
          { userId: shiv.id, amountPaise: 0 },
          { userId: john.id, amountPaise: 50000 },
        ]
      }
    }
  });
  console.log('✅ Added Expense: Cash Loan (Shiv paid ₹500, John owes ₹500)');

  // 5. Create a settlement
  // Let's say John pays Shivendra 500 to clear the cash loan
  await prisma.settlement.create({
    data: {
      groupId: group.id,
      fromUserId: john.id,
      toUserId: shiv.id,
      amountPaise: 50000,
      date: new Date()
    }
  });
  console.log('✅ Added Settlement: John paid Shiv ₹500');

  // 6. Create some personal expenses for Shiv
  await prisma.personalExpense.createMany({
    data: [
      { userId: shiv.id, title: 'Netflix Subscription', amountPaise: 19900, category: 'ENTERTAINMENT', date: new Date() },
      { userId: shiv.id, title: 'Electricity Bill', amountPaise: 120000, category: 'UTILITIES', date: new Date() },
      { userId: shiv.id, title: 'Groceries', amountPaise: 45000, category: 'GROCERIES', date: new Date() },
    ]
  });
  console.log('✅ Added 3 Personal Expenses for Shivendra');

  console.log('\n🎉 All test data injected successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
