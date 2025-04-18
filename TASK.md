# Planning

## Purpose
Define a mobile-first, PWA-enabled nutrition app to help individuals and administrators track meals, ingredients, and health metrics over weekly periods, with gamification elements to boost engagement.

## Vision & Scope
- Allow users to log six meals per day with details
- Enable admins to manage meals, ingredients, and nutritional data
- Provide weekly progress reports and gamification
- Support offline usage on mobile devices
- Integrate basic bioimpedance metrics input

## Architecture
- **Frontend**: Next.js App Router, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js (Google OAuth)
- **State Management**: SWR or React Query for data fetching
- **PWA**: next-pwa for service worker & caching
- **Testing**: Jest, React Testing Library

## Constraints
- Must be mobile-first (target viewport ≤ 480px)
- Offline support for critical read operations and data entry
- ShadCN UI components for consistency
- Secure user session handling

## Tech Stack
- Next.js
- Tailwind CSS
- ShadCN UI
- NextAuth.js
- Prisma + PostgreSQL
- SWR / React Query
- next-pwa
- Jest & Testing Library
- Vercel for deployment

## Tools & Services
- Git/GitHub
- PNPM or npm
- Figma for design mockups
- Postman for API testing
- Bioimpedance device data importer (TBD)

## Directory Structure
