'use client';

import { useCollection, useFirestore } from "@/firebase";
import UserManagement from "@/components/admin/user-management";
import { collection } from "firebase/firestore";
import { useMemo } from "react";

export default function UsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "users");
  }, [firestore]);
  const { data: users, isLoading } = useCollection(usersQuery);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Uživatele</h1>
      <UserManagement users={users || []} isLoading={isLoading} />
    </div>
  );
}
