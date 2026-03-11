import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import type { Room } from "@prisma/client";

// GET /api/rooms — list all active rooms (optionally filtered by building)
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Room[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get("building_id");

  // TODO: Add role check
  // TODO: Add pagination, filtering by status/type

  const rooms = await prisma.room.findMany({
    where: {
      deleted_at: null,
      ...(buildingId ? { building_id: buildingId } : {}),
    },
    include: { building: { select: { name: true, code: true } } },
    orderBy: [{ building_id: "asc" }, { room_number: "asc" }],
  });

  return NextResponse.json({ data: rooms });
}

// POST /api/rooms — create a new room
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Room>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN role
  // TODO: Validate request body
  // TODO: Write audit log entry

  const body = await req.json();

  const room = await prisma.room.create({
    data: {
      building_id: body.building_id,
      room_number: body.room_number,
      floor: body.floor,
      room_type: body.room_type,
      capacity: body.capacity,
      status: body.status,
      amenities: body.amenities,
    },
  });

  return NextResponse.json({ data: room }, { status: 201 });
}
