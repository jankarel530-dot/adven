'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { initializeData } from '@/lib/data';
import { initializeDatabaseAction } from '@/lib/actions';

export default function InitializeButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInitialize = async () => {
    setLoading(true);
    const result = await initializeDatabaseAction();
    if (result.success) {
      toast({
          title: 'Úspěch',
          description: 'Data byla úspěšně resetována do výchozího stavu.',
      });
    } else {
       toast({
        title: 'Chyba',
        description: 'Nepodařilo se resetovat data.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
     <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
            {loading ? 'Inicializace...' : 'Resetovat data'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Jste si jisti?</AlertDialogTitle>
          <AlertDialogDescription>
            Tato akce přepíše veškeré aktuální změny (uživatele i okénka) a vrátí je do výchozího stavu, který je definován v kódu. Tuto akci použijte, pokud se data z nějakého důvodu ztratila.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction onClick={handleInitialize}>Ano, resetovat</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
