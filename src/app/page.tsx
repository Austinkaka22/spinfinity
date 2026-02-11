import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/guards";
import { getRoleHome } from "@/lib/auth/roles";

export default async function Home() {
  const session = await getSessionContext();

  if (!session) {
    redirect("/sign-in");
  }

  redirect(getRoleHome(session.role) ?? "/sign-in?error=missing_role");
}
