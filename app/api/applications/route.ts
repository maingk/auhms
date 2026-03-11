import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import type { HousingApplication } from "@prisma/client";

// GET /api/applications — list housing applications
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<HousingApplication[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add role check — STUDENT sees own; HOUSING_STAFF sees all
  // TODO: Add filtering by term, status

  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term");
  const status = searchParams.get("status");

  const applications = await prisma.housingApplication.findMany({
    where: {
      deleted_at: null,
      ...(term ? { term } : {}),
      ...(status ? { status: status as HousingApplication["status"] } : {}),
    },
    include: {
      student: { select: { first_name: true, last_name: true, email: true } },
    },
    orderBy: { submitted_at: "desc" },
  });

  return NextResponse.json({ data: applications });
}

// POST /api/applications — submit a housing application
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<HousingApplication>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Validate body (term, student_id)
  // TODO: Enforce one-application-per-student-per-term (unique constraint will
  //        catch it at DB level, but return a clear error to the client)
  // TODO: Write audit log entry
  // TODO: Send confirmation email via Microsoft Graph API

  const body = await req.json();

  const application = await prisma.housingApplication.create({
    data: {
      student_id: body.student_id,
      term: body.term,
      notes: body.notes,
    },
  });

  return NextResponse.json({ data: application }, { status: 201 });
}
