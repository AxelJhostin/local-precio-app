export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export type ConversionMode = "price_to_code" | "code_to_price";
