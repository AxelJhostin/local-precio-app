export type ProductCategory =
  | "celular"
  | "parlante"
  | "accesorio"
  | "personalizado";

export type CostInputMode = "manual" | "code";

export type MarginConfig = {
  suggested: number;
  minimum: number;
};

export type CategoryMargins = Record<ProductCategory, MarginConfig>;

export type CategoryOption = {
  value: ProductCategory;
  label: string;
};

export type CostResolution = {
  mode: CostInputMode;
  cost: number;
  normalizedCost: string;
  normalizedCode?: string;
};

export type MarginCalculation = {
  marginPercent: number;
  salePrice: number;
  profitAmount: number;
  profitPercentage: number;
};

export type AutomaticCalculation = {
  cost: number;
  suggested: MarginCalculation;
  minimum: MarginCalculation;
};
