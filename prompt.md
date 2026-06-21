# AI Agent Task: Finalize and Verify Koshi the Bloshi Implementation

You are an expert full-stack developer AI agent. Your task is to finalize the implementation of the "koshi the bloshi" application (formerly "mosted") by syncing the database schema, verifying the builds, and testing the newly introduced features.

## Objective

Finalize the rebranding, the live self-voting toggle functionality, and the Discord OAuth integration. Ensure the codebase is clean, error-free, and compiles perfectly.

---

## Task Instructions

### Step 1: Sync the Database Schema
The Prisma schema (`prisma/schema.prisma`) has been updated to include `discordId` and `email` fields on the `User` model. You must sync these changes with the database.
1. Run the database sync command:
   ```bash
   npx prisma db push
   ```
2. Verify that the client is regenerated correctly:
   ```bash
   npx prisma generate
   ```

### Step 2: Validate Code and Types
Ensure that the changes introduced do not break any compilation paths or cause TypeScript/lint errors.
1. Run a production build test to check for compiler errors:
   ```bash
   npm run build
   ```
2. Inspect the output for any import errors, missing module declarations, or type mismatches (specifically around the NextAuth `auth.ts` changes, custom types in `src/types/next-auth.d.ts`, and updated page components).

### Step 3: Verify Rebranding Changes
Confirm that all visible references to "mosted" have been successfully rebranded to "koshi the bloshi" in the following places:
1. Root metadata title and description in `src/app/layout.tsx`.
2. Landing page header and footer in `src/app/page.tsx`.
3. Nav bar in the dashboard shell layout in `src/app/(app)/layout.tsx`.
4. Card headers on login and signup pages under `src/app/(auth)/`.

### Step 4: Verify the Self-Voting Toggle
The self-voting settings can now be toggled live by the owner in the Box page:
1. Open the box details page (`src/app/(app)/boxes/[id]/page.tsx`).
2. Verify that the `BoxHeader` successfully imports `toggleSelfVoteAction`.
3. Confirm that toggle actions correctly write back to the database and trigger visual updates in the box status header.

### Step 5: Verify Discord OAuth Configurations
1. Ensure `.env` (or equivalent environment config) has placeholders or values for:
   ```env
   DISCORD_CLIENT_ID="..."
   DISCORD_CLIENT_SECRET="..."
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3000"
   ```
2. Check that the Discord avatar source URL (`cdn.discordapp.com`) is correctly whitelisted in `next.config.ts`.
3. Verify that the login and signup pages properly trigger the sign-in redirect flow when the "Continue with Discord" button is clicked.

---

## Deliverables
Provide a final verification log confirming:
- The database schema is fully synced.
- The build compiles without errors.
- The Discord OAuth endpoints are configured.
- The self-vote settings toggle works correctly.
