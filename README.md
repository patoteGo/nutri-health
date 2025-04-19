# Nutrition App

This repository contains a Next.js PWA nutrition app built with Tailwind CSS and ShadCN components. It helps manage meals, users, and dietary tracking.

## Features
- **Authentication**: Google Login (OAuth 2.0)
- **User Sessions**: Secure session management per user
- **Meals**: Support for 6 meals per day: breakfast, brunch, lunch, afternoon snack, dinner, after dinner
- **Admin Zone**: Add, edit, and remove meals with images, ingredients, weights, automatic calorie calculation, and alternative suggestions
- **Gamification**: Weekly goals, badges, and progress tracking to encourage adherence
- **PWA Support**: Offline functionality and installable as a web app on mobile devices
- **Bioimpedance Data**: Track weight, fat mass, muscle mass, and other metrics via manual input
- **Testing**: Vitest & React Testing Library coverage for all features
- **Breadcrumb Navigation**: Dynamic breadcrumb in the header (using shadcn/ui) reflects the current route for user-friendly navigation. Fully tested.

## Technologies
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, ShadCN UI
- **Auth**: NextAuth.js with Google Provider
- **Database**: Prisma ORM with PostgreSQL (or SQLite for development)
- **Data Fetching**: SWR or React Query
- **PWA**: next-pwa
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel (or any Node.js hosting)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/nutrition-app.git
   cd nutrition-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the values in the `.env` file with your configuration.

## PWA Support

This app is a Progressive Web App (PWA) using [next-pwa](https://github.com/shadowwalker/next-pwa):
- Offline support and installability on mobile/desktop
- Manifest and icons in `/public/manifest.json` and `/public/`
- Service worker auto-generated in production builds

### How to test PWA locally
1. Run a production build:
   ```bash
   pnpm build && pnpm start
   ```
2. Open [http://localhost:3000](http://localhost:3000) in Chrome/Edge/Firefox.
3. Use DevTools > Application tab to verify manifest & service worker.
4. Click the install button in the browser address bar or menu to install as an app.

### Manifest & Icons
- Edit `/public/manifest.json` to change app name, theme, or icons.
- Place additional icons in `/public/` as needed for better device support.

### next-pwa configuration
- See `next.config.js` for caching and service worker options.
- Service worker is disabled in development mode by default.