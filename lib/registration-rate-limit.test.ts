import assert from "node:assert/strict";
import test from "node:test";
import { registrationRateLimitKey } from "@/lib/registration-rate-limit";

test("registration throttling uses a shared server-side key, not client-supplied IP headers", () => {
  const firstKey = registrationRateLimitKey();
  const secondKey = registrationRateLimitKey();

  assert.match(firstKey, /^[a-f0-9]{64}$/);
  assert.equal(secondKey, firstKey);
});
