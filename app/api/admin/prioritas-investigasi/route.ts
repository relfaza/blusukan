import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getPrioritasInvestigasi } from "@/lib/peringkat";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const prioritas = await getPrioritasInvestigasi();
  return NextResponse.json(prioritas);
}
