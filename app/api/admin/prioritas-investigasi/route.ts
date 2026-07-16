import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getPrioritasInvestigasi } from "@/lib/peringkat";
import { parseAdminFilters } from "@/lib/admin-filters";

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseAdminFilters({
    kabupaten: searchParams.get("kabupaten"),
    kondisiJalan: searchParams.get("kondisiJalan"),
  });

  const prioritas = await getPrioritasInvestigasi(filters);
  return NextResponse.json(prioritas);
}
