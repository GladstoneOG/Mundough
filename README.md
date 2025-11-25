## Mundough storefront

Artisan cookie storefront built with Next.js 16 App Router, Prisma, and Tailwind CSS. Customers can browse rich hero tiles, shop available treats, collect a cart, and send checkout details straight to the kitchen. A hidden PIN-gated admin keeps tiles and products fresh.

## Stack

- Next.js 16 (App Router, React Server Components)
- Tailwind CSS v4
- Prisma ORM targeting @vercel/postgres
- UploadThing for image handling
- Resend for checkout notification emails
- Zustand + React Hook Form on the client side

## Local setup

1. Install dependencies:

	```bash
	npm install
	```

2. Copy `.env.example` to `.env` and fill in the values described below.

3. Push the Prisma schema to your database once you have a `DATABASE_URL`:

	```bash
	npm run db:push
	```

4. Start the dev server:

	```bash
	npm run dev
	```

	The site runs at [http://localhost:3000](http://localhost:3000).

## Required environment variables

| Name | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Vercel Postgres/Neon recommended). |
| `RESEND_API_KEY` | Resend API key used for checkout email notifications. |
| `CHECKOUT_NOTIFICATION_EMAIL` | Recipient address that receives cart submissions. |
| `CHECKOUT_FROM_EMAIL` | Verified Resend sender (e.g. `mundough@yourdomain.com`). |
| `NEXT_PUBLIC_ADMIN_PIN_HASH` | SHA-256 hash of the hidden admin PIN. |
| `UPLOADTHING_SECRET` | UploadThing server secret. |
| `UPLOADTHING_APP_ID` | UploadThing app ID. |
| `NEXT_PUBLIC_UPLOADTHING_APP_ID` | Same value as `UPLOADTHING_APP_ID`, exposed to the client. |

### Admin PIN hash

Generate a SHA-256 hash of the PIN you want to require for admin actions. You can use Node:

```bash
node -e "const { createHash } = require('crypto'); const pin = '12345'; console.log(createHash('sha256').update(pin).digest('hex'));"
```

Drop the resulting hash into `NEXT_PUBLIC_ADMIN_PIN_HASH`. The plain PIN never ships to the client bundle.

## UploadThing configuration

Create an UploadThing project, copy the App ID/Secret to your `.env`, and add the domain `utfs.io` to `next.config.ts` is already configured. Uploaded images automatically return a CDN URL that is stored with each tile/product.

## Emails via Resend

Checkout submissions call `/api/checkout`, which re-validates the cart against the database and sends a summary email via Resend. Make sure the sender address is verified in your Resend dashboard.

## Database management

Prisma is configured for PostgreSQL. Helpful commands:

```bash
npm run db:push      # apply schema changes
npx prisma studio    # inspect and edit data
```

## Deploying to Vercel

Deploy through Vercel as a standard Next.js project. Remember to set all environment variables in the Vercel dashboard and provision a Vercel Postgres database. After deploying, run `prisma migrate deploy` or `prisma db push` via a Vercel deployment script if you alter the schema.
