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
- `src/app/api/todos/route.ts` (`GET`/`POST`) and `src/app/api/todos/[id]/route.ts`
  (`DELETE`) — power the Todo dashboard at `/dashboard`.

### Todo dashboard

`/dashboard` lists, adds, and deletes todos (title, due date, assignee,
status). It has no auth yet — anyone who can reach the app can use it. The
page (`src/app/dashboard/page.tsx`) fetches the initial list directly via
`getTodos()`, per Next.js's own guidance to read Server Component data from
its source rather than through a Route Handler; `TodoDashboard.tsx` is the
Client Component that handles the add-modal and delete confirmation, calling
`/api/todos` for mutations.

Mock data lives in `src/lib/mock-todos.ts`, kept in memory behind
`src/lib/backend.ts` — Route Handlers and Server Components never touch it
directly, only ever call `getTodos()` / `createTodo()` / `deleteTodo()`, the
same calls they'll make once a real backend exists. **Caveat:** on a
serverless deployment (e.g. Vercel), [Route Handlers can't share data across
requests](https://nextjs.org/docs/app/guides/backend-for-frontend#deployment-environment)
— different requests can land on different instances — so added/deleted
todos may not reliably persist or stay in sync in production. It's stable
for local development (`npm run dev`). Real persistence requires a real
backend, which is why the swap point exists: point `BACKEND_API_URL` at one
and nothing else here needs to change.

### API contracts (OpenAPI)

Both the BFF's public API (what the frontend calls) and the backend contract
(what `backend.ts` expects from `BACKEND_API_URL`) are documented as OpenAPI
specs under [`openapi/`](./openapi/README.md), including how to generate
TypeScript types and a standalone mock server from them.

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
