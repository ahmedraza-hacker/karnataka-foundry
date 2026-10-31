import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { prisma } from "@/lib/prisma";

const REGISTRATION_ATTEMPT_LIMIT = 5;

export function getRegistrationRateLimitAddress(
  headers: Headers,
  isProduction = process.env.NODE_ENV === "production",
): string | null {
  const forwardedAddress = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (forwardedAddress && isIP(forwardedAddress)) return forwardedAddress;

  return isProduction ? null : "local";
}

export function registrationRateLimitKey(
  clientAddress: string,
  isProduction = process.env.NODE_ENV === "production",
): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && isProduction) {
    throw new Error("AUTH_SECRET must be configured for production registration rate limiting.");
  }

  return createHmac(
    "sha256",
    secret ?? "local-registration-rate-limit-key",
  )
    .update(`karnataka-foundry:registration:${clientAddress}`)
    .digest("hex");
}

export async function isRegistrationRateLimited(clientAddress: string): Promise<boolean> {
  const ipHash = registrationRateLimitKey(clientAddress);
  const [attempt] = await prisma.$queryRaw<{ attempts: number }[]>`
    INSERT INTO "RegistrationRateLimit" ("ipHash", "windowStartedAt", "attempts")
    VALUES (${ipHash}, NOW(), 1)
    ON CONFLICT ("ipHash") DO UPDATE
    SET
      "windowStartedAt" = CASE
        WHEN "RegistrationRateLimit"."windowStartedAt" <= NOW() - INTERVAL '1 hour'
        THEN NOW()
        ELSE "RegistrationRateLimit"."windowStartedAt"
      END,
      "attempts" = CASE
        WHEN "RegistrationRateLimit"."windowStartedAt" <= NOW() - INTERVAL '1 hour'
        THEN 1
        ELSE "RegistrationRateLimit"."attempts" + 1
      END
    RETURNING "attempts"
  `;

  if (!attempt) {
    throw new Error("Registration rate-limit attempt was not recorded.");
  }

  return attempt.attempts > REGISTRATION_ATTEMPT_LIMIT;
}
