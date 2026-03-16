import { DEFAULT_CATEGORY_MARGINS } from "./calculator";
import type { CategoryMargins, ProductCategory } from "@/types/calculator";

const MARGINS_STORAGE_KEY = "local-precio:category-margins:v1";
const CATEGORIES: ProductCategory[] = [
  "celular",
  "parlante",
  "accesorio",
  "personalizado",
];

export function loadCategoryMargins(
  fallback: CategoryMargins = DEFAULT_CATEGORY_MARGINS,
): CategoryMargins {
  if (!isBrowser()) {
    return cloneMargins(fallback);
  }

  try {
    const rawValue = window.localStorage.getItem(MARGINS_STORAGE_KEY);
    if (!rawValue) {
      return cloneMargins(fallback);
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return sanitizeMargins(parsedValue, fallback);
  } catch {
    return cloneMargins(fallback);
  }
}

export function saveCategoryMargins(margins: CategoryMargins): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.setItem(MARGINS_STORAGE_KEY, JSON.stringify(margins));
    return true;
  } catch {
    return false;
  }
}

function sanitizeMargins(
  value: unknown,
  fallback: CategoryMargins,
): CategoryMargins {
  const baseMargins = cloneMargins(fallback);
  if (!isRecord(value)) {
    return baseMargins;
  }

  const safeMargins = { ...baseMargins };

  for (const category of CATEGORIES) {
    const rawCategory = value[category];
    if (!isRecord(rawCategory)) {
      continue;
    }

    const suggested = rawCategory.suggested;
    const minimum = rawCategory.minimum;

    if (isValidMarginValue(suggested) && isValidMarginValue(minimum)) {
      safeMargins[category] = { suggested, minimum };
    }
  }

  return safeMargins;
}

function cloneMargins(source: CategoryMargins): CategoryMargins {
  return {
    celular: { ...source.celular },
    parlante: { ...source.parlante },
    accesorio: { ...source.accesorio },
    personalizado: { ...source.personalizado },
  };
}

function isValidMarginValue(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}
