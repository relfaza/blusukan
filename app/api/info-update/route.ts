import { NextResponse } from "next/server";
import { getHiddenGemBaru, getPopulerMingguIni } from "@/lib/info-update";

export async function GET() {
  const [hiddenGemBaru, populerMingguIni] = await Promise.all([
    getHiddenGemBaru(),
    getPopulerMingguIni(),
  ]);

  return NextResponse.json({ hiddenGemBaru, populerMingguIni });
}
