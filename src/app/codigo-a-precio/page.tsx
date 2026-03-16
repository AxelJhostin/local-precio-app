import { ConversionForm } from "@/components/shared/conversion-form";
import { PageTitle } from "@/components/shared/page-title";

export default function CodigoAPrecioPage() {
  return (
    <section>
      <PageTitle
        title="Código a precio"
        description="Recupera el precio de venta a partir del código interno para validar productos en mostrador o inventario."
      />

      <ConversionForm mode="code_to_price" />
    </section>
  );
}
