export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { syncLicenseWithCentral, getStoreLicenseStatus, invalidateLicenseStatusCache } from "@/lib/license-client";
import { invalidateStorePermissionsCache } from "@/lib/permissions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    invalidateLicenseStatusCache();
    invalidateStorePermissionsCache();
    const syncRes = await syncLicenseWithCentral();
    const currentStatus = await getStoreLicenseStatus();

    return NextResponse.json(
      {
        success: syncRes.success,
        message: syncRes.message,
        license: currentStatus,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    invalidateLicenseStatusCache();
    invalidateStorePermissionsCache();
    const syncRes = await syncLicenseWithCentral();
    const currentStatus = await getStoreLicenseStatus();

    return NextResponse.json(
      {
        success: syncRes.success,
        message: syncRes.message,
        license: currentStatus,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
