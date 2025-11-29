
'use client';

import Link from "next/link";
import { Snowflake, Shield } from "lucide-react";
import SignOutButton from "@/components/auth/sign-out-button";
import { Button } from "../ui/button";
import type { User } from "@/lib/definitions";

export default function Header({ user }: { user: User | null }) {
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Snowflake className="h-6 w-6 text-destructive" />
            <span className="font-bold font-headline sm:inline-block">
              Adventní kalendář
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          {user && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}
