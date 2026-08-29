This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Architecture

Next.js serves as both the frontend and the BFF (Backend for Frontend):

- UI lives under `src/app/**` (pages, layouts, Server/Client Components).
- The BFF layer lives under `src/app/api/**` (Route Handlers). These run only
  on the server and are the only place allowed to call upstream backend
  services or hold secrets — the browser never talks to the backend directly.
- `src/lib/backend-client.ts` is a thin server-only helper for calling the
  upstream backend from Route Handlers or Server Components, using the
  `BACKEND_API_URL` environment variable (see `.env.example`).
- `src/lib/backend.ts` is the swap point between a mock backend and the real
  one: while `BACKEND_API_URL` is unset it returns data from
  `src/lib/mock-data.ts`; once it's set, the same functions call the real
  backend through `backend-client.ts` instead. Route Handlers should import
  from here rather than calling `backend-client.ts` directly.

Sample BFF endpoints:
- `src/app/api/health/route.ts` — health check.
- `src/app/api/users/route.ts` — returns user data via `src/lib/backend.ts`
  (mock data today; the real backend once `BACKEND_API_URL` is set).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
