import Link from "next/link";
import { PageTitle } from "@/components/shared/page-title";

const QUICK_ACCESS = [
  {
    href: "/vista-rapida",
    title: "Vista rápida",
    description:
      "Flujo principal resumido para detectar entrada y calcular precios al instante.",
  },
  {
    href: "/precio-a-codigo",
    title: "Precio a código",
    description: "Convierte un precio de venta al código interno del local.",
  },
  {
    href: "/codigo-a-precio",
    title: "Código a precio",
    description: "Obtén el precio normalizado desde un código LUBRICADOS.",
  },
  {
    href: "/calculadora",
    title: "Calculadora",
    description: "Calcula precio sugerido, mínimo y utilidad real.",
  },
  {
    href: "/configuracion",
    title: "Configuración",
    description: "Revisa ajustes generales y parámetros de la aplicación.",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-5 sm:space-y-6">
      <PageTitle
        title="Inicio"
        description="Aplicación interna del local para conversión rápida de códigos y cálculo comercial diario con enfoque en uso móvil."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Resumen de módulos
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          La app está pensada para atención rápida en mostrador: ingresar datos,
          obtener resultado y continuar la venta sin pasos extra.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUICK_ACCESS.map((item) => (
            <article
              key={item.href}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Accesos rápidos
        </h2>
        <div className="mt-4 grid gap-3">
          {QUICK_ACCESS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              <span>{item.title}</span>
              <span className="text-slate-400" aria-hidden="true">
                {"->"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
