import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
