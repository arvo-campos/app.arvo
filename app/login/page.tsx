import { redirect } from "next/navigation";
import { getSession, homePathForRole } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homePathForRole(session.role));

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <LoginForm />
    </div>
  );
}
