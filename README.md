# Nutri Health

## Local Development Setup

### 1. Install dependencies

```sh
pnpm install
```

### 2. Start Postgres with Docker Compose

```sh
pnpm dlx docker-compose up -d
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with:

```
DATABASE_URL=postgresql://nutrihealth:nutrihealth@localhost:5432/nutrihealth
```

Also, set up `.env.local` for NextAuth and Google OAuth:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
```

### 4. Run Database Migrations

```sh
pnpm exec prisma migrate dev --name init
```

### 5. Seed the Database (Creates Admin User)

```sh
pnpm seed
```

This will create an admin user:
- **Email:** admin@nutrihealth.local
- **Name:** Admin
- **isAdmin:** true

### 6. Start the Development Server

```sh
pnpm dev
```

App will be available at [http://localhost:3000](http://localhost:3000)

---

## Creating New Migrations & Seeds

### Create a New Migration

If you make changes to your Prisma schema (e.g., add tables, fields, or relations), create a new migration with:

```sh
pnpm exec prisma migrate dev --name <migration-name>
```

Replace `<migration-name>` with a short, descriptive name (e.g., add-user-profile).

This will:
- Generate a new migration file in `prisma/migrations/`
- Apply the migration to your local database

### Update or Create a Seed Script

Edit the `prisma/seed.ts` file to customize your seed data. To run the seed script:

```sh
pnpm seed
```

This command executes the script defined in your `package.json` under the `seed` script (by default, it runs `prisma db seed`).

If you add new tables or relationships, update the seed script to include relevant data.

---

## Admin Access

- Use Google OAuth to sign in.
- To access the admin dashboard, log in with the Google account matching `admin@nutrihealth.local` (ensure your Google account email matches this or update the seed script/email as needed).
- Only users with `isAdmin: true` can access `/admin` routes.

---

## Project Structure & Tech
- Next.js (App Router)
- Prisma ORM + PostgreSQL (Docker)
- NextAuth.js (Google OAuth)
- Tailwind CSS, ShadCN UI
- Zod for validation
- React Query
- PWA support

---

## Troubleshooting
- If migrations fail with `DATABASE_URL` errors, ensure `.env` exists and is correct.
- To reset the database: `docker compose down -v && docker compose up -d && pnpm exec prisma migrate reset`
- For more, see [PLANNING.md](./PLANNING.md)

---

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