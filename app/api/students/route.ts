import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditRead } from "@/lib/audit";
import type { ApiResponse } from "@/types";
import type { Student } from "@prisma/client";

// GET /api/students — list students (FERPA: all access is audit-logged)
// Students are sourced from Colleague via nightly sync — no POST endpoint.
// Student records in AUHMS are read-only from a creation standpoint.
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Student[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN, HOUSING_STAFF, READ_ONLY_REPORTER
  // TODO: Add pagination and search (by name, email, colleague_id)

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const students = await prisma.student.findMany({
    where: {
      deleted_at: null,
      ...(search
        ? {
            OR: [
              { first_name: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { colleague_id: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  });

  // FERPA compliance: log this access
  await auditRead(
    session.user.azureAdId ?? session.user.id,
    session.user.email ?? "",
    "students"
  );

  return NextResponse.json({ data: students });
}
