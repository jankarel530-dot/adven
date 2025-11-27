
"use client";

import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { initializeDatabaseAction } from "@/lib/actions";

export default function InitializeButton() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleInitialize = () => {
    startTransition(async () => {
      const result = await initializeDatabaseAction();
      if (result.isError) {
        toast({
          title: "Chyba",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Úspěch",
          description: result.message,
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isPending}>
          {isPending ? "Resetování..." : "Resetovat Data"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Jste si absolutně jisti?</AlertDialogTitle>
          <AlertDialogDescription>
            Tato akce trvale přepíše veškerá aktuální data (uživatele a okénka) v úložišti
            výchozími hodnotami z projektu. Tuto akci nelze vrátit zpět.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInitialize}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Ano, resetovat data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
