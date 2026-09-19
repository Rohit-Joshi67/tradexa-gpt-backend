# Tradexa GPT — Razorpay Setup Guide

The billing code is fully built. It does nothing until you connect your
Razorpay account — follow these steps when you're ready. Nothing here needs
a developer; it's all dashboard clicking.

## Step 1 — Create your Razorpay account

1. Sign up at https://razorpay.com (business account).
2. Complete KYC (business PAN, bank account, etc.).
3. **Start in TEST mode** (toggle in the dashboard sidebar) — you can take
   test payments without real money.

## Step 2 — Create the 4 subscription plans (in TEST mode first)

Go to **Subscriptions → Plans → Create Plan** and create exactly these:

| Plan name (dashboard)              | Amount | Interval |
|-----------------------------------|--------|----------|
| Tradexa Pro Monthly               | ₹1,999 | Monthly  |
| Tradexa Pro Monthly — Launch      | ₹999   | Monthly  |
| Tradexa Pro Yearly                | ₹19,999| Yearly   |
| Tradexa Pro Yearly — Launch       | ₹9,999 | Yearly   |

> The backend **verifies the plan amount** before every checkout. If a plan's
> amount doesn't match the table above, checkout is blocked with a clear
> error — so type the amounts carefully.

Copy each plan's **Plan ID** (looks like `plan_xxxxxxxxxxxxxx`).

## Step 3 — API keys

**Settings → API Keys → Generate Test Keys.** Copy the **Key ID**
(`rzp_test_...`) and **Key Secret** (shown once — store it safely).

## Step 4 — Webhook

**Settings → Webhooks → Add New Webhook:**

- **URL:** `https://<your-render-service>.onrender.com/api/v1/billing/webhook`
  (replace with your real Render URL)
- **Secret:** invent a long random string — you'll paste it into Render too.
- **Events:** `subscription.activated`, `subscription.charged`,
  `subscription.halted`, `subscription.cancelled`, `subscription.completed`,
  `subscription.updated`, `payment.failed`

The webhook is what actually grants/revokes Pro access — don't skip it.

## Step 5 — Render environment variables

In your Render backend service → **Environment**, add:

```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...              (the secret from Step 4)
RAZORPAY_PLAN_PRO_MONTHLY=plan_...
RAZORPAY_PLAN_PRO_MONTHLY_LAUNCH=plan_...
RAZORPAY_PLAN_PRO_YEARLY=plan_...
RAZORPAY_PLAN_PRO_YEARLY_LAUNCH=plan_...
```

Redeploy. Billing endpoints return `503` until these are set — that's
intentional, not a bug.

## Step 6 — Test the full flow (test mode)

1. Open the site → **Pricing** → pick Pro monthly.
2. Register/login, click subscribe.
3. Razorpay test checkout: use card `4111 1111 1111 1111`, any future
   expiry, any CVV — or test UPI.
4. After payment, **Dashboard** should show Pro. Check the Razorpay
   dashboard: subscription should be `active`.
5. Cancel from the dashboard → access continues till period end.

## Step 7 — Go live

1. Finish Razorpay KYC approval, flip the dashboard to **LIVE mode**.
2. Repeat Steps 2–5 with **live** plans, keys, and webhook
   (Key ID will start with `rzp_live_`).
3. Do one real ₹1 test... actually just buy Pro yourself once and refund it
   in the dashboard to confirm the live loop.

## How the money logic works (for reference)

- **₹1,999/mo, ₹19,999/yr.** First 100 paying users get 50% off
  (₹999/mo, ₹9,999/yr) — automatic, no coupon codes. The counter is in the
  database; abandoned checkouts release their slot after 24h.
- **Free users:** articles + a 3-day journal trial, then Pro-only.
- **Webhooks** are the source of truth. If a webhook is ever missed,
  subscription status self-heals on the next Razorpay event.
- Cancelling stops future charges; Pro stays active until the paid period ends.

## Vercel (frontend)

No new environment variables needed — the publishable key comes from the
backend API at checkout time.

---

## Appendix — Auth hardening & email setup (Phase 0)

The auth system was hardened alongside billing. Two things need your
attention in the Render dashboard.

### A. Cookie session env vars (set these)

The login now uses a **15-minute access token** (kept in browser memory,
never in localStorage) plus a **7-day refresh token** in an `httpOnly`
cookie. Because the frontend (Vercel) and backend (Render) are on different
domains, the cookie needs these values:

| Render env var        | Value   | Why                                    |
|-----------------------|---------|----------------------------------------|
| `AUTH_COOKIE_SECURE`  | `true`  | Cookies require Secure on HTTPS        |
| `AUTH_COOKIE_SAMESITE`| `None`  | Cross-site (Vercel → Render) cookies   |
| `SWAGGER_ENABLED`     | `false` | Hides the API docs in production       |

(`JWT_ACCESS_EXPIRATION` / `JWT_REFRESH_EXPIRATION` are optional — they
default to 15 minutes / 7 days. The old `JWT_EXPIRATION` is retired.)

### B. Email (optional for now — skip until you want it)

Email verification and password reset are **env-gated**: the app boots
fine without them. Until you connect a provider, new registrations are
auto-verified and password reset returns "temporarily unavailable".

When you're ready (recommended: [Resend](https://resend.com), free tier):

1. Create a Resend account, verify your sending domain, create an API key.
2. Set on Render:
   - `EMAIL_PROVIDER=resend`
   - `EMAIL_API_KEY=re_...` (the Resend API key)
   - `EMAIL_FROM=Tradexa <noreply@yourdomain.com>` (must be your verified domain)
3. Redeploy. New registrations will then require email verification, and
   "Forgot password?" starts working.

### What changed for users

- Passwords now need **min 10 characters, at least one letter and one number**.
- Login/register error messages are generic (no "email already taken" leaks).
- Auth endpoints are rate-limited (5 logins/min, 3 registrations/hour per IP).
- Uploads are content-sniffed: a renamed `.xlsx` or binary file is rejected
  even if it ends in `.csv`.
