import type { CompanyRole, CompanyStatus } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import type { AccountType } from "@/lib/auth-identity";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountType?: AccountType;
      companyId?: string;
      companyRole?: CompanyRole | null;
      companyStatus?: CompanyStatus;
    } & DefaultSession["user"];
  }

  interface User {
    accountType?: AccountType;
    companyId?: string;
    companyRole?: CompanyRole | null;
    companyStatus?: CompanyStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountType?: AccountType;
    companyId?: string;
    companyRole?: CompanyRole | null;
    companyStatus?: CompanyStatus;
  }
}
