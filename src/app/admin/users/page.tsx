
import UserManagement from "@/components/admin/user-management";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Spravovat Uživatele</h1>
      <UserManagement />
    </div>
  );
}
