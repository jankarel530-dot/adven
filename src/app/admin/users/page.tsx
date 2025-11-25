import { getUsers } from "@/lib/data";
import UserManagement from "@/components/admin/user-management";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Uživateate</h1>
      <UserManagement users={users} />
    </div>
  );
}
