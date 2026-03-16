import { QuickViewPanel } from "@/components/quick-view/quick-view-panel";
import { PageTitle } from "@/components/shared/page-title";

export default function VistaRapidaPage() {
  return (
    <section>
      <PageTitle
        title="Vista rápida"
        description="Flujo resumido para uso diario: detecta precio o código, aplica márgenes por categoría y muestra resultados inmediatos."
      />

      <QuickViewPanel />
    </section>
  );
}
