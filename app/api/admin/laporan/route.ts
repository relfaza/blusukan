import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getDestinasiDenganLaporan, getLaporanByDestinasi } from "@/lib/laporan";

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get("destinationId");

  if (destinationId) {
    const reports = await getLaporanByDestinasi(destinationId);
    return NextResponse.json(reports);
  }

  const destinations = await getDestinasiDenganLaporan();
  return NextResponse.json(destinations);
}
