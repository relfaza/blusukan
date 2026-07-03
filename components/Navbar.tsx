import { auth } from "@/auth";
import NavbarClient, { type NavbarUser } from "./NavbarClient";

export default async function Navbar() {
  const session = await auth();
  const sessionUser = session?.user as { name?: string | null; role?: string } | undefined;

  const user: NavbarUser = sessionUser
    ? { name: sessionUser.name ?? null, role: sessionUser.role ?? null }
    : null;

  return <NavbarClient user={user} />;
}
