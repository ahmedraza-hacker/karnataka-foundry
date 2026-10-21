export const ADMIN_USER_ID = "karnataka-foundry-admin";

export type AccountType = "ADMIN" | "COMPANY";

export function getAccountType(identity: {
  id?: string;
  accountType?: string;
}): AccountType {
  return identity.accountType === "ADMIN" && identity.id === ADMIN_USER_ID
    ? "ADMIN"
    : "COMPANY";
}
