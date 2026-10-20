# Karnataka Foundry website

A responsive Next.js app for an industrial AC motor cooling fan manufacturer. It includes a sample product catalogue, a temporary enquiry basket, product detail pages, and a quotation enquiry form backed by PostgreSQL.

## Important status

This is a development foundation, **not a production-ready commerce platform**. Catalog items are illustrative placeholders, not verified Karnataka Foundry products or specifications. No orders or payments are taken. A successful quotation form response means that the enquiry was saved to the configured database; it is not a quote, order confirmation, stock reservation, or response-time commitment.

The following business-critical parts still require implementation and verification before production:

- Image/datasheet upload with safe object storage, and syncing admin-managed database products to the public catalogue.
- Quote preparation and delivery, customer accounts, order creation/status tracking, invoices, and CSV export.
- Form rate limiting and robust spam protection, monitoring, backups, retention/deletion policies, and transactional email.
- Final privacy notice, sales terms, verified company contact/legal details, and review of security and accessibility.
- A real payment provider and server-side payment verification, if online payments are eventually enabled.

Do not treat the current enquiry API as a substitute for the missing controls above. No payment card details are requested or stored.

## Requirements

- Node.js 20 or later and npm.
- PostgreSQL 14 or later.

## Local setup

1. Install Node.js and PostgreSQL.
2. Copy `.env.example` to `.env` and configure `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH_B64`, and `BLOB_READ_WRITE_TOKEN`. Use a unique random auth secret, a base64-encoded bcrypt hash for the admin password, and a Vercel Blob read/write token; never put a plaintext password or provider token in source control. Keep `.env` private.
3. Install dependencies: `npm install`
4. Generate the Prisma client: `npm run db:generate`
5. Apply the initial schema migration: `npm run db:migrate`
6. Insert the clearly marked sample product records: `npm run db:seed`
7. Start the development server: `npm run dev`
8. Open `http://localhost:3000`.

Open `/admin/login` and sign in with the credentials configured by `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH_B64`. The protected `/admin`, `/admin/enquiries`, and `/admin/products` pages redirect visitors without an admin session to the login page.

The public product catalogue merges database products with the original `lib/products.ts` sample entries, preferring database records for matching slugs or SKUs. Apply the additive `imageUrl` migration with `npx prisma migrate deploy` before running the updated app; it adds one nullable column and does not modify or delete existing product records. Product uploads go directly to persistent Vercel Blob storage through a server-authorized upload route, and the resulting public Blob URL is saved on the Prisma product. Configure `BLOB_READ_WRITE_TOKEN` in local and deployment environments before enabling product image uploads. The existing product model still does not track stock availability. Admin pages and admin APIs require a valid NextAuth session for the configured admin email. Enquiries submitted through the public form are persisted in PostgreSQL and can be reviewed and status-tracked from the admin dashboard. The enquiry workflow uses the existing `NEW`, `REVIEWING`, `QUOTED`, and `CLOSED` statuses.


## Useful commands

- `npm run typecheck` — TypeScript check.
- `npm run lint` — Next.js lint command.
- `npm run build` — production build.
- `npm run db:generate` — regenerate Prisma Client after schema changes.
- `npm run db:migrate` — create/apply local development migrations.
- `npm run db:seed` — upsert sample catalogue records.

## Deployment notes

Deploy the Next.js app to a Node.js-compatible host and PostgreSQL to a managed database. Configure `DATABASE_URL` as a deployment secret and apply reviewed migrations as part of release operations. Configure HTTPS, production logging/monitoring, backups, and a data retention policy. Do not expose database credentials to browser code.

Before enabling the public enquiry form, add a production-grade rate limiter/spam control, configure a monitored company contact channel, and test database availability and failure handling. Do not announce production readiness until the remaining order, privacy, and operational gaps have been addressed and independently verified.

## Company information needed

- Verified product names, part numbers, images, drawings, materials, dimensions, motor compatibility, and minimum order quantities.
- Confirmed pricing/quote rules, lead times, stock policy, taxes, shipping, and supported order/payment terms.
- Factory/manufacturing photographs and approved descriptions of actual processes and capabilities.
- Legal company name, postal address, phone, monitored email, GSTIN if applicable, and approved privacy/sales terms.
