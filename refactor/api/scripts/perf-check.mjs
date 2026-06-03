#!/usr/bin/env node
/**
 * Guardrail performa: ukur latensi tiap endpoint terhadap server berjalan.
 * GAGAL (exit 1) bila ada endpoint dengan latensi maksimum > BUDGET_MS.
 *
 * Pakai:
 *   PERF_API=http://localhost:4000/api node scripts/perf-check.mjs
 * (default http://localhost:3000/api). Jalankan server dengan THROTTLE_LIMIT tinggi
 * agar tidak terkena rate limit saat mengukur.
 */
const API = process.env.PERF_API ?? 'http://localhost:3000/api';
const BUDGET_MS = Number(process.env.PERF_BUDGET_MS ?? 1000);
const RUNS = Number(process.env.PERF_RUNS ?? 5);

async function timed(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const t0 = performance.now();
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  await res.text(); // konsumsi body agar termasuk transfer
  const ms = performance.now() - t0;
  return { ms, status: res.status };
}

async function measure(name, method, path, opts = {}) {
  const runs = opts.runs ?? RUNS;
  await timed(method, path, opts); // warm-up
  const samples = [];
  let status = 0;
  for (let i = 0; i < runs; i++) {
    const r = await timed(method, path, opts);
    samples.push(r.ms);
    status = r.status;
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  // login di-rate-limit (10/mnt) → 429 wajar, hanya latensi yang dinilai.
  return { name, status, min, avg, max, ignoreStatus: !!opts.ignoreStatus };
}

async function main() {
  // Login untuk dapat token.
  const login = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' }),
  });
  const loginJson = await login.json();
  const token = loginJson.access_token;
  if (!token) {
    console.error('Login gagal — tidak dapat token. Pastikan server & DB jalan.');
    process.exit(2);
  }

  // Ambil contoh data nyata.
  const fakturRes = await (
    await fetch(API + '/faktur?limit=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();
  const sampleFaktur = fakturRes.data?.[0]?.noFaktur ?? 'FA/BD/20/06/3536';
  const sampleCustomer = fakturRes.data?.[0]?.customerId ?? 200212011;

  const cases = [
    ['POST /auth/login', 'POST', '/auth/login', { body: { username: 'admin', password: '123456' }, runs: 1, ignoreStatus: true }],
    ['GET  /auth/me', 'GET', '/auth/me', { token }],
    ['POST /meter/calculate', 'POST', '/meter/calculate', { token, body: { tipe: 'B', pemakaian: 25 } }],
    ['GET  /customers?limit=20', 'GET', '/customers?limit=20', { token }],
    ['GET  /customers?search=DENI', 'GET', '/customers?search=DENI&limit=20', { token }],
    ['GET  /customers/:id', 'GET', `/customers/${sampleCustomer}`, { token }],
    ['GET  /customers/:id/history', 'GET', `/customers/${sampleCustomer}/history`, { token }],
    ['GET  /customers/resolve/:id', 'GET', `/customers/resolve/${sampleCustomer}`, { token }],
    ['GET  /customers/snapshot (all)', 'GET', '/customers/snapshot?limit=1000', { token }],
    ['GET  /faktur?limit=20', 'GET', '/faktur?limit=20', { token }],
    ['GET  /faktur?customerId', 'GET', `/faktur?customerId=${sampleCustomer}&limit=20`, { token }],
    ['GET  /faktur?isLunas=0', 'GET', '/faktur?isLunas=0&limit=20', { token }],
    ['GET  /faktur/detail', 'GET', `/faktur/detail?noFaktur=${encodeURIComponent(sampleFaktur)}`, { token }],
    ['GET  /faktur/payments', 'GET', `/faktur/payments?noFaktur=${encodeURIComponent(sampleFaktur)}`, { token }],
    ['GET  /reports/summary', 'GET', '/reports/summary', { token }],
    ['GET  /reports/monthly=12', 'GET', '/reports/monthly?months=12', { token }],
    ['GET  /reports/tunggakan','GET','/reports/tunggakan',{token}],
    ['GET  /reports/worklist', 'GET', '/reports/worklist', { token }],
    ['GET  /reports/anomalies', 'GET', '/reports/anomalies', { token }],
    ['GET  /customers/map', 'GET', '/customers/map', { token }],
    ['GET  /produk', 'GET', '/produk?limit=20', { token }],
    ['GET  /supplier', 'GET', '/supplier?limit=20', { token }],
    ['GET  /config', 'GET', '/config', { token }],
  ];

  const results = [];
  for (const [name, method, path, opts] of cases) {
    results.push(await measure(name, method, path, opts));
  }

  // Cetak tabel.
  const pad = (s, n) => String(s).padEnd(n);
  const num = (n) => `${n.toFixed(1)}ms`.padStart(9);
  const head = (s) => String(s).padStart(9);
  console.log(`\nPerf check @ ${API}  (runs=${RUNS}, budget=${BUDGET_MS}ms)\n`);
  console.log(pad('Endpoint', 32), pad('Status', 7), head('min'), head('avg'), head('max'), ' OK');
  console.log('-'.repeat(78));
  let failed = 0;
  for (const r of results) {
    const ok = r.max <= BUDGET_MS && (r.ignoreStatus || r.status < 400);
    if (!ok) failed++;
    console.log(
      pad(r.name, 32),
      pad(r.status, 7),
      num(r.min),
      num(r.avg),
      num(r.max),
      ok ? ' ✓' : ' ✗ >budget',
    );
  }
  const slowest = results.reduce((a, b) => (b.max > a.max ? b : a));
  console.log('-'.repeat(78));
  console.log(`Terlambat: ${slowest.name} (${slowest.max.toFixed(1)}ms max)`);
  console.log(failed === 0 ? '\n✅ SEMUA endpoint <= budget' : `\n❌ ${failed} endpoint melebihi budget`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('perf-check error:', e.message);
  process.exit(2);
});
