import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, ArrowRight, Database } from "lucide-react";
import InitializeButton from "@/components/admin/initialize-button";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Spravovat Uživatele</CardTitle>
            <CardDescription>
              Vytvářejte a spravujte uživatelské účty pro vaši aplikaci.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent">
              <Link href="/admin/users">
                Přejít na správu uživatelů <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings /> Spravovat Okénka</CardTitle>
            <CardDescription>
              Upravujte obsah a stav adventních okének.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent">
              <Link href="/admin/windows">
                Přejít na správu okének <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database /> Inicializace databáze</CardTitle>
            <CardDescription>
              Pokud je databáze prázdná, toto tlačítko ji naplní výchozími daty (uživateli a okénky). Spusťte pouze jednou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InitializeButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
