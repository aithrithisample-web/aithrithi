import prisma from "@/lib/prisma";
import {
  verifyEntitlementToken,
  PLAN_DEFAULT_ENTITLEMENTS,
  LicenseEntitlements,
  PlanTier,
} from "@avro/license-core";
import { invalidateStorePermissionsCache } from "@/lib/permissions";

const SECRET = process.env.LICENSE_HMAC_SECRET || "technext_avro_license_hmac_master_secret_2026";

export interface LicenseStatusResult {
  valid: boolean;
  status: string;
  plan: PlanTier;
  entitlements: LicenseEntitlements;
  domain: string;
  expiresAt: string;
  isGracePeriod: boolean;
  message?: string;
}

// In-memory micro-cache for license status
let cachedLicenseStatus: LicenseStatusResult | null = null;
let cachedLicenseStatusTimestamp = 0;
const LICENSE_STATUS_CACHE_TTL_MS = 15000;

// Auto-sync intervals with Central:
// If active: auto-check Central every 2.5 minutes (150,000 ms)
// If expired/suspended/expiring: auto-check Central every 20 seconds (20,000 ms)
const AUTO_SYNC_ACTIVE_INTERVAL_MS = 150000;
const AUTO_SYNC_RECOVERY_INTERVAL_MS = 20000;

let inFlightSyncPromise: Promise<any> | null = null;

export function cleanCentralUrl(url?: string | null): string {
  const raw = (url && typeof url === "string" && url.trim().length > 0)
    ? url
    : (process.env.CENTRAL_API_URL || "https://avrocentral.vercel.app/api/v1");
  return raw
    .trim()
    .replace(/^["'\\]+|["'\\]+$/g, "")
    .trim()
    .replace(/\/+$/, "");
}

export function invalidateLicenseStatusCache() {
  cachedLicenseStatus = null;
  cachedLicenseStatusTimestamp = 0;
}

function formatLicenseResult(cache: any): LicenseStatusResult {
  const now = new Date();
  const isGrace = now < cache.gracePeriodUntil && now > cache.expiresAt;
  const isExpired = now > cache.gracePeriodUntil || now > cache.expiresAt;

  let entitlements = PLAN_DEFAULT_ENTITLEMENTS.PLUS;
  try {
    entitlements = JSON.parse(cache.entitlementsJson);
  } catch (e) {
    // fallback
  }

  const isInvalid = isExpired || (cache.status !== "ACTIVE" && cache.status !== "TRIAL");

  if (isInvalid) {
    return {
      valid: false,
      status: cache.status === "ACTIVE" ? "EXPIRED" : cache.status,
      plan: cache.plan as PlanTier,
      entitlements,
      domain: cache.domain,
      expiresAt: cache.expiresAt ? new Date(cache.expiresAt).toISOString() : new Date().toISOString(),
      isGracePeriod: false,
      message: `License is ${cache.status}. Storefront is currently in scheduled maintenance.`,
    };
  }

  const result: LicenseStatusResult = {
    valid: true,
    status: cache.status,
    plan: cache.plan as PlanTier,
    entitlements,
    domain: cache.domain,
    expiresAt: cache.expiresAt ? new Date(cache.expiresAt).toISOString() : new Date().toISOString(),
    isGracePeriod: isGrace,
    message: isGrace ? "Operating within 72-hour offline grace period." : "License active and in good standing.",
  };

  cachedLicenseStatus = result;
  cachedLicenseStatusTimestamp = Date.now();

  return result;
}

/**
 * Retrieves the local license cache, automatically syncs with Central API when stale or expiring,
 * and seamlessly executes automatic plan upgrades or downgrades.
 */
export async function getStoreLicenseStatus(options?: { forceSync?: boolean }): Promise<LicenseStatusResult> {
  const nowMs = Date.now();
  if (!options?.forceSync && cachedLicenseStatus && nowMs - cachedLicenseStatusTimestamp < LICENSE_STATUS_CACHE_TTL_MS) {
    return cachedLicenseStatus;
  }

  try {
    const cache = await prisma.licenseCache.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!cache) {
      return {
        valid: true,
        status: "ACTIVE",
        plan: "PLUS",
        entitlements: PLAN_DEFAULT_ENTITLEMENTS.PLUS,
        domain: process.env.STORE_DOMAIN || "localhost",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isGracePeriod: false,
        message: "Standalone license active.",
      };
    }

    const lastValidated = cache.lastValidatedAt ? new Date(cache.lastValidatedAt).getTime() : 0;
    const isPastExpiry = cache.expiresAt && (new Date(cache.expiresAt).getTime() <= nowMs);
    const isNotActive = cache.status !== "ACTIVE";
    const syncInterval = (isNotActive || isPastExpiry) ? AUTO_SYNC_RECOVERY_INTERVAL_MS : AUTO_SYNC_ACTIVE_INTERVAL_MS;
    const isStale = (nowMs - lastValidated) > syncInterval;

    // Automatic background or synchronous sync with Central API
    if ((options?.forceSync || isStale || isPastExpiry || isNotActive) && cache.licenseKey && cache.centralApiUrl) {
      if (!inFlightSyncPromise) {
        inFlightSyncPromise = syncLicenseWithCentral().finally(() => {
          inFlightSyncPromise = null;
        });
      }

      // If license was previously expired/inactive or forceSync requested, wait for Central validation
      if (options?.forceSync || isNotActive || isPastExpiry) {
        try {
          await Promise.race([
            inFlightSyncPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Sync timeout")), 3500)),
          ]);

          const refreshed = await prisma.licenseCache.findFirst({
            where: { id: cache.id },
          });
          if (refreshed) {
            return formatLicenseResult(refreshed);
          }
        } catch (e) {
          // Timeout or offline: fall back to local database evaluation
        }
      }
    }

    return formatLicenseResult(cache);
  } catch (err: any) {
    // Database connection or table not found
    return {
      valid: true,
      status: "ACTIVE",
      plan: "PLUS",
      entitlements: PLAN_DEFAULT_ENTITLEMENTS.PLUS,
      domain: "localhost",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isGracePeriod: false,
      message: "Standalone license active (fallback).",
    };
  }
}

/**
 * Triggers a real heartbeat check with TECHNEXT Central API.
 * Automatically synchronizes plan tier (upgrade or degrade), entitlements, status, and expiry.
 */
export async function syncLicenseWithCentral(): Promise<{
  success: boolean;
  message: string;
  status?: LicenseStatusResult;
}> {
  const cache = await prisma.licenseCache.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!cache) {
    return { success: false, message: "No local license found to sync." };
  }

  try {
    const targetCentralUrl = cleanCentralUrl(cache.centralApiUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`${targetCentralUrl}/license/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        licenseKey: cache.licenseKey,
        domain: cache.domain,
        installationUuid: cache.installationUuid,
        storeVersion: "v1.1.0",
      }),
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok || !data.valid) {
      const code = data.code || "";
      if (code === "LICENSE_SUSPENDED" || code === "LICENSE_REVOKED" || code === "LICENSE_EXPIRED") {
        await prisma.licenseCache.update({
          where: { id: cache.id },
          data: {
            status: code.replace("LICENSE_", ""),
            lastValidatedAt: new Date(),
          },
        });
        invalidateLicenseStatusCache();
        invalidateStorePermissionsCache();
      }
      return { success: false, message: data.error || "License validation rejected by Central." };
    }

    // Verify token
    const verification = verifyEntitlementToken(data.token, SECRET);
    if (!verification.valid || !verification.payload) {
      return { success: false, message: "Cryptographic entitlement verification failed." };
    }

    const payload = verification.payload;
    const graceExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // Automatically update local LicenseCache: handles automatic plan upgrade or downgrade!
    await prisma.licenseCache.update({
      where: { id: cache.id },
      data: {
        plan: payload.plan,
        status: payload.status,
        entitlementsJson: JSON.stringify(payload.entitlements),
        expiresAt: new Date(payload.expiresAt),
        lastValidatedAt: new Date(),
        gracePeriodUntil: graceExpiry,
      },
    });

    invalidateLicenseStatusCache();
    invalidateStorePermissionsCache();

    return {
      success: true,
      message: `License synchronized! Plan: ${payload.plan}, Status: ${payload.status}`,
      status: {
        valid: payload.status === "ACTIVE",
        status: payload.status,
        plan: payload.plan,
        entitlements: payload.entitlements,
        domain: cache.domain,
        expiresAt: payload.expiresAt,
        isGracePeriod: false,
      },
    };
  } catch (error: any) {
    return { success: false, message: `Could not connect to Central API: ${error.message}` };
  }
}

/**
 * Replaces or updates the store license key, activates with Central API, and updates local cache.
 */
export async function updateStoreLicenseKey({
  licenseKey,
  domain,
  centralApiUrl,
}: {
  licenseKey: string;
  domain?: string;
  centralApiUrl?: string;
}): Promise<{
  success: boolean;
  message: string;
  license?: LicenseStatusResult;
}> {
  if (!licenseKey || !licenseKey.trim()) {
    return { success: false, message: "A valid license key is required." };
  }

  const existingCache = await prisma.licenseCache.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const targetCentralUrl = cleanCentralUrl(
    centralApiUrl ||
    existingCache?.centralApiUrl ||
    process.env.CENTRAL_API_URL
  );

  const targetDomain =
    domain?.trim() ||
    existingCache?.domain ||
    process.env.STORE_DOMAIN ||
    "localhost:3001";

  const installationUuid =
    existingCache?.installationUuid ||
    process.env.INSTALLATION_UUID ||
    `inst_${Date.now()}`;

  try {
    const res = await fetch(`${targetCentralUrl}/license/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: licenseKey.trim(),
        domain: targetDomain,
        installationUuid,
        storeVersion: "v1.1.0",
      }),
    });

    const centralResult = await res.json();
    if (!res.ok || !centralResult.success) {
      return {
        success: false,
        message: centralResult.error || "Central licensing server rejected the license key.",
      };
    }

    const lic = centralResult.license;
    const tokenVerification = verifyEntitlementToken(lic.token, SECRET);
    if (!tokenVerification.valid || !tokenVerification.payload) {
      return {
        success: false,
        message: "Cryptographic signature on license activation token is invalid.",
      };
    }

    const payload = tokenVerification.payload;
    const graceExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // Save in local database
    await prisma.licenseCache.deleteMany();
    await prisma.licenseCache.create({
      data: {
        licenseKey: payload.licenseKey,
        plan: payload.plan,
        status: payload.status,
        domain: lic.domain || targetDomain,
        installationUuid,
        entitlementsJson: JSON.stringify(payload.entitlements),
        expiresAt: new Date(payload.expiresAt),
        lastValidatedAt: new Date(),
        gracePeriodUntil: graceExpiry,
        centralApiUrl: targetCentralUrl,
      },
    });

    invalidateLicenseStatusCache();

    const newStatus = await getStoreLicenseStatus();

    return {
      success: true,
      message: `License successfully updated to ${payload.plan} tier! All store operations are unlocked.`,
      license: newStatus,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Could not connect to Central Licensing Server at ${targetCentralUrl}: ${error.message}`,
    };
  }
}

/**
 * Fetches active broadcast announcements pushed by TECHNEXT Central
 */
export async function getStoreBroadcasts(plan?: string): Promise<any[]> {
  try {
    const cache = await prisma.licenseCache.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    const centralUrl = cleanCentralUrl(cache?.centralApiUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${centralUrl}/broadcasts?tier=${plan || "ALL"}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.broadcasts || [];
    }
  } catch (err) {
    // Graceful offline fallback
  }
  return [];
}

/**
 * Disconnects and removes local license cache
 */
export async function disconnectStoreLicense(): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.licenseCache.deleteMany();
    return { success: true, message: "License key successfully disconnected from store." };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}


