import Link from "next/link";
import { MAIN_NAV_ITEMS } from "@/lib/navigation";
import { PageTitle } from "@/components/shared/page-title";

export default function HomePage() {
  const featureLinks = MAIN_NAV_ITEMS.filter((item) => item.href !== "/");

  return (
    <section className="space-y-6">
      <PageTitle
        title="Inicio"
        description="App interna para el local: convierte precios y codigos, y centraliza calculos rapidos para ventas y control diario."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Modulos disponibles
        </h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Esta fase deja la estructura lista para implementar la logica de
          negocio en los siguientes pasos.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {featureLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
