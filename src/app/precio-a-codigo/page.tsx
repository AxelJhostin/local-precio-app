import { ConversionForm } from "@/components/shared/conversion-form";
import { PageTitle } from "@/components/shared/page-title";

export default function PrecioACodigoPage() {
  return (
    <section>
      <PageTitle
        title="Precio a código"
        description="Convierte un precio de venta en el código interno del local para etiquetado y referencia rápida."
      />

      <ConversionForm mode="price_to_code" />
    </section>
  );
}
