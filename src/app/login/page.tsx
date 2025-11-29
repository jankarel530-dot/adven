
'use client';
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { useUser } from "@/firebase";
import { Loader } from "lucide-react";

export default function LoginPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <Loader className="h-10 w-10 animate-spin text-primary" />
        </main>
    )
  }

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <LoginForm />
    </main>
  );
}
