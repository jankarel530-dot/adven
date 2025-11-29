
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Snowflake } from "lucide-react";

export default function LoginForm() {
  const [state, action] = useActionState(login, undefined);

  return (
    <form action={action}>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Snowflake className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Adventní kalendář</CardTitle>
          <CardDescription>Prosím, přihlaste se k účtu</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="admin"
              required
              aria-describedby="username-error"
            />
            <div id="username-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.username && (
                <p className="text-sm text-destructive">
                  {state.errors.username.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Heslo</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              aria-describedby="password-error"
            />
            <div id="password-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password.join(", ")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
            <LoginButton />
            {state?.message && (
                <p className="text-sm text-destructive text-center">{state.message}</p>
            )}
        </CardFooter>
      </Card>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} variant="accent">
      {pending ? "Přihlašování..." : "Přihlásit se"}
    </Button>
  );
}
