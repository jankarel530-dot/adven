
import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Users, Settings, Snowflake, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { cookies } from 'next/headers';
import type { User } from "@/lib/definitions";
import Header from "@/components/common/header";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
      redirect('/login');
  }

  const user: User = JSON.parse(sessionCookie);

  if (user.role !== 'admin') {
      redirect('/');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Snowflake className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Adventní kalendář</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Shield className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/windows"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Windows</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Windows</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/users"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Users</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Users</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
       <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header user={user} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
