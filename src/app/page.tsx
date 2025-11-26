import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getWindows } from "@/lib/data";
import Header from "@/components/common/header";
import AdventCalendar from "@/components/calendar/advent-calendar";

export default async function HomePage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const windows = await getWindows();
  const serializedWindows = JSON.stringify(windows);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <AdventCalendar windowsData={serializedWindows} />
      </main>
    </div>
  );
}
