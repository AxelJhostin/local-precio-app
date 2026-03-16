import { ConversionForm } from "@/components/shared/conversion-form";
import { PageTitle } from "@/components/shared/page-title";

export default function CodigoAPrecioPage() {
  return (
    <section>
      <PageTitle
        title="Codigo a precio"
        description="Recupera el precio de venta a partir del codigo interno para validar productos en mostrador o inventario."
      />

      <ConversionForm mode="code_to_price" />
    </section>
  );
}
