## Task Tracker (Internal SaaS)

Internal Task Management and Tracking System for:

- Ashlab Technologies
- Quodel Technologies Limited

### Why there is no Register page

This is an internal enterprise platform. Users are provisioned by HR/Admin, not self-registered.

- Bootstrap users are created via seed script.
- After login, `ADMIN` users can create employees and promote team leads from dashboard.

### Initial setup

1. Ensure `.env` contains `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
2. Run migrations and generate Prisma client:

```bash
npm run db:migrate
npm run db:generate
```

3. Seed initial companies/departments/users:

```bash
npm run db:seed
```

If migrations are already present and you only need local schema sync + seed:

```bash
npx prisma migrate deploy
npm run db:generate
npm run db:seed
```

Optional custom default password:

```bash
SEED_DEFAULT_PASSWORD="YourStrongPassword" npm run db:seed
```

### Platform Owner login (demo/local)

- Default username/email: `platform@sprintdesk.local`
- Default password: `password`
- You can override with env vars before seeding:

```bash
BOOTSTRAP_PLATFORM_OWNER_EMAIL="your-demo-id@local" \
BOOTSTRAP_PLATFORM_OWNER_PASSWORD="your-password" \
BOOTSTRAP_PLATFORM_OWNER_USERNAME="platform_owner" \
npm run db:seed
```

`BOOTSTRAP_PLATFORM_OWNER_USERNAME` lets you sign in with a username alias (no real email provider required in local/dev).

### Starter login accounts

- `superadmin@ashlab.internal` (SUPER_ADMIN)
- `admin@ashlab.internal` (ADMIN)
- `lead@ashlab.internal` (TEAM_LEAD)
- `employee@ashlab.internal` (EMPLOYEE)
- `admin@quodel.internal` (ADMIN)
- `lead@quodel.internal` (TEAM_LEAD)
- `employee@quodel.internal` (EMPLOYEE)

Password: value from `SEED_DEFAULT_PASSWORD` or fallback `ChangeMe@123`.

### Run app

```bash
npm run dev
```

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
