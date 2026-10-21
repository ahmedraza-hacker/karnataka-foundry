
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { CompanyRole, CompanyStatus } from "@prisma/client";
import { ADMIN_USER_ID, getAccountType } from "@/lib/auth-identity";
import { prisma } from "@/lib/prisma";

function isCompanyRole(value: unknown): value is CompanyRole {
  return value === CompanyRole.BUYER || value === CompanyRole.SUPPLIER || value === CompanyRole.BOTH;
}

function isCompanyStatus(value: unknown): value is CompanyStatus {
  return (
    value === CompanyStatus.PENDING ||
    value === CompanyStatus.APPROVED ||
    value === CompanyStatus.REJECTED ||
    value === CompanyStatus.SUSPENDED
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  providers: [
    Credentials({
      name: "Admin Login",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const submittedEmail = credentials.email.trim().toLowerCase();
        const adminEmail = process.env.ADMIN_EMAIL;
        const encodedHash = process.env.ADMIN_PASSWORD_HASH_B64;

        if (
          adminEmail &&
          encodedHash &&
          submittedEmail === adminEmail.trim().toLowerCase()
        ) {
          try {
            const passwordHash = Buffer.from(encodedHash, "base64").toString("utf8");
            if (!(await bcrypt.compare(credentials.password, passwordHash))) {
              return null;
            }

            return {
              id: ADMIN_USER_ID,
              name: "Karnataka Foundry Admin",
              email: adminEmail,
              accountType: "ADMIN" as const,
            };
          } catch {
            return null;
          }
        }

        if (!process.env.DATABASE_URL) return null;

        try {
          const company = await prisma.company.findUnique({
            where: { email: submittedEmail },
            select: {
              id: true,
              email: true,
              contactName: true,
              passwordHash: true,
              role: true,
              status: true,
            },
          });

          if (
            !company ||
            company.status !== "APPROVED" ||
            !company.role ||
            !(await bcrypt.compare(credentials.password, company.passwordHash))
          ) {
            return null;
          }

          return {
            id: company.id,
            name: company.contactName,
            email: company.email,
            accountType: "COMPANY" as const,
            companyId: company.id,
            companyRole: company.role,
            companyStatus: company.status,
          };
        } catch {
          console.error("Company credentials could not be verified.");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accountType = getAccountType(user);
        if (token.accountType === "COMPANY" && typeof user.companyId === "string") {
          token.companyId = user.companyId;
        } else {
          delete token.companyId;
        }
        if (token.accountType === "COMPANY" && (user.companyRole === null || isCompanyRole(user.companyRole))) {
          token.companyRole = user.companyRole;
        } else {
          delete token.companyRole;
        }
        if (token.accountType === "COMPANY" && isCompanyStatus(user.companyStatus)) {
          token.companyStatus = user.companyStatus;
        } else {
          delete token.companyStatus;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        if (token.accountType === "ADMIN" || token.accountType === "COMPANY") {
          session.user.accountType = token.accountType;
        }
        if (token.accountType === "COMPANY" && typeof token.companyId === "string") {
          session.user.companyId = token.companyId;
        }
        if (token.accountType === "COMPANY" && (token.companyRole === null || isCompanyRole(token.companyRole))) {
          session.user.companyRole = token.companyRole;
        }
        if (token.accountType === "COMPANY" && isCompanyStatus(token.companyStatus)) {
          session.user.companyStatus = token.companyStatus;
        }
      }
      return session;
    },
  },
});
