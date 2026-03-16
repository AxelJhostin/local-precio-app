import {
  codeToPrice,
  normalizePrice,
  priceToCode,
  validateCodeInput,
  validatePriceInput,
} from "./converters";

export type QuickInputKind = "price" | "code";

export type QuickInputResolution = {
  kind: QuickInputKind;
  normalizedCost: string;
  normalizedCode: string;
  cost: number;
};

export function detectQuickInputKind(input: string): QuickInputKind | null {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return null;
  }

  if (validatePriceInput(trimmedInput).isValid) {
    return "price";
  }

  if (validateCodeInput(trimmedInput).isValid) {
    return "code";
  }

  return null;
}

export function resolveQuickInput(input: string): QuickInputResolution {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new Error("Ingresa un precio o código para continuar.");
  }

  const kind = detectQuickInputKind(trimmedInput);
  if (!kind) {
    throw new Error(
      "Entrada no válida. Usa un precio (ej: 120 o 120,50) o un código (ej: LU,SI).",
    );
  }

  if (kind === "price") {
    const normalizedCost = normalizePrice(trimmedInput);
    const normalizedCode = priceToCode(normalizedCost);
    const cost = Number.parseFloat(normalizedCost);

    if (!Number.isFinite(cost) || cost <= 0) {
      throw new Error("El costo base debe ser mayor a 0.");
    }

    return {
      kind,
      normalizedCost,
      normalizedCode,
      cost,
    };
  }

  const normalizedCost = codeToPrice(trimmedInput);
  const normalizedCode = normalizeCodeDisplay(trimmedInput);
  const cost = Number.parseFloat(normalizedCost);

  if (!Number.isFinite(cost) || cost <= 0) {
    throw new Error("El costo base debe ser mayor a 0.");
  }

  return {
    kind,
    normalizedCost,
    normalizedCode,
    cost,
  };
}

function normalizeCodeDisplay(input: string): string {
  const normalizedInput = input.trim().toUpperCase();
  const [integerPart = "", decimalPart = ""] = normalizedInput.split(/[.,]/);
  return `${integerPart},${decimalPart}`;
}
