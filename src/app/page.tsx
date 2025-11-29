
'use client';

import { useUser, useFirestore } from "@/firebase";
import AdventCalendar from "@/components/calendar/advent-calendar";
import { Loader } from "lucide-react";
import Header from "@/components/common/header";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    redirect("/login");
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <AdventCalendar />
      </main>
    </div>
  );
}
