# Architecture Overview

## Project Information

**Project Name**: Auto Log Transaction
**Owner**: Vincent
**Created**: 2026-05-14
**Last Updated**: 2026-05-14

---

## High-Level Architecture

### System Components
1. **Frontend**: Next.js 15 (App Router) - Dashboard to monitor logs
2. **Backend**: Server Actions + Route Handlers
3. **Automation Engine**: Node.js worker running 24/7 on VPS via **PM2**
4. **External APIs**: Gmail/IMAP (Source), Google Sheets (Destination)
5. **Database**: Supabase (to store `messageId` of processed emails to avoid duplicates)

### Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│              Next.js App Router                      │
│         (Server Components default)                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Server Actions                          │
│         (Mutations & Form Handling)                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                 Supabase                             │
│     PostgreSQL + Auth + Realtime + Storage          │
└─────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### Decision 1: Server Components Default
- **Decision**: Use Server Components unless interactivity required
- **Reason**: Reduces client JavaScript
- **Exception**: `'use client'` for hooks/event handlers

### Decision 2: Server Actions for Mutations
- **Decision**: All mutations via Server Actions
- **Location**: `app/actions.ts` or `app/[feature]/actions.ts`
- **Pattern**: Zod validation → Process → Return `ActionResponse<T>`

### Decision 3: Route Handlers for Webhooks Only
- **Decision**: API routes only for external webhooks
- **Location**: `/app/api/webhooks/[service]/route.ts`

### Decision 4: No Barrel Files
- **Decision**: Never create `index.ts` re-exports
- **Reason**: Breaks tree-shaking

---

## File Structure

```
project-root/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── actions.ts
│   ├── (auth)/
│   └── api/webhooks/
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   └── schemas/
├── tests/
├── docs/
│   ├── architect.md
│   ├── tech-spec.md
│   ├── prd.md
│   └── changelog/
└── .antigravityignore
```

---

## Constraints

- [ ] App Router only (no pages/)
- [ ] No default exports
- [ ] No `any` types
- [ ] No console.log in production
- [ ] No barrel files

---

## Links to Key Files

- `/app/actions.ts` - Server Actions
- `/lib/supabase/server.ts` - Database
- `/app/layout.tsx` - Root layout
- `tailwind.config.ts` - Styling

---

## VPS Deployment

### Environment
- **OS**: Ubuntu 22.04+ (Recommended)
- **Runtime**: Node.js 20+
- **Process Manager**: PM2 (Global)

### Automation Logic
The application uses an internal scheduler (`node-cron`) to trigger the sync process every 3-4 minutes. This eliminates the need for external cron services and allows for 24/7 autonomous operation on a VPS.

### Execution Plan
1. **App Mode**: Run in standalone Node.js mode.
2. **Process Management**: Managed by PM2 to handle restarts and logging.
3. **Connectivity**: Uses IMAP to poll the bank emails directly.
