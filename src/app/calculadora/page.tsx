import { CommercialCalculator } from "@/components/calculator/commercial-calculator";
import { PageTitle } from "@/components/shared/page-title";

export default function CalculadoraPage() {
  return (
    <section>
      <PageTitle
        title="Calculadora"
        description="Calculadora comercial para estimar precios sugeridos, minimos y utilidades segun costo y categoria."
      />

      <CommercialCalculator />
    </section>
  );
}
