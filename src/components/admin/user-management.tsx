"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { User } from "@/lib/definitions";
import { addUser, deleteUserAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "../ui/skeleton";

type UserManagementProps = {
  users: User[];
  isLoading: boolean;
};

export default function UserManagement({ users, isLoading }: UserManagementProps) {
  const { toast } = useToast();
  
  const handleDelete = async (id: string) => {
    const result = await deleteUserAction(id);
     if (result?.isError) {
        toast({ title: "Chyba", description: result.message, variant: "destructive" });
      } else {
        toast({ title: "Úspěch", description: result.message });
      }
  };

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
                <TableHead>Uživatelské jméno</TableHead>
                <TableHead>Heslo</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.password ? 'heslo' : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Smazat uživatele</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Jste si jisti?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tato akce nelze vrátit zpět. Tímto trvale smažete uživatele <span className="font-bold">{user.username}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Zrušit</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)}>Smazat</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
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
      if (state.isError || state.errors) {
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
