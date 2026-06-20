import fs from 'fs';

const API_BASE = 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text), headers: res.headers };
  } catch (e) {
    return { status: res.status, data: text, headers: res.headers };
  }
}

async function runTests() {
  console.log('🚀 Starting API E2E Tests...');
  let cookies = [];

  const getCookieHeader = () => ({ 'Cookie': cookies.join('; ') });

  // 1. Register User 1
  console.log('\n--- 1. Register User 1 ---');
  const user1Email = `test.user1.${Date.now()}@example.com`;
  const resReg1 = await fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Alice', email: user1Email, password: 'Password123!', confirmPassword: 'Password123!' })
  });
  console.log('Register Alice:', resReg1.status, resReg1.data);
  if (resReg1.status !== 201) return;

  const accessToken1 = resReg1.data.data.accessToken;
  const rawCookie1 = resReg1.headers.get('set-cookie');
  if (rawCookie1) cookies.push(rawCookie1.split(';')[0]);

  // 2. Create Personal Expense
  console.log('\n--- 2. Create Personal Expense ---');
  const resExp = await fetchAPI('/personal-expenses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken1}`, ...getCookieHeader() },
    body: JSON.stringify({
      title: 'Groceries',
      amountPaise: 50000, // 500 INR
      category: 'GROCERIES',
      date: new Date().toISOString()
    })
  });
  console.log('Create Expense:', resExp.status, resExp.data);

  // 3. Create Group
  console.log('\n--- 3. Create Group ---');
  const resGroup = await fetchAPI('/groups', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken1}`, ...getCookieHeader() },
    body: JSON.stringify({
      name: 'Goa Trip',
      type: 'TRIP',
      description: 'Weekend getaway'
    })
  });
  console.log('Create Group:', resGroup.status, resGroup.data);
  if (resGroup.status !== 201) return;
  
  const group = resGroup.data.data;
  const inviteCode = group.inviteCode;

  // 4. Register User 2
  console.log('\n--- 4. Register User 2 ---');
  let cookies2 = [];
  const getCookieHeader2 = () => ({ 'Cookie': cookies2.join('; ') });
  const user2Email = `test.user2.${Date.now()}@example.com`;
  
  const resReg2 = await fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Bob', email: user2Email, password: 'Password123!', confirmPassword: 'Password123!' })
  });
  console.log('Register Bob:', resReg2.status, resReg2.data);
  const accessToken2 = resReg2.data.data.accessToken;
  const rawCookie2 = resReg2.headers.get('set-cookie');
  if (rawCookie2) cookies2.push(rawCookie2.split(';')[0]);

  // 5. User 2 Joins Group
  console.log('\n--- 5. User 2 Joins Group ---');
  const resJoin = await fetchAPI('/groups/join', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken2}`, ...getCookieHeader2() },
    body: JSON.stringify({ inviteCode })
  });
  console.log('Bob Joins Group:', resJoin.status, resJoin.data);

  // 6. Get Group Details (as Alice)
  console.log('\n--- 6. Get Group Details ---');
  const resGroupDetail = await fetchAPI(`/groups/${group.id}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken1}`, ...getCookieHeader() }
  });
  console.log('Group Details:', resGroupDetail.status, JSON.stringify(resGroupDetail.data.data, null, 2));

  // 7. Add Group Expense (Alice paid 1000 INR for Bob and herself)
  console.log('\n--- 7. Add Group Expense ---');
  const members = resGroupDetail.data.data.members;
  const aliceId = members.find(m => m.name === 'Alice').userId;
  const bobId = members.find(m => m.name === 'Bob').userId;

  const resGroupExp = await fetchAPI(`/groups/${group.id}/expenses`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken1}`, ...getCookieHeader() },
    body: JSON.stringify({
      title: 'Dinner',
      totalPaise: 100000, // 1000 INR
      category: 'FOOD',
      splitType: 'EQUAL',
      date: new Date().toISOString(),
      contributors: [{ userId: aliceId, amountPaise: 100000 }],
      splits: [{ userId: aliceId }, { userId: bobId }]
    })
  });
  console.log('Add Group Expense:', resGroupExp.status, resGroupExp.data);

  // 8. Check Balances
  console.log('\n--- 8. Check Balances ---');
  const resBalances = await fetchAPI(`/groups/${group.id}/balances`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken1}`, ...getCookieHeader() }
  });
  console.log('Balances:', resBalances.status, JSON.stringify(resBalances.data.data, null, 2));

  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
