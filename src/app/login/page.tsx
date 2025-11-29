
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const session = cookies().get("session")?.value;

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <LoginForm />
    </main>
  );
}
