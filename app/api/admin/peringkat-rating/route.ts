import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getPeringkatRating } from "@/lib/peringkat-rating";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const peringkat = await getPeringkatRating();
  return NextResponse.json(peringkat);
}
