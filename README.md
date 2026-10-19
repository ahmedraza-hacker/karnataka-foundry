# Karnataka Foundry website

A responsive Next.js app for an industrial AC motor cooling fan manufacturer. It includes a sample product catalogue, a temporary enquiry basket, product detail pages, and a quotation enquiry form backed by PostgreSQL.

## Important status

This is a development foundation, **not a production-ready commerce platform**. Catalog items are illustrative placeholders, not verified Karnataka Foundry products or specifications. No orders or payments are taken. A successful quotation form response means that the enquiry was saved to the configured database; it is not a quote, order confirmation, stock reservation, or response-time commitment.

The following business-critical parts still require implementation and verification before production:

- Staff/customer authentication, role-based authorization, admin screens, and protected order/enquiry access.
- Product catalogue administration and image/datasheet upload with safe object storage.
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
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a database you control. Keep the real `.env` file private.
3. Install dependencies: `npm install`
4. Generate the Prisma client: `npm run db:generate`
5. Apply the initial schema migration: `npm run db:migrate`
6. Insert the clearly marked sample product records: `npm run db:seed`
7. Start the development server: `npm run dev`
8. Open `http://localhost:3000`.

The public catalogue currently reads its sample entries from `lib/products.ts`; seeding creates corresponding database rows for the future database-backed product management integration. The enquiry form is the only business workflow currently persisted in PostgreSQL.

## Useful commands

- `npm run typecheck` — TypeScript check.
- `npm run lint` — Next.js lint command.
- `npm run build` — production build.
- `npm run db:generate` — regenerate Prisma Client after schema changes.
- `npm run db:migrate` — create/apply local development migrations.
- `npm run db:seed` — upsert sample catalogue records.

## Deployment notes

Deploy the Next.js app to a Node.js-compatible host and PostgreSQL to a managed database. Configure `DATABASE_URL` as a deployment secret and apply reviewed migrations as part of release operations. Configure HTTPS, production logging/monitoring, backups, and a data retention policy. Do not expose database credentials to browser code.

Before enabling the public enquiry form, add a production-grade rate limiter/spam control, configure a monitored company contact channel, and test database availability and failure handling. Do not announce production readiness until the incomplete access-control, admin, order, privacy, and operational requirements above have been completed and independently verified.

## Company information needed

- Verified product names, part numbers, images, drawings, materials, dimensions, motor compatibility, and minimum order quantities.
- Confirmed pricing/quote rules, lead times, stock policy, taxes, shipping, and supported order/payment terms.
- Factory/manufacturing photographs and approved descriptions of actual processes and capabilities.
- Legal company name, postal address, phone, monitored email, GSTIN if applicable, and approved privacy/sales terms.
