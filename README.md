# MakerHub Frontend

Nuxt 4 frontend for MakerHub. This app consumes the MakerHub backend API, so the backend must be configured and running before login and API-backed pages will work.

## Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/).
   - Use the LTS version.
   - Verify the installation:

     ```bash
     node --version
     npm --version
     ```

2. Install pnpm:

   ```bash
   npm install -g pnpm
   ```

   Verify the installation:

   ```bash
   pnpm --version
   ```

## Backend Requirement

This frontend needs the backend API to be running.

Expected local API URL:

```bash
http://localhost:4000
```

Start the backend from the backend app directory:

```bash
cd ../be
pnpm install
pnpm migrate:run
pnpm seed:run
pnpm dev
```

Keep the backend terminal running while using the frontend.

## Frontend Setup

Run these commands from the frontend directory:

```bash
cd fe
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the backend API URL in `.env`:

```env
API_BASE_URL=http://localhost:4000
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

If your backend runs on a different port, update `API_BASE_URL` to match it.

## Run the App

Start the Nuxt development server:

```bash
pnpm dev
```

Open the app in your browser:

```bash
http://localhost:3000
```

## Login Accounts

After the backend migrations and seeders have run, use one of these seeded accounts:

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Admin | Alex Admin | `admin@gmail.com` | `Password1_` |
| Mentor | Rezi Mentor | `rezi.mentor@gmail.com` | `Password1_` |
| Student | Lexi Student | `lexi.student@gmail.com` | `Password1_` |

## Useful Commands

```bash
pnpm dev       # Start local development server
pnpm build     # Build for production
pnpm test:run  # Run Vitest tests once
pnpm test:e2e  # Run Playwright tests
pnpm lint      # Run ESLint
```

## Troubleshooting

- If login fails, confirm the backend is running and `API_BASE_URL` points to it.
- If seeded accounts do not work, rerun backend migrations and seeders from `be/`.
- If dependencies fail to install, confirm Node.js and pnpm are installed correctly.
