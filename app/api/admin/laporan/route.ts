import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { computeLaporanDistribusi, getDestinasiDenganLaporan, getLaporanByDestinasi } from "@/lib/laporan";

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get("destinationId");

  if (destinationId) {
    const reports = await getLaporanByDestinasi(destinationId);
    const roadCondition = searchParams.get("roadCondition");
    const signalStrength = searchParams.get("signalStrength");
    const crowdLevel = searchParams.get("crowdLevel");
    const rows = reports.filter(
      (r) =>
        (!roadCondition || r.roadCondition === roadCondition) &&
        (!signalStrength || r.signalStrength === signalStrength) &&
        (!crowdLevel || r.crowdLevel === crowdLevel)
    );
    return NextResponse.json({ rows, ...computeLaporanDistribusi(reports) });
  }

  const destinations = await getDestinasiDenganLaporan();
  return NextResponse.json(destinations);
}
