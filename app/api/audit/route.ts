import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import type { ApiResponse } from "@/types";
import type { AuditLog } from "@prisma/client";

// GET /api/audit — read the audit log
// Restricted to IT_ADMIN and HOUSING_ADMIN roles — this is sensitive access data.
// Audit records are immutable: no POST, PUT, or DELETE.
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<AuditLog[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only IT_ADMIN and HOUSING_ADMIN can read the audit log
  const allowedRoles: UserRole[] = [UserRole.IT_ADMIN, UserRole.HOUSING_ADMIN];
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // TODO: Add pagination (audit log will grow large — do not return all rows)
  // TODO: Filter by user_id, action, table_name, date range, record_id

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const tableName = searchParams.get("table_name");
  const action = searchParams.get("action");

  const entries = await prisma.auditLog.findMany({
    where: {
      ...(userId ? { user_id: userId } : {}),
      ...(tableName ? { table_name: tableName } : {}),
      ...(action ? { action: action as AuditLog["action"] } : {}),
    },
    orderBy: { created_at: "desc" },
    take: 100, // Hard cap until pagination is implemented
  });

  return NextResponse.json({ data: entries });
}
