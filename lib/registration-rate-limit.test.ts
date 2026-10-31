import assert from "node:assert/strict";
import test from "node:test";
import {
  getRegistrationRateLimitAddress,
  registrationRateLimitKey,
} from "@/lib/registration-rate-limit";

test("registration throttling derives a stable, private key per client address", () => {
  const originalAuthSecret = process.env.AUTH_SECRET;

  try {
    process.env.AUTH_SECRET = "test-stable-auth-secret";

    const firstAddressKey = registrationRateLimitKey("203.0.113.10", true);
    const sameAddressKey = registrationRateLimitKey("203.0.113.10", true);
    const otherAddressKey = registrationRateLimitKey("203.0.113.11", true);

    assert.match(firstAddressKey, /^[a-f0-9]{64}$/);
    assert.equal(sameAddressKey, firstAddressKey);
    assert.notEqual(otherAddressKey, firstAddressKey);
    assert.equal(firstAddressKey.includes("203.0.113.10"), false);

    delete process.env.AUTH_SECRET;
    assert.throws(() => registrationRateLimitKey("203.0.113.10", true), /AUTH_SECRET/);
  } finally {
    if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = originalAuthSecret;
  }
});

test("registration trusts Vercel's forwarded address and ignores other client headers", () => {
  assert.equal(
    getRegistrationRateLimitAddress(
      new Headers({ "x-forwarded-for": "203.0.113.10" }),
      true,
    ),
    "203.0.113.10",
  );
  assert.equal(
    getRegistrationRateLimitAddress(
      new Headers({ "x-forwarded-for": "invalid", "x-real-ip": "203.0.113.11" }),
      true,
    ),
    null,
  );
  assert.equal(getRegistrationRateLimitAddress(new Headers({ "x-real-ip": "203.0.113.11" }), true), null);
  assert.equal(getRegistrationRateLimitAddress(new Headers(), true), null);
  assert.equal(getRegistrationRateLimitAddress(new Headers(), false), "local");
});
