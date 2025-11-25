"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { User } from "@/lib/definitions";
import { addUser } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

type UserManagementProps = {
  users: Omit<User, "password">[];
};

export default function UserManagement({ users }: UserManagementProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Seznam Uživatelů</CardTitle>
          <CardDescription>Přehled všech registrovaných uživatelů.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Uživatelské jméno</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddUserForm />
    </div>
  );
}

function AddUserForm() {
  const [state, action] = useFormState(addUser, undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.errors) {
        toast({ title: "Chyba", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Úspěch", description: state.message });
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Přidat nového uživatele</CardTitle>
        <CardDescription>
          Vytvořte nový přihlašovací účet. Role bude automaticky 'user'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input id="username" name="username" required aria-describedby="username-error" />
             <div id="username-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.username && (
                <p className="text-sm text-destructive">
                  {state.errors.username.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input id="password" name="password" type="password" required aria-describedby="password-error" />
             <div id="password-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password.join(", ")}
                </p>
              )}
            </div>
          </div>
          <SubmitButton />
           {state?.message && !state.errors && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}
          {state?.message && state.errors && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} variant="accent">
        {pending ? "Vytváření..." : "Vytvořit Uživatele"}
        </Button>
    );
}
