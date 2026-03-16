import { codeToPrice, normalizePrice, validatePriceInput } from "./converters";
import type {
  AutomaticCalculation,
  CategoryMargins,
  CategoryOption,
  CostInputMode,
  CostResolution,
  MarginCalculation,
} from "@/types/calculator";

export const PRODUCT_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "celular", label: "Celular" },
  { value: "parlante", label: "Parlante" },
  { value: "accesorio", label: "Accesorio" },
  { value: "personalizado", label: "Personalizado" },
];

export const DEFAULT_CATEGORY_MARGINS: CategoryMargins = {
  celular: { suggested: 20, minimum: 12 },
  parlante: { suggested: 28, minimum: 18 },
  accesorio: { suggested: 40, minimum: 25 },
  personalizado: { suggested: 20, minimum: 10 },
};

export function calculateSalePrice(cost: number, marginPercent: number): number {
  assertPositiveNumber(cost, "costo");
  assertNonNegativeNumber(marginPercent, "margen");
  return roundTo2(cost * (1 + marginPercent / 100));
}

export function calculateProfit(cost: number, salePrice: number): number {
  assertPositiveNumber(cost, "costo");
  assertNonNegativeNumber(salePrice, "precio de venta");
  return roundTo2(salePrice - cost);
}

export function calculateProfitPercentage(cost: number, salePrice: number): number {
  assertPositiveNumber(cost, "costo");
  assertNonNegativeNumber(salePrice, "precio de venta");
  return roundTo2(((salePrice - cost) / cost) * 100);
}

export function parseCostInput(input: string): number {
  const validation = validatePriceInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error ?? "Ingresa un costo valido.");
  }

  const normalizedCost = normalizePrice(input);
  const cost = Number.parseFloat(normalizedCost);
  assertPositiveNumber(cost, "costo");

  return roundTo2(cost);
}

export function parseSalePriceInput(input: string): number {
  const validation = validatePriceInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error ?? "Ingresa un precio de venta valido.");
  }

  const normalizedPrice = normalizePrice(input);
  const salePrice = Number.parseFloat(normalizedPrice);
  assertNonNegativeNumber(salePrice, "precio de venta");

  return roundTo2(salePrice);
}

export function parseMarginInput(input: string, label: string): number {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    throw new Error(`Ingresa el margen ${label}.`);
  }

  if (!/^\d+([.,]\d{1,2})?$/.test(trimmedInput)) {
    throw new Error(
      `El margen ${label} debe ser un numero con hasta 2 decimales.`,
    );
  }

  const normalized = trimmedInput.replace(",", ".");
  const marginValue = Number.parseFloat(normalized);
  assertNonNegativeNumber(marginValue, `margen ${label}`);

  return roundTo2(marginValue);
}

export function resolveCostFromManualOrCode(
  mode: CostInputMode,
  rawInput: string,
): CostResolution {
  const trimmedInput = rawInput.trim();
  if (!trimmedInput) {
    throw new Error(
      mode === "manual"
        ? "Ingresa el costo manual para calcular."
        : "Ingresa un codigo para obtener el costo base.",
    );
  }

  if (mode === "manual") {
    const normalizedCost = normalizePrice(trimmedInput);
    const cost = Number.parseFloat(normalizedCost);
    assertPositiveNumber(cost, "costo");

    return {
      mode,
      cost: roundTo2(cost),
      normalizedCost,
    };
  }

  const normalizedCost = codeToPrice(trimmedInput);
  const cost = Number.parseFloat(normalizedCost);
  assertPositiveNumber(cost, "costo");

  return {
    mode,
    cost: roundTo2(cost),
    normalizedCost,
    normalizedCode: normalizeCodeDisplay(trimmedInput),
  };
}

export function validateMarginPair(suggested: number, minimum: number): void {
  assertNonNegativeNumber(suggested, "margen sugerido");
  assertNonNegativeNumber(minimum, "margen minimo");

  if (minimum > suggested) {
    throw new Error("El margen minimo no puede ser mayor al margen sugerido.");
  }
}

export function calculateAutomaticValues(
  cost: number,
  suggestedMargin: number,
  minimumMargin: number,
): AutomaticCalculation {
  assertPositiveNumber(cost, "costo");
  validateMarginPair(suggestedMargin, minimumMargin);

  return {
    cost: roundTo2(cost),
    suggested: calculateMarginScenario(cost, suggestedMargin),
    minimum: calculateMarginScenario(cost, minimumMargin),
  };
}

function calculateMarginScenario(
  cost: number,
  marginPercent: number,
): MarginCalculation {
  const salePrice = calculateSalePrice(cost, marginPercent);

  return {
    marginPercent: roundTo2(marginPercent),
    salePrice,
    profitAmount: calculateProfit(cost, salePrice),
    profitPercentage: calculateProfitPercentage(cost, salePrice),
  };
}

function normalizeCodeDisplay(input: string): string {
  return input.trim().toUpperCase().replace(/[.]/g, ",");
}

function assertPositiveNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`El ${label} debe ser mayor que 0.`);
  }
}

function assertNonNegativeNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`El ${label} no puede ser negativo.`);
  }
}

function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
