<p align="center">
  <img src="public/images/Drop%20Me%20a%20Tip%20in%20Blue%20Script.png" alt="Drop Me a Tip Logo" width="800" />
</p>

<h1 align="center">Drop Me a Tip</h1>

<p align="center">
  A production-grade monolithic REST API for a Tanzanian creator donation and
  membership platform — a <em>Buy Me a Coffee</em> clone built for mobile money.
</p>

---

## Overview

**Drop Me a Tip** lets creators (artists, musicians, bloggers, streamers) receive
tips and monthly membership subscriptions from their supporters. Supporters pay
via Tanzanian mobile money numbers (e.g. M-Pesa, Airtel Money, Tigo Pesa), and
creators withdraw their earnings to the same numbers.

The backend is a modular, type-safe Node.js/Express application with a
passwordless (email OTP) authentication flow, a mock payment gateway that is
ready to be swapped for real providers (Snippe, Azam Pay), and a double-entry
wallet ledger for accurate, auditable balances.

## Features

- **Passwordless authentication** — register and log in with an email OTP
  (no password). Access and refresh JWTs are issued after OTP verification.
- **Creator profiles** — public profile page by handle (`@username`), with a
  customizable "unit" (e.g. *Soda* for TZS 2,000) and monthly membership tiers.
- **Mobile money payments** — donations and tier subscriptions are validated to
  the Tanzanian `255XXXXXXXX` format and processed through a mock gateway.
- **Double-entry wallet** — every credit, platform fee, and withdrawal is recorded
  as a ledger entry, so the balance is always a verifiable sum.
- **Automated payouts** — creators request withdrawals to mobile money with
  atomic balance checks and pending-debit locking.
- **Transactional emails** — welcome, OTP verification, donation received, and
  payout status emails via Resend.
- **Global error handling** — Zod, Prisma, and HTTP errors are normalized into a
  consistent `{ success, message, data, errors }` JSON envelope.
- **Strict TypeScript** — runtime validation with Zod and compile-time type safety.

## Tech Stack

| Area           | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js                             |
| Framework      | Express.js 5                        |
| Language       | TypeScript                          |
| ORM            | Prisma 7 (PostgreSQL + driver adapter) |
| Database       | PostgreSQL                          |
| Validation     | Zod                                 |
| Authentication | JWT (access + refresh)              |
| Email          | Resend                              |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or remote)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

3. Create the database and run migrations:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The server runs on `http://localhost:3000`.

## API Reference

All endpoints are prefixed with `/api/v1` and return the standard envelope:

```json
{ "success": true, "message": "…", "data": {} }
```

### Authentication (`/auth`)

| Method | Endpoint               | Access    | Description                                        |
| ------ | ---------------------- | --------- | -------------------------------------------------- |
| POST   | `/auth/register`       | Public    | Register with name, email, phone → sends OTP       |
| POST   | `/auth/login`          | Public    | Request a login OTP for an existing email          |
| POST   | `/auth/verify-otp`     | Public    | Verify OTP → returns access + refresh tokens       |
| POST   | `/auth/refresh-token`  | Public    | Exchange a refresh token for new tokens            |
| POST   | `/auth/logout`         | Protected | Log out                                            |
| GET    | `/auth/me`             | Protected | Get the authenticated user's profile               |

### Creators (`/creators`)

| Method | Endpoint                     | Access    | Description                                  |
| ------ | ---------------------------- | --------- | -------------------------------------------- |
| GET    | `/creators/:username`        | Public    | Public profile, unit settings, active tiers  |
| PATCH  | `/creators/profile`          | Protected | Update bio, unit name, unit price, payout phone |
| POST   | `/creators/tiers`            | Protected | Create a monthly membership tier             |
| GET    | `/creators/tiers/my-tiers`   | Protected | List the authenticated creator's tiers       |
| PATCH  | `/creators/tiers/:id`        | Protected | Update a tier                                |
| DELETE | `/creators/tiers/:id`        | Protected | Delete a tier                                |

### Payments (`/payments`)

| Method | Endpoint                       | Access   | Description                                      |
| ------ | ------------------------------ | -------- | ------------------------------------------------ |
| POST   | `/payments/initiate`           | Public   | Start a donation or tier join (returns mock USSD) |
| POST   | `/payments/webhook`            | Internal | Confirm a payment and credit the creator's wallet |
| GET    | `/payments/transaction/:id`    | Public   | Poll transaction status                          |

### Wallet (`/wallet`)

| Method | Endpoint            | Access    | Description                                   |
| ------ | ------------------- | --------- | --------------------------------------------- |
| GET    | `/wallet/balance`   | Protected | Real-time net balance from the ledger         |
| GET    | `/wallet/ledger`    | Protected | Paginated ledger history                      |
| POST   | `/wallet/withdraw`  | Protected | Request a mobile-money payout                 |

## How Payments Work

1. A supporter calls `POST /payments/initiate` with a phone number and either a
   donation amount or a membership tier. The phone is normalized to
   `255XXXXXXXX` and a `PENDING` transaction is created.
2. The gateway method `PaymentService.triggerMobileMoneyPush` returns a mock
   USSD push response. To integrate a real provider (Snippe/Azam Pay), only this
   single method needs to be replaced.
3. The provider later confirms the payment by calling `POST /payments/webhook`
   (protected by `WEBHOOK_SECRET`). The transaction is marked `COMPLETED` and the
   creator's wallet is credited — **net of the platform fee** — within an atomic
   database transaction.
4. The creator is notified by email and can poll status via
   `GET /payments/transaction/:id`.

## Wallet Accounting

The wallet uses a **double-entry ledger**. Every event writes an entry:

| Entry type | Meaning                              | Effect on balance |
| ---------- | ------------------------------------ | ----------------- |
| `CREDIT`   | Gross amount received from a supporter | `+`            |
| `FEE`      | Platform fee deducted                 | `−`            |
| `DEBIT`    | Withdrawal / payout                   | `−`            |

The balance is always computed as `SUM(CREDIT) − SUM(DEBIT) − SUM(FEE)`, never
stored directly. Withdrawals run inside a `SERIALIZABLE` transaction to prevent
spending the same funds twice.

## Scripts

| Command                    | Description                              |
| -------------------------- | ---------------------------------------- |
| `npm run dev`              | Start dev server with hot reload         |
| `npm run build`            | Compile TypeScript to `dist/`            |
| `npm start`                | Run the compiled server                  |
| `npm run typecheck`        | Type-check without emitting              |
| `npm run prisma:generate`  | Regenerate the Prisma client             |
| `npm run prisma:migrate`   | Create/apply a development migration     |
