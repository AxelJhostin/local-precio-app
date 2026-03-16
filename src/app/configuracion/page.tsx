import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageTitle } from "@/components/shared/page-title";

export default function ConfiguracionPage() {
  return (
    <section>
      <PageTitle
        title="Configuracion"
        description="Panel para definir parametros base de la app y reglas que usaran los modulos de conversion y calculo."
      />

      <FeaturePlaceholder
        title="Estructura inicial lista"
        description="Aqui se agregaran ajustes como factores, formatos de codigo y preferencias operativas del local."
      />
    </section>
  );
}
