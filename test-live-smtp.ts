async function main() {
  const res = await fetch('https://evn-expense-tracker-8vol.vercel.app/api/test-smtp');
  const text = await res.text();
  console.log(`Status: ${res.status}`);
  try {
    console.log(`JSON:`, JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(`Response: ${text}`);
  }
}
main();
