# $yllabus

**Your whole campus, on one tap.**

$yllabus is a student-focused fintech experience that brings everyday money management and campus resources into one place. This repository contains the early-stage interactive beta, intended for product demonstrations and feedback. Account balances, campus funds, cards, and payment flows shown in the current prototype are illustrative and must not be treated as real financial services or university integrations.

## Product scope

- Student dashboard for checking, savings, and recent activity
- Campus resource overview for meal swipes, campus funds, stipends, and vouchers
- Digital wallet presentation for student ID and payment cards
- Send/receive demonstration flows

The long-term product is university-independent. Institution-specific data and capabilities will require authorized integrations.

## Technology

- React and TypeScript
- TanStack Start and TanStack Router
- Tailwind CSS
- Supabase integration scaffolding

## Local development

Requires Node.js and a compatible package manager.

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, and `npm run preview`.

## Development principles

1. Preserve the existing interface unless a design change is explicitly approved.
2. Plan and approve one feature at a time before implementation.
3. Keep simulated transactions and balances separate from real financial systems.
4. Never commit credentials, service-role keys, or private user data.
5. Add authorization, validation, and tests before connecting live financial or campus services.

## Current status

Early beta prototype. Screens and visual flows exist; production-ready banking, NFC credentials, and university integrations are not claimed. Backend features must be individually verified before being described as operational.
