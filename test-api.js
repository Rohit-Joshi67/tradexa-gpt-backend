#!/usr/bin/env node
/**
 * TradeXa GPT — Post-Deploy API Test Suite
 * Usage: node test-api.js <BACKEND_URL>
 * Example: node test-api.js https://tradexa-gpt.onrender.com
 */

const BASE_URL = process.argv[2]?.replace(/\/$/, '')

if (!BASE_URL) {
  console.error('Usage: node test-api.js <BACKEND_URL>')
  process.exit(1)
}

const TEST_USER = {
  name: 'Deploy Test User',
  email: `test-${Date.now()}@tradexa.test`,
  password: 'Test@12345',
}

let token = null
let createdTradeId = null
let passed = 0
let failed = 0

async function req(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  return { status: res.status, data: json }
}

function pass(label) {
  console.log(`  ✅  ${label}`)
  passed++
}

function fail(label, detail) {
  console.log(`  ❌  ${label}`)
  if (detail) console.log(`       → ${detail}`)
  failed++
}

function section(title) {
  console.log(`\n─── ${title} ───`)
}

async function run() {
  console.log(`\n🚀  TradeXa GPT API Test Suite`)
  console.log(`   Backend: ${BASE_URL}\n`)

  // ── 1. Health ────────────────────────────────────────────────────────────
  section('Health Check')
  try {
    const r = await req('GET', '/api/v1/health')
    r.status === 200
      ? pass(`GET /api/v1/health → ${r.status}`)
      : fail(`GET /api/v1/health`, `Expected 200, got ${r.status}`)
  } catch (e) { fail('GET /api/v1/health', e.message) }

  // ── 2. Register ──────────────────────────────────────────────────────────
  section('Auth — Register')
  try {
    const r = await req('POST', '/api/v1/auth/register', TEST_USER)
    r.status === 200 || r.status === 201
      ? pass(`POST /api/v1/auth/register → ${r.status}`)
      : fail(`POST /api/v1/auth/register`, `Expected 201, got ${r.status} — ${JSON.stringify(r.data)}`)
  } catch (e) { fail('POST /api/v1/auth/register', e.message) }

  // ── 3. Login ─────────────────────────────────────────────────────────────
  section('Auth — Login')
  try {
    const r = await req('POST', '/api/v1/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password,
    })
    if (r.status === 200) {
      token = r.data?.data?.token || r.data?.token
      token
        ? pass(`POST /api/v1/auth/login → token received`)
        : fail(`POST /api/v1/auth/login`, 'No token in response')
    } else {
      fail(`POST /api/v1/auth/login`, `Expected 200, got ${r.status}`)
    }
  } catch (e) { fail('POST /api/v1/auth/login', e.message) }

  if (!token) {
    console.log('\n⛔  No token — skipping authenticated tests\n')
    printSummary()
    return
  }

  // ── 4. Create Trade ──────────────────────────────────────────────────────
  section('Trades CRUD')
  const tradePayload = {
    symbol: 'AAPL',
    side: 'BUY',
    quantity: 10,
    price: 150.50,
    tradeDate: new Date().toISOString().split('T')[0],
    notes: 'Post-deploy test trade',
  }
  try {
    const r = await req('POST', '/api/v1/trades', tradePayload, true)
    if (r.status === 200 || r.status === 201) {
      createdTradeId = r.data?.data?.id || r.data?.id
      pass(`POST /api/v1/trades → id=${createdTradeId}`)
    } else {
      fail(`POST /api/v1/trades`, `Expected 201, got ${r.status} — ${JSON.stringify(r.data)}`)
    }
  } catch (e) { fail('POST /api/v1/trades', e.message) }

  // ── 5. Get Trades ────────────────────────────────────────────────────────
  try {
    const r = await req('GET', '/api/v1/trades', null, true)
    r.status === 200
      ? pass(`GET /api/v1/trades → ${r.status}`)
      : fail(`GET /api/v1/trades`, `Expected 200, got ${r.status}`)
  } catch (e) { fail('GET /api/v1/trades', e.message) }

  // ── 6. Update Trade ──────────────────────────────────────────────────────
  if (createdTradeId) {
    try {
      const r = await req('PUT', `/api/v1/trades/${createdTradeId}`, {
        ...tradePayload, notes: 'Updated by test suite',
      }, true)
      r.status === 200
        ? pass(`PUT /api/v1/trades/${createdTradeId} → ${r.status}`)
        : fail(`PUT /api/v1/trades/${createdTradeId}`, `Expected 200, got ${r.status}`)
    } catch (e) { fail(`PUT /api/v1/trades/:id`, e.message) }

    // ── 7. Delete Trade ────────────────────────────────────────────────────
    try {
      const r = await req('DELETE', `/api/v1/trades/${createdTradeId}`, null, true)
      r.status === 200 || r.status === 204
        ? pass(`DELETE /api/v1/trades/${createdTradeId} → ${r.status}`)
        : fail(`DELETE /api/v1/trades/${createdTradeId}`, `Expected 200/204, got ${r.status}`)
    } catch (e) { fail(`DELETE /api/v1/trades/:id`, e.message) }
  }

  // ── 8. Analytics ─────────────────────────────────────────────────────────
  section('Analytics')
  for (const path of [
    '/api/v1/analytics/summary',
    '/api/v1/analytics/symbols',
    '/api/v1/analytics/market-hours',
  ]) {
    try {
      const r = await req('GET', path, null, true)
      r.status === 200
        ? pass(`GET ${path} → ${r.status}`)
        : fail(`GET ${path}`, `Expected 200, got ${r.status}`)
    } catch (e) { fail(`GET ${path}`, e.message) }
  }

  printSummary()
}

function printSummary() {
  console.log('\n══════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('══════════════════════════════\n')
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
