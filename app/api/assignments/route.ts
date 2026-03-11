import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditCreate } from "@/lib/audit";
import type { ApiResponse } from "@/types";
import type { RoomAssignment } from "@prisma/client";

// GET /api/assignments — list room assignments
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<RoomAssignment[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add role check — HOUSING_STAFF and above
  // TODO: Add filtering by term, room, student, status

  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term");
  const roomId = searchParams.get("room_id");

  const assignments = await prisma.roomAssignment.findMany({
    where: {
      deleted_at: null,
      ...(term ? { term } : {}),
      ...(roomId ? { room_id: roomId } : {}),
    },
    include: {
      student: { select: { first_name: true, last_name: true, email: true } },
      room: {
        select: {
          room_number: true,
          building: { select: { name: true, code: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ data: assignments });
}

// POST /api/assignments — create a room assignment
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<RoomAssignment>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN, HOUSING_STAFF
  // TODO: Validate body; check room capacity isn't exceeded for the term
  // TODO: Send assignment notification email via Microsoft Graph API

  const body = await req.json();

  const assignment = await prisma.roomAssignment.create({
    data: {
      student_id: body.student_id,
      room_id: body.room_id,
      application_id: body.application_id ?? null,
      term: body.term,
      start_date: new Date(body.start_date),
      end_date: body.end_date ? new Date(body.end_date) : null,
    },
  });

  // FERPA: audit log every assignment creation
  await auditCreate(
    session.user.azureAdId ?? session.user.id,
    session.user.email ?? "",
    "room_assignments",
    assignment.id,
    {
      student_id: assignment.student_id,
      room_id: assignment.room_id,
      term: assignment.term,
    }
  );

  return NextResponse.json({ data: assignment }, { status: 201 });
}
