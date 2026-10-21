import assert from "node:assert/strict";
import test from "node:test";
import type { Session } from "next-auth";
import { getAccountType } from "@/lib/auth-identity";
import { ADMIN_USER_ID, getAdminSession, isAdminSession } from "@/lib/admin-auth";

function makeSession({
  id,
  email,
  accountType,
  companyId,
}: {
  id: string;
  email: string;
  accountType: "ADMIN" | "COMPANY";
  companyId?: string;
}): Session {
  return {
    expires: "2099-01-01",
    user: {
      id,
      name: "Test user",
      email,
      accountType,
      companyId,
    },
  };
}

test("company sessions cannot access admin authorization, including with the admin email", () => {
  const companySession = makeSession({
    id: "company-cuid",
    email: "admin@example.com",
    accountType: "COMPANY",
    companyId: "company-cuid",
  });

  assert.equal(isAdminSession(companySession, "admin@example.com"), false);
});

test("changing ADMIN_EMAIL cannot promote an existing company JWT", () => {
  const companySession = makeSession({
    id: "company-cuid",
    email: "company@example.com",
    accountType: "COMPANY",
    companyId: "company-cuid",
  });

  assert.equal(isAdminSession(companySession, "company@example.com"), false);
});

test("only the configured server-issued admin identity receives an admin JWT role", () => {
  assert.equal(getAccountType({ id: ADMIN_USER_ID, accountType: "ADMIN" }), "ADMIN");
  assert.equal(getAccountType({ id: "company-cuid", accountType: "ADMIN" }), "COMPANY");
  assert.equal(getAccountType({ id: ADMIN_USER_ID, accountType: "COMPANY" }), "COMPANY");
});

test("only the explicit server-issued admin identity with current configured email is accepted", () => {
  const adminSession = makeSession({
    id: ADMIN_USER_ID,
    email: "admin@example.com",
    accountType: "ADMIN",
  });

  assert.equal(isAdminSession(adminSession, "admin@example.com"), true);
  assert.equal(isAdminSession(adminSession, "new-admin@example.com"), false);
  assert.equal(
    isAdminSession(
      makeSession({
        id: "company-cuid",
        email: "admin@example.com",
        accountType: "ADMIN",
        companyId: "company-cuid",
      }),
      "admin@example.com",
    ),
    false,
  );
});

test("the shared admin guard denies company sessions for admin-only mutation routes", async () => {
  const companySession = makeSession({
    id: "company-cuid",
    email: "buyer@example.com",
    accountType: "COMPANY",
    companyId: "company-cuid",
  });
  const adminSession = makeSession({
    id: ADMIN_USER_ID,
    email: "admin@example.com",
    accountType: "ADMIN",
  });

  for (const capability of ["approve", "change role", "suspend", "grant product access"]) {
    assert.equal(
      await getAdminSession(async () => companySession, "admin@example.com"),
      null,
      `${capability} rejects a company session`,
    );
    assert.equal(
      (await getAdminSession(async () => adminSession, "admin@example.com"))?.user.id,
      ADMIN_USER_ID,
      `${capability} accepts the configured admin identity`,
    );
  }
});
