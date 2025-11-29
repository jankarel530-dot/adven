
'use client';

import { redirect } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { getWindows } from "@/lib/data";
import Header from "@/components/common/header";
import AdventCalendar from "@/components/calendar/advent-calendar";
import { useEffect, useState } from "react";
import type { CalendarWindow } from "@/lib/definitions";
import { Loader } from "lucide-react";

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [windows, setWindows] = useState<CalendarWindow[]>([]);
  const [isLoadingWindows, setIsLoadingWindows] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect("/login");
    }
  }, [user, isUserLoading]);

  useEffect(() => {
    async function loadWindows() {
      if (firestore) {
        const fetchedWindows = await getWindows(firestore);
        setWindows(fetchedWindows);
        setIsLoadingWindows(false);
      }
    }
    loadWindows();
  }, [firestore]);


  if (isUserLoading || isLoadingWindows) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; // or a redirect, handled by useEffect
  }
  
  const serializedWindows = JSON.stringify(windows);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <AdventCalendar windowsData={serializedWindows} />
      </main>
    </div>
  );
}
