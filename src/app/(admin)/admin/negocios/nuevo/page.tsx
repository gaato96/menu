import Link from "next/link";

import { CreateBusinessForm } from "@/components/admin/create-business-form";
import { requireSuperadmin } from "@/lib/auth/context";

import { createBusiness } from "./actions";

export const metadata = { title: "Nuevo negocio" };

export default async function NewBusinessPage() {
  await requireSuperadmin();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <Link href="/admin" className="text-sm text-brand underline underline-offset-2">
          ← Negocios
        </Link>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">
          Nuevo negocio
        </h1>
      </div>
      <CreateBusinessForm action={createBusiness} />
    </main>
  );
}
