"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/lib/navigation";

export function AppHeader() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          Local Precio
        </Link>

        <nav
          aria-label="Navegación principal"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          {MAIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isItemActive(item.href) ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isItemActive(item.href)
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
