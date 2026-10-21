import assert from "node:assert/strict";
import test from "node:test";
import { CompanyRole, CompanyStatus } from "@prisma/client";
import { isApprovedCompany } from "@/lib/company-auth";
import { companyRegistrationSchema } from "@/lib/company-schemas";

const validRegistration = {
  companyName: "Example Industrial",
  contactName: "A Person",
  email: "BUYER@EXAMPLE.COM",
  phone: "+91 98765 43210",
  password: "a-long-example-password",
  requestedRole: "BUYER",
  city: "Bengaluru",
  state: "Karnataka",
  gstin: "",
};

test("registration normalizes email and allows an omitted GSTIN", () => {
  const parsed = companyRegistrationSchema.parse(validRegistration);
  assert.equal(parsed.email, "buyer@example.com");
  assert.equal(parsed.gstin, null);
  assert.equal(parsed.requestedRole, "BUYER");
});

test("registration rejects weak passwords and invalid GSTIN values", () => {
  assert.equal(
    companyRegistrationSchema.safeParse({ ...validRegistration, password: "short" }).success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({ ...validRegistration, gstin: "NOT-A-GSTIN" }).success,
    false,
  );
});

test("registration rejects privileged roles and extra privilege fields", () => {
  assert.equal(
    companyRegistrationSchema.safeParse({
      ...validRegistration,
      requestedRole: "ADMIN",
    }).success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({
      ...validRegistration,
      role: "ADMIN",
      status: "APPROVED",
    }).success,
    false,
  );
});

test("only companies currently approved with an assigned role can access protected features", () => {
  assert.equal(isApprovedCompany({ status: CompanyStatus.APPROVED, role: CompanyRole.BUYER }), true);
  assert.equal(isApprovedCompany({ status: CompanyStatus.PENDING, role: CompanyRole.BUYER }), false);
  assert.equal(isApprovedCompany({ status: CompanyStatus.REJECTED, role: CompanyRole.BUYER }), false);
  assert.equal(isApprovedCompany({ status: CompanyStatus.SUSPENDED, role: CompanyRole.BUYER }), false);
  assert.equal(isApprovedCompany({ status: CompanyStatus.APPROVED, role: null }), false);
  assert.equal(isApprovedCompany(null), false);
});
