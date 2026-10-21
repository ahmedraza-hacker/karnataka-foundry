import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const REGISTRATION_ATTEMPT_LIMIT = 5;
const SHARED_REGISTRATION_KEY = createHash("sha256")
  .update("karnataka-foundry:registration:shared-limit")
  .digest("hex");

export function registrationRateLimitKey(): string {
  return SHARED_REGISTRATION_KEY;
}

export async function isRegistrationRateLimited(): Promise<boolean> {
  const ipHash = registrationRateLimitKey();

  await prisma.$executeRaw`
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
  `;

  const attempt = await prisma.registrationRateLimit.findUnique({
    where: { ipHash: SHARED_REGISTRATION_KEY },
    select: { attempts: true },
  });

  return (attempt?.attempts ?? 0) > REGISTRATION_ATTEMPT_LIMIT;
}
