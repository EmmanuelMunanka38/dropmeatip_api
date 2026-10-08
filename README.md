# dropmeatip_api

Production-grade monolithic REST API for a Tanzanian creator donation and membership platform (a Buy Me a Coffee clone). Supports passwordless OTP authentication, creator profiles and membership tiers, mobile-money donations, and a double-entry wallet with payouts.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (TypeScript)
- **ORM**: Prisma (PostgreSQL)
- **Validation**: Zod
- **Authentication**: JWT (access + refresh) with email OTP (passwordless)
- **Email**: Resend

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

3. Run migrations and generate the Prisma client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

The server runs on `http://localhost:3000`.

## Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start dev server with hot reload         |
| `npm run build`        | Compile TypeScript to `dist/`            |
| `npm start`            | Run the compiled server                  |
| `npm run typecheck`    | Type-check without emitting              |
| `npm run prisma:generate` | Regenerate the Prisma client           |
| `npm run prisma:migrate`  | Create/apply a dev migration           |

## API Modules

- `/api/v1/auth` — register, login (OTP), verify-otp, refresh-token, me
- `/api/v1/creators` — public profile, profile update, membership tiers
- `/api/v1/payments` — initiate donation/membership, webhook, transaction status
- `/api/v1/wallet` — balance, ledger, withdraw
