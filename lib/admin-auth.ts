import type { Session } from "next-auth";
import { auth } from "@/auth";

export function isAdminSession(session: Session | null): boolean {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();

  return Boolean(configuredEmail && sessionEmail && configuredEmail === sessionEmail);
}

export async function getAdminSession(): Promise<Session | null> {
  const session = await auth();
  return isAdminSession(session) ? session : null;
}
