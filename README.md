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

2. Set up your PostgreSQL database and create a `.env` file:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vouch?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

   To generate a secure `NEXTAUTH_SECRET`, run:
   ```bash
   openssl rand -base64 32
   ```
   Or using Node.js:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Copy the output and paste it as the value for `NEXTAUTH_SECRET` in your `.env` file.

3. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

4. Create PWA icons (required for installability):
   - Create `/public/icon-192.png` (192x192 pixels)
   - Create `/public/icon-512.png` (512x512 pixels)
   
   For quick testing, you can use any image editor or online tool like https://realfavicongenerator.net/

5. Run the development server:
```bash
npm run dev
```

## PWA Features

The app is configured as a Progressive Web App (PWA) with:
- ✅ Web App Manifest (`/public/manifest.json`)
- ✅ Service Worker for offline caching (`/public/sw.js`)
- ✅ Installable on mobile and desktop
- ✅ Standalone display mode

To install:
- **Mobile**: Use "Add to Home Screen" from browser menu
- **Desktop**: Look for install prompt in browser address bar (Chrome/Edge)

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

