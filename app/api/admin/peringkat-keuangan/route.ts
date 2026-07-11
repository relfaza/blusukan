import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getPeringkatKeuangan } from "@/lib/peringkat-keuangan";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const peringkat = await getPeringkatKeuangan();
  return NextResponse.json(peringkat);
}
