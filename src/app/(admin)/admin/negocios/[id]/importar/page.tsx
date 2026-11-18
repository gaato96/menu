import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuImportFlow } from "@/components/panel/menu-import-flow";
import { requireSuperadmin } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

import { adminApplyMenuAction, adminReadMenuAction } from "./actions";

export const metadata = { title: "Importar carta" };

export default async function AdminImportMenuPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id, name, currency").eq("id", id).maybeSingle();
  if (!business) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <Link href={`/admin/negocios/${business.id}`} className="text-sm text-brand underline underline-offset-2">
          ← {business.name}
        </Link>
        <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink-900">Importar carta con IA</h1>
        <p className="text-sm text-ink-600">
          Lo pagás vos, no el local, y no tiene tope mensual. Sirve para armar la demo de un prospecto con su carta
          real antes de escribirle.
        </p>
      </div>
      <MenuImportFlow
        readAction={adminReadMenuAction.bind(null, business.id)}
        applyAction={adminApplyMenuAction.bind(null, business.id)}
        doneHref={`/admin/negocios/${business.id}`}
        currency={business.currency}
      />
    </main>
  );
}
