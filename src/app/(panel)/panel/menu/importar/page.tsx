import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MenuImportFlow } from "@/components/panel/menu-import-flow";
import { requireStaff } from "@/lib/auth/context";
import { canConfigure } from "@/lib/auth/roles";

import { applyMenuAction, readMenuAction } from "./actions";

export const metadata = { title: "Importar carta" };

export default async function ImportMenuPage() {
  const staff = await requireStaff();
  if (!canConfigure(staff.role)) redirect("/panel/menu");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-3 sm:p-4">
      <div>
        <Link href="/panel/menu" className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
          <ArrowLeft className="size-4" aria-hidden /> Menú
        </Link>
        <h1 className="mt-1 font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
          Importar la carta
        </h1>
        <p className="text-sm text-ink-600">
          Subí fotos o el PDF de tu carta y la IA arma las categorías, los productos y los precios. No usa tus fotos
          con IA del mes.
        </p>
      </div>
      <MenuImportFlow
        readAction={readMenuAction}
        applyAction={applyMenuAction}
        doneHref="/panel/menu"
        currency={staff.business.currency}
      />
    </main>
  );
}
