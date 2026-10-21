# Karnataka Foundry website

A responsive Next.js app for an industrial AC motor cooling fan manufacturer. It includes a sample product catalogue, a temporary enquiry basket, product detail pages, and a quotation enquiry form backed by PostgreSQL.

## Important status

This is a development foundation, **not a production-ready commerce platform**. It now includes company registration and admin approval, approved-company sign-in, and server-enforced product visibility. Catalog items are illustrative placeholders, not verified Karnataka Foundry products or specifications. No orders or payments are taken. A successful quotation form response means that the enquiry was saved to the configured database; it is not a quote, order confirmation, stock reservation, or response-time commitment.

The following business-critical parts still require implementation and verification before production:

- Image/datasheet upload with safe object storage, and syncing admin-managed database products to the public catalogue.
- Quote preparation and delivery, buyer/supplier workflows, order creation/status tracking, invoices, and CSV export.
- Password recovery, email verification, monitoring, backups, retention/deletion policies, and transactional email.
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
5. Apply the committed schema migrations to this development database: `npm run db:migrate`
6. Insert the clearly marked sample product records: `npm run db:seed`
7. Start the development server: `npm run dev`
8. Open `http://localhost:3000`.

Open `/admin/login` and sign in with the credentials configured by `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH_B64`. The protected `/admin`, `/admin/enquiries`, `/admin/companies`, and `/admin/products` pages redirect visitors without an admin session to the login page. Companies can register at `/company/register`; new accounts remain pending until an administrator approves them at `/admin/companies`. Approved companies can sign in at `/company/login`.

The catalogue merges visible database products with the original `lib/products.ts` sample entries, preferring database records for matching slugs or SKUs. Product visibility is `PUBLIC`, `APPROVED_BUYERS`, or `SELECTED_COMPANIES`; page rendering and `/api/products` apply the same server-side access rules. Products remain public by default. Selected-company access is stored in `CompanyProductAccess`.

## Safe schema migration

The current schema change is additive: it adds company/status/role/visibility enums, nullable company/product relations and new tables, plus a `Product.visibility` column with a `PUBLIC` default. It does not drop or rewrite existing products, enquiries, image references, or admin credentials. Existing products therefore remain public after migration.

- For local development only, configure `.env` with a dedicated development database and run `npm run db:migrate`. Review any generated migration before committing it.
- For a reviewed deployment, first take/verify a database backup and confirm the migration against a staging copy. Then apply the committed migration with `npx prisma migrate deploy` using the deployment's own database environment. Do not use `migrate dev` against production.
- Do not run migrations against production from a developer workstation or use production credentials in a local `.env`. The migration is not applied automatically by the app build.

Product uploads go directly to persistent Vercel Blob storage through a server-authorized admin upload route. Those Blob URLs are public. The product editor rejects a restricted product that still references a public Blob URL, but removing that URL from the product does not delete or revoke the Blob; anyone who already has its URL may still access it. Restricted images are therefore not secure with the current storage setup. Do not upload confidential images to this public store; use private storage with server-authorized delivery and revoke/delete previously uploaded public objects before treating images as private. Private-image storage and delivery are not implemented. Configure `BLOB_READ_WRITE_TOKEN` only in local/deployment environments where uploads are intended. The product model still does not track stock availability. Enquiries submitted through the public form are persisted in PostgreSQL and can be reviewed/status-tracked from the admin dashboard using `NEW`, `REVIEWING`, `QUOTED`, and `CLOSED`.

Company passwords are bcrypt-hashed; company accounts cannot sign in until approved. Admin approval sets the effective company role, while the registration's requested business type is retained separately. Registration rejects unknown fields and cannot assign privileged roles. Registration responses do not disclose whether an email is already registered. A PostgreSQL-backed registration limiter uses a shared hashed key because the application cannot verify that inbound client-IP headers are set only by a trusted proxy. This limits all registrations together and can block legitimate registrations after five attempts in an hour; configure a verified platform-provided client identity before relying on per-client throttling. No proxy-header trust is assumed. Admin JWTs carry a server-issued account type and stable admin subject, and admin access is rechecked against the current configured admin email for each protected request. Previously issued sessions without the account-type claim must sign in again. Reset/recovery and email verification flows are not implemented.


## Useful commands

- `npm run typecheck` — TypeScript check.
- `npm test` — focused company registration validation and product visibility policy tests.
- `npm run lint` — Next.js lint command.
- `npm run build` — production build.
- `npm run db:generate` — regenerate Prisma Client after schema changes.
- `npm run db:migrate` — create/apply local development migrations.
- `npm run db:seed` — upsert sample catalogue records.

## Deployment notes

Deploy the Next.js app to a Node.js-compatible host and PostgreSQL to a managed database. First apply the reviewed additive migration to staging, test public/buyer/selected-company access with separate accounts, and confirm the existing admin login and public catalogue. Back up production, apply the migration through the release process with `npx prisma migrate deploy`, deploy the reviewed application, then verify admin review and account/product access. Configure `DATABASE_URL`, `AUTH_SECRET`, admin credentials, and Blob token only as deployment secrets. Configure HTTPS, production logging/monitoring, backups, and a data retention policy. Do not expose database credentials to browser code or deploy from this workspace without explicit approval.

Before enabling the public enquiry form, add a production-grade rate limiter/spam control, configure a monitored company contact channel, and test database availability and failure handling. Do not announce production readiness until the remaining order, privacy, and operational gaps have been addressed and independently verified.

## Company information needed

- Verified product names, part numbers, images, drawings, materials, dimensions, motor compatibility, and minimum order quantities.
- Confirmed pricing/quote rules, lead times, stock policy, taxes, shipping, and supported order/payment terms.
- Factory/manufacturing photographs and approved descriptions of actual processes and capabilities.
- Legal company name, postal address, phone, monitored email, GSTIN if applicable, and approved privacy/sales terms.
