import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import type { Lease } from "@prisma/client";

// GET /api/leases — list leases
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Lease[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add role check (HOUSING_ADMIN, HOUSING_STAFF)
  // TODO: Filter by status, assignment_id

  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignment_id");

  const leases = await prisma.lease.findMany({
    where: {
      deleted_at: null,
      ...(assignmentId ? { assignment_id: assignmentId } : {}),
    },
    include: {
      assignment: {
        select: {
          term: true,
          student: { select: { first_name: true, last_name: true } },
          room: {
            select: {
              room_number: true,
              building: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ data: leases });
}

// POST /api/leases — create a lease record for an assignment
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Lease>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN, HOUSING_STAFF
  // TODO: Upload document to SharePoint via Graph API, store returned URL
  // TODO: Write audit log entry

  const body = await req.json();

  const lease = await prisma.lease.create({
    data: {
      assignment_id: body.assignment_id,
      sharepoint_url: body.sharepoint_url ?? null,
      expires_at: body.expires_at ? new Date(body.expires_at) : null,
    },
  });

  return NextResponse.json({ data: lease }, { status: 201 });
}
