import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getPeringkatDestinasi } from "@/lib/peringkat";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const peringkat = await getPeringkatDestinasi();
  return NextResponse.json(peringkat);
}
