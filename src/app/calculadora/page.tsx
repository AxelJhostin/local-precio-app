import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageTitle } from "@/components/shared/page-title";

export default function CalculadoraPage() {
  return (
    <section>
      <PageTitle
        title="Calculadora"
        description="Espacio para operaciones rapidas del local: margenes, descuentos y validaciones comerciales."
      />

      <FeaturePlaceholder
        title="Estructura inicial lista"
        description="Aqui se implementaran las herramientas de calculo con inputs y resultados claros para uso diario."
      />
    </section>
  );
}
