import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageTitle } from "@/components/shared/page-title";

export default function ConfiguracionPage() {
  return (
    <section>
      <PageTitle
        title="Configuración"
        description="Panel para definir parámetros base de la app y reglas que usarán los módulos de conversión y cálculo."
      />

      <FeaturePlaceholder
        title="Próximamente"
        description="Aquí se agregarán ajustes como factores, formatos de código y preferencias operativas del local."
      />
    </section>
  );
}
