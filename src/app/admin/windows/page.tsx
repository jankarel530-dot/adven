'use client';

import WindowManagement from "@/components/admin/window-management";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo } from "react";


export default function WindowsPage() {
    const firestore = useFirestore();
    const windowsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "advent_windows"), orderBy("day"));
    }, [firestore]);

    const { data: windows, isLoading } = useCollection(windowsQuery);

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Okénka</h1>
            <WindowManagement windows={windows || []} isLoading={isLoading} />
        </div>
    );
}
