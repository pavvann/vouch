# Vouch ✨

> Communities built on trust, not algorithms.

## What is Vouch?

Vouch is a **vouch-based community platform** where access is earned through trust. Unlike traditional social platforms where anyone can join any group, Vouch requires existing members to vouch for newcomers before they can enter.

Think of it like an exclusive club—you need someone on the inside to get you in.

### Core Concept

- **Private by default** - No public feeds, no discovery algorithms
- **Trust-based access** - Need 1-3 vouches from members to join
- **Quality over quantity** - Cooldowns prevent spam invites
- **Role hierarchy** - Creators, Validators, and Members with different powers

---

## Why We Built It

Traditional social platforms optimize for growth and engagement, often at the expense of community quality. Anyone can join, bots run rampant, and meaningful connections get buried under noise.

**Vouch flips the script:**

- Communities stay intimate and high-quality
- Members have skin in the game—bad vouches have consequences
- No algorithmic feeds pushing viral content
- Real conversations with people you actually want to talk to

It's for friend groups, fan clubs, professional networks, and anyone who wants a digital space that feels more like a living room than a stadium.

---

## How to Run It

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Vercel account (for Blob storage)

### Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd vouch
npm install
```

2. **Create a `.env` file:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vouch"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

For `BLOB_READ_WRITE_TOKEN`: Go to Vercel Dashboard → Storage → Create Blob Store

3. **Set up the database:**
```bash
npm run db:generate
npm run db:push
```

4. **Add PWA icons:**
- Place `icon-192.png` (192×192) in `/public`
- Place `icon-512.png` (512×512) in `/public`

5. **Run the dev server:**
```bash
npm run dev
```

Visit `http://localhost:3000` 🚀

---

## What Works

### ✅ Authentication
- Email/password registration and login
- Session management with NextAuth.js

### ✅ Community Management
- Create communities with custom settings
- Cover images uploaded to Vercel Blob
- Configurable vouch requirements (1-3 vouches)
- Configurable cooldown periods (7 or 30 days)

### ✅ Vouch System
- Request access with "Let me in" button
- Members can vouch for pending requests
- **Veto vouch** - Creators and Validators grant instant access
- Cooldown enforcement between vouches
- Auto-join when vouch threshold is met

### ✅ Role System
- **Creator** - Full control, unlimited vouches, can promote/remove members
- **Validator** - Trusted member with veto vouch power
- **Member** - Standard access with cooldown between vouches

### ✅ Community Features
- **Chat** - Real-time messaging (polling-based)
- **Moments** - Posts with optional images
- **Comments** - Engage with moments

### ✅ Member Management
- View all community members
- Promote members to Validator (Creator only)
- Remove members (Creator only)
- View and act on join requests

### ✅ PWA
- Installable on mobile and desktop
- Standalone app experience
- Custom app icon support

### ✅ UI/UX
- Dark theme with neon pink/purple accents
- Animated flowing gradient background
- Mobile-first responsive design
- Bottom navigation bar
- Glassmorphism cards

---

## What We'd Add With More Time

### 🔔 Push Notifications
- Notify when someone requests to join
- Alert when you receive a vouch
- New message/moment notifications

### 📊 Community Analytics
- Member growth over time
- Vouch success rates
- Activity metrics for Creators

### 🔗 Invite Links
- Shareable links with limited uses
- Expiring invites
- QR codes for in-person onboarding

### ⭐ Reputation System
- Track vouch quality over time
- Badge system for trusted vouchers
- Penalty history visibility

### 🔍 Better Discovery
- Category-based community browsing
- Search functionality
- Recommended communities based on connections

### 💬 Enhanced Chat
- WebSocket real-time updates
- Message reactions
- Reply threads
- File/media sharing

### 🎨 Customization
- Custom community themes
- Profile customization
- Community badges and flairs

### 🔐 Advanced Permissions
- Custom roles beyond the 3 tiers
- Granular permission settings
- Temporary bans vs permanent removal

### 📱 Native Features
- Camera integration for moments
- Location sharing
- Voice messages

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | App Router, Server Actions |
| Prisma | Database ORM |
| PostgreSQL | Data storage |
| NextAuth.js | Authentication |
| TailwindCSS | Styling |
| Vercel Blob | Image uploads |
| TypeScript | Type safety |

---

## Project Structure

```
/app          → Next.js app router pages
/components   → React components
/lib          → Utilities, auth, database
/prisma       → Database schema
/public       → Static assets, PWA files
```

---

**Built with 💖 for the culture.**
