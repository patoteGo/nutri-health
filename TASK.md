# Task Board

## Backlog

- [x] Add Breadcrumb in header using shadcn/ui [2025-04-18]
- [x] Add PWA support using next-pwa, manifest, service worker, and offline installability [2025-04-19]

## Discovered During Work
- Replace mock data with live data from API when available (people, weeks, meals)
- Add form submission and validation logic
- Add loading/skeleton states for selectors if data is async

- [ ] Implement multilingual support (English & Portuguese; default language auto-detected from user device). [Added: 2025-04-18]
  - [ ] Internationalize all UI strings (discovered during implementation)
  - [ ] Internationalize all UI strings (discovered during implementation)
- [ ] Scaffold Next.js project with PWA & Tailwind
- [ ] Integrate ShadCN UI components
- [ ] Set up NextAuth.js with Google login
- [ ] Configure next-pwa for offline support
- [ ] Initialize Prisma and create schema (users, meals, ingredients, metrics)
- [ ] Run Prisma migrations and connect to Postgres
- [ ] Add Docker Compose for local Postgres
- [ ] Build CRUD API for meals and ingredients
- [ ] Implement admin UI for managing meals
- [x] Log a Meal: UI & Mocks (choose meal, select person, add meal parts: name, grams, photo; mock data only) [2025-04-18]
  - [x] Log a Meal: UI selectors page (person, meal, week, option) [2025-04-18]
  - [ ] Log a Meal: Add meal parts list UI (dynamic rows: name, grams, image, add button) using shadcn/ui in /app/log-meal/page.tsx [2025-04-18]
- [ ] Log a Meal: Backend & Auth Integration (persist meal, associate with user, secure endpoints) [2025-04-18]
- [ ] Calculate calories per meal and suggest alternatives
- [ ] Add gamification: weekly goals, badges, progress charts
- [ ] Build user profile page for bioimpedance data
- [ ] Placeholder: Bioimpedance device data importer
- [ ] Integrate Zod for all API/data validation
- [x] Set up Vitest & React Testing Library tests [2025-04-18]
  - [x] Test: expected use [2025-04-18]
  - [x] Test: edge case [2025-04-18]
  - [x] Test: failure case [2025-04-18]
- [x] Create /tests directory and mirror app structure [2025-04-18]
- [ ] Configure CI/CD pipeline on GitHub Actions
- [ ] Add Vercel deployment config

## In Progress
- [ ] Admin Dashboard Epic: Build advanced weekly meal planner for each person [2025-04-19]
  - [ ] Step 1: Person Selector — Select a person from the DB to manage their meals [2025-04-19]
  - [ ] Step 2: Menu Builder — Create/edit menus (meals) with:
      - Ingredients (with weights)
      - Categories (Lunch, Dinner, etc.) [2025-04-19]
  - [ ] Step 3: Drag-and-Drop UI — Assign built menus to each day/meal moment in a weekly calendar (drag and drop support) [2025-04-19]
  - [ ] Step 4: Save/Update — Persist weekly plan changes for the selected person [2025-04-19]
  - [ ] Step 5: API & DB — Ensure backend supports menus, ingredients, assignments, and validation [2025-04-19]
  - [ ] Step 6: Tests — Add/expand unit and integration tests for all new features [2025-04-19]
  - [ ] Step 7: UI Polish — Improve UX, loading, error states, and accessibility [2025-04-19]
- [ ] Tailwind & ShadCN setup
- [ ] NextAuth.js configuration

## Done
- [x] Add Breadcrumb in header using shadcn/ui [2025-04-18]
- [x] Set up Vitest & React Testing Library tests [2025-04-18]
  - [x] Test: expected use [2025-04-18]
  - [x] Test: edge case [2025-04-18]
  - [x] Test: failure case [2025-04-18]
- [x] Create /tests directory and mirror app structure [2025-04-18]
- [x] Repository scaffolding
- [x] Basic Next.js & Tailwind installation

## Discovered During Work
- [ ] Migrated from jest-dom matchers to Vitest built-in matchers for compatibility.
- [ ] Updated tests to use getByRole for language switcher buttons to avoid ambiguity with aria-label.
- [ ] [Add any new TODOs here as development progresses]