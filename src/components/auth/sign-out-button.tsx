"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Odhlásit se
      </Button>
    </form>
  );
}
