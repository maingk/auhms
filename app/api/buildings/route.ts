import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import type { Building } from "@prisma/client";

// GET /api/buildings — list all active buildings
export async function GET(
  _req: NextRequest
): Promise<NextResponse<ApiResponse<Building[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add role check (HOUSING_ADMIN, HOUSING_STAFF, READ_ONLY_REPORTER)
  // TODO: Add pagination, filtering, sorting

  const buildings = await prisma.building.findMany({
    where: { deleted_at: null },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: buildings });
}

// POST /api/buildings — create a new building
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Building>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN role
  // TODO: Validate request body (zod or similar)
  // TODO: Write audit log entry

  const body = await req.json();

  const building = await prisma.building.create({
    data: {
      name: body.name,
      code: body.code,
      address: body.address,
      floors: body.floors,
      status: body.status,
    },
  });

  return NextResponse.json({ data: building }, { status: 201 });
}
