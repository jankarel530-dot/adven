'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { initializeDatabaseAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
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

export default function InitializeButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const result = await initializeDatabaseAction();
      toast({
        title: 'Inicializace dokončena',
        description: result.message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Neznámá chyba";
      toast({
        title: 'Chyba při inicializaci',
        description: `Došlo k chybě: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
            {loading ? 'Inicializace...' : 'Inicializovat databázi'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Jste si jisti?</AlertDialogTitle>
          <AlertDialogDescription>
            Tato akce se pokusí naplnit databázi výchozími daty. Pokud databáze již data obsahuje, nic se nestane. Tuto akci je bezpečné spustit, ale obvykle je potřeba pouze jednou.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction onClick={handleInitialize} disabled={loading}>
            {loading ? 'Probíhá...' : 'Ano, inicializovat'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}