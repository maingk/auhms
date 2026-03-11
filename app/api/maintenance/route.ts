import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import type { MaintenanceRequest } from "@prisma/client";

// GET /api/maintenance — list maintenance requests
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<MaintenanceRequest[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: STUDENT role sees only requests they submitted
  // TODO: HOUSING_STAFF sees all; filter by room/building/priority/status

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id");
  const status = searchParams.get("status");

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      deleted_at: null,
      ...(roomId ? { room_id: roomId } : {}),
      ...(status
        ? { status: status as MaintenanceRequest["status"] }
        : {}),
    },
    include: {
      room: {
        select: {
          room_number: true,
          building: { select: { name: true, code: true } },
        },
      },
    },
    orderBy: [{ priority: "desc" }, { created_at: "desc" }],
  });

  return NextResponse.json({ data: requests });
}

// POST /api/maintenance — submit a maintenance request
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<MaintenanceRequest>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Validate body
  // TODO: Send Teams notification to housing staff for HIGH/EMERGENCY priority
  //        via Microsoft Graph API or Power Automate webhook

  const body = await req.json();

  const request = await prisma.maintenanceRequest.create({
    data: {
      room_id: body.room_id,
      submitted_by: session.user.azureAdId ?? session.user.id,
      title: body.title,
      description: body.description,
      priority: body.priority,
    },
  });

  return NextResponse.json({ data: request }, { status: 201 });
}
