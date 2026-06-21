# mosted — most likely to, quantified

A "Most Likely To" voting app for friend groups. Create voting boxes, submit questions, vote on your friends, and see who wins.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your database

Create a free Postgres database at [neon.tech](https://neon.tech), then copy the connection strings:

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` — the **pooled** connection string (contains `-pooler` in the hostname)
- `DIRECT_URL` — the **direct** connection string (for migrations)
- `NEXTAUTH_SECRET` — generate one with `openssl rand -base64 32`

### 3. Push the database schema

```bash
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good.

### Optional: Tenor GIF API

To get anime reaction GIFs on the landing page:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Tenor API
3. Create an API key
4. Add it to `.env` as `NEXT_PUBLIC_TENOR_API_KEY`

Without this, the landing page shows themed placeholder cards instead.

## Architecture

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Postgres (Neon) via Prisma with the Neon serverless adapter
- **Auth:** Auth.js v5 with Credentials provider (bcrypt-hashed passwords)
- **State refresh:** Server-side revalidation + polling (5s intervals during active phases)

## Key Design Decisions

- **Privacy is enforced server-side:** A single function `getResultsForBox()` in `src/lib/results.ts` decides what data to expose based on box visibility. PRIVATE boxes never leak individual vote attribution.
- **Visibility is immutable:** Once a box is created as PUBLIC or PRIVATE, it can never be changed.
- **Candidate validation:** Every vote submission verifies that the candidate is actually a BoxMember — never trusts client-side data.
- **One vote per question:** Enforced at the database level via `@@unique([questionId, voterId])`, not just in application logic.

## Deploy to Vercel

```bash
npx vercel
```

Make sure to add your environment variables in the Vercel dashboard.
