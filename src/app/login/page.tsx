import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <LoginForm />
    </main>
  );
}
