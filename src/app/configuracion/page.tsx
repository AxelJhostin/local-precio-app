import { ConfigurationPanel } from "@/components/configuration/configuration-panel";
import { PageTitle } from "@/components/shared/page-title";

export default function ConfiguracionPage() {
  return (
    <section>
      <PageTitle
        title="Configuración"
        description="Administra parámetros clave de la aplicación: guía del código LUBRICADOS y márgenes por categoría."
      />

      <ConfigurationPanel />
    </section>
  );
}
