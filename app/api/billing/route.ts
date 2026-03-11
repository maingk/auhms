import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import type { BillingCharge } from "@prisma/client";

// GET /api/billing — list billing charges
// Note: AUHMS generates charges for export to Colleague — it does not
// process payments. See ARCHITECTURE.md §8 (Out of Scope).
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BillingCharge[]>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN (sensitive financial data)
  // TODO: Filter by term, export status, student

  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term");
  const unexportedOnly = searchParams.get("unexported") === "true";

  const charges = await prisma.billingCharge.findMany({
    where: {
      deleted_at: null,
      ...(term ? { term } : {}),
      ...(unexportedOnly ? { exported_at: null } : {}),
    },
    include: {
      student: { select: { first_name: true, last_name: true, colleague_id: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ data: charges });
}

// POST /api/billing — create a billing charge record
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BillingCharge>>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Restrict to HOUSING_ADMIN
  // TODO: Validate charge_code against known Colleague charge codes
  // TODO: Prevent duplicate charges for the same assignment/term/charge_code
  // TODO: Write audit log entry

  const body = await req.json();

  const charge = await prisma.billingCharge.create({
    data: {
      student_id: body.student_id,
      assignment_id: body.assignment_id,
      charge_code: body.charge_code,
      amount: body.amount,
      description: body.description,
      term: body.term,
    },
  });

  return NextResponse.json({ data: charge }, { status: 201 });
}
