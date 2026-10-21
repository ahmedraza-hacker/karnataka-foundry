CREATE TYPE "CompanyRole" AS ENUM ('BUYER', 'SUPPLIER', 'BOTH');
CREATE TYPE "CompanyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ProductVisibility" AS ENUM ('PUBLIC', 'APPROVED_BUYERS', 'SELECTED_COMPANIES');

ALTER TABLE "Product"
ADD COLUMN "visibility" "ProductVisibility" NOT NULL DEFAULT 'PUBLIC';

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "requestedRole" "CompanyRole" NOT NULL,
    "role" "CompanyRole",
    "status" "CompanyStatus" NOT NULL DEFAULT 'PENDING',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "gstin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyProductAccess" (
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyProductAccess_pkey" PRIMARY KEY ("companyId", "productId")
);

CREATE TABLE "RegistrationRateLimit" (
    "ipHash" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RegistrationRateLimit_pkey" PRIMARY KEY ("ipHash")
);

CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");
CREATE INDEX "Company_status_createdAt_idx" ON "Company"("status", "createdAt");
CREATE INDEX "CompanyProductAccess_productId_idx" ON "CompanyProductAccess"("productId");

ALTER TABLE "CompanyProductAccess"
ADD CONSTRAINT "CompanyProductAccess_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyProductAccess"
ADD CONSTRAINT "CompanyProductAccess_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
