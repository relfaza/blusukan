import { requireWisatawanPage } from "@/lib/auth-helpers";
import PengaturanWisatawanClient from "./PengaturanWisatawanClient";

export default async function PengaturanWisatawanPage() {
  await requireWisatawanPage();

  return <PengaturanWisatawanClient />;
}
