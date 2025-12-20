# Vouch - Community PWA

A hackathon MVP of a vouch-based community platform built with Next.js, Prisma, and PostgreSQL.

## Features

- Private communities with vouch-based access
- Role-based permissions (Founder, Validator, Member)
- Cooldown system for vouching
- Chat and Moments within communities
- Simple email/password authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your PostgreSQL database and update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vouch?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

3. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

4. Run the development server:
```bash
npm run dev
```

## Tech Stack

- Next.js 14 (App Router)
- Prisma
- PostgreSQL
- NextAuth.js
- TailwindCSS
- TypeScript

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utility functions and server logic
- `/prisma` - Database schema

