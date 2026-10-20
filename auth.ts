
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
        const adminEmail = process.env.ADMIN_EMAIL;
        const encodedHash = process.env.ADMIN_PASSWORD_HASH_B64;

        if (
          !adminEmail ||
          !encodedHash ||
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const emailMatches =
          credentials.email.trim().toLowerCase() ===
          adminEmail.trim().toLowerCase();

        if (!emailMatches) {
          return null;
        }

        try {
          const passwordHash = Buffer.from(
            encodedHash,
            "base64"
          ).toString("utf8");

          const passwordMatches = await bcrypt.compare(
            credentials.password,
            passwordHash
          );

          if (!passwordMatches) {
            return null;
          }

          return {
            id: "karnataka-foundry-admin",
            name: "Karnataka Foundry Admin",
            email: adminEmail,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
