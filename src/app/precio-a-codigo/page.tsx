import { ConversionForm } from "@/components/shared/conversion-form";
import { PageTitle } from "@/components/shared/page-title";

export default function PrecioACodigoPage() {
  return (
    <section>
      <PageTitle
        title="Precio a codigo"
        description="Convierte un precio de venta en el codigo interno del local para etiquetado y referencia rapida."
      />

      <ConversionForm mode="price_to_code" />
    </section>
  );
}
