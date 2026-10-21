import type { Session } from "next-auth";
import { auth } from "@/auth";
import { ADMIN_USER_ID } from "@/lib/auth-identity";

export { ADMIN_USER_ID } from "@/lib/auth-identity";

export type AdminSessionIdentity = Pick<Session, "user"> | null;

export function isAdminSession(
  session: AdminSessionIdentity,
  configuredAdminEmail = process.env.ADMIN_EMAIL,
): boolean {
  const configuredEmail = configuredAdminEmail?.trim().toLowerCase();
  const user = session?.user;
  const sessionEmail = user?.email?.trim().toLowerCase();

  return Boolean(
    configuredEmail &&
      sessionEmail &&
      user?.accountType === "ADMIN" &&
      user.id === ADMIN_USER_ID &&
      !user.companyId &&
      configuredEmail === sessionEmail,
  );
}

export async function getAdminSession(
  resolveSession: () => Promise<Session | null> = auth,
  configuredAdminEmail = process.env.ADMIN_EMAIL,
): Promise<Session | null> {
  const session = await resolveSession();
  return isAdminSession(session, configuredAdminEmail) ? session : null;
}
