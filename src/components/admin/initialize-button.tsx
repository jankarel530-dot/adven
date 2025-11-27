'use client';

// This component is no longer needed as data is file-based.
// It is kept for potential future use but is currently non-functional for production.
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

export default function InitializeButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInitialize = async () => {
    setLoading(true);
    toast({
        title: 'Akce není podporována',
        description: 'Inicializace databáze byla nahrazena přímou editací souborů. Tento prvek je zde ponechán pro případ budoucího rozšíření.',
        variant: 'destructive',
    });
    setLoading(false);
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
          <AlertDialogTitle>Akce není podporována</AlertDialogTitle>
          <AlertDialogDescription>
            S přechodem na souborové úložiště byla tato funkce deaktivována. Výchozí data jsou nyní přímo v souborech `users.json` a `windows.json`. Tento prvek je zde ponechán pro případ budoucího rozšíření.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Rozumím</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
