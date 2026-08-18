import { redirect } from "next/navigation";
import { getSession, homePathForRole } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  redirect(session ? homePathForRole(session.role) : "/login");
}
