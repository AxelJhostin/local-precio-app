import { CODE_TO_DIGIT, DIGIT_TO_CODE, type CodeChar, type DigitChar } from "./code-map";
import type { ValidationResult } from "@/types/converters";

const DECIMAL_SEPARATOR_REGEX = /[.,]/g;
const PRICE_ALLOWED_REGEX = /^[0-9.,]+$/;
const CODE_ALLOWED_REGEX = /^[a-zA-Z.,]+$/;

type PriceParts = {
  integerPart: string;
  decimalPart: string;
};

type CodeParts = {
  integerPart: string;
  decimalPart: string;
};

export function validatePriceInput(input: string): ValidationResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { isValid: false, error: "Ingresa un precio para convertir." };
  }

  if (!PRICE_ALLOWED_REGEX.test(trimmedInput)) {
    return {
      isValid: false,
      error: "El precio solo puede contener números, coma o punto decimal.",
    };
  }

  const separators = trimmedInput.match(DECIMAL_SEPARATOR_REGEX) ?? [];
  if (separators.length > 1) {
    return {
      isValid: false,
      error: "El precio tiene múltiples separadores decimales.",
    };
  }

  const { integerPart, decimalPart } = splitDecimal(trimmedInput);

  if (!integerPart || !/^\d+$/.test(integerPart)) {
    return {
      isValid: false,
      error: "La parte entera del precio es inválida.",
    };
  }

  if (separators.length === 1 && decimalPart.length === 0) {
    return {
      isValid: false,
      error: "La parte decimal no puede estar vacía.",
    };
  }

  if (decimalPart.length > 2) {
    return {
      isValid: false,
      error: "El precio no puede tener más de 2 decimales.",
    };
  }

  if (decimalPart && !/^\d+$/.test(decimalPart)) {
    return {
      isValid: false,
      error: "La parte decimal del precio es inválida.",
    };
  }

  return { isValid: true };
}

export function validateCodeInput(input: string): ValidationResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { isValid: false, error: "Ingresa un código para convertir." };
  }

  if (!CODE_ALLOWED_REGEX.test(trimmedInput)) {
    return {
      isValid: false,
      error: "El código solo puede contener letras, coma o punto decimal.",
    };
  }

  const separators = trimmedInput.match(DECIMAL_SEPARATOR_REGEX) ?? [];
  if (separators.length !== 1) {
    return {
      isValid: false,
      error: "El código debe tener un único separador decimal (coma o punto).",
    };
  }

  const { integerPart, decimalPart } = splitDecimal(trimmedInput.toUpperCase());

  if (!integerPart || !decimalPart) {
    return {
      isValid: false,
      error: "El código debe incluir parte entera y parte decimal.",
    };
  }

  if (decimalPart.length !== 2) {
    return {
      isValid: false,
      error: "La parte decimal del código debe tener exactamente 2 letras.",
    };
  }

  const unknownCharacter = [...(integerPart + decimalPart)].find(
    (character) => !isCodeCharacter(character),
  );

  if (unknownCharacter) {
    return {
      isValid: false,
      error: `La letra "${unknownCharacter}" no pertenece al código.`,
    };
  }

  return { isValid: true };
}

export function normalizePrice(input: string): string {
  const validation = validatePriceInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error ?? "El precio ingresado es inválido.");
  }

  const { integerPart, decimalPart } = splitDecimal(input.trim());
  const normalizedIntegerPart = trimLeadingZeros(integerPart);
  const normalizedDecimalPart =
    decimalPart.length === 0 ? "00" : decimalPart.padEnd(2, "0");

  return `${normalizedIntegerPart}.${normalizedDecimalPart}`;
}

export function priceToCode(price: string): string {
  const normalizedPrice = normalizePrice(price);
  const { integerPart, decimalPart } = splitDecimal(normalizedPrice);

  const integerCode = digitsToCode(integerPart);
  const decimalCode = digitsToCode(decimalPart);

  return `${integerCode},${decimalCode}`;
}

export function codeToPrice(code: string): string {
  const normalizedCode = normalizeCode(code);
  const { integerPart, decimalPart } = splitDecimal(normalizedCode);

  const integerDigits = lettersToDigits(integerPart);
  const decimalDigits = lettersToDigits(decimalPart);

  return `${trimLeadingZeros(integerDigits)}.${decimalDigits}`;
}

function normalizeCode(input: string): string {
  const validation = validateCodeInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error ?? "El código ingresado es inválido.");
  }

  const { integerPart, decimalPart } = splitDecimal(input.trim().toUpperCase());
  return `${integerPart},${decimalPart}`;
}

function digitsToCode(value: string): string {
  return [...value]
    .map((digit) => DIGIT_TO_CODE[digit as DigitChar])
    .join("");
}

function lettersToDigits(value: string): string {
  return [...value]
    .map((letter) => CODE_TO_DIGIT[letter as CodeChar])
    .join("");
}

function splitDecimal(value: string): PriceParts & CodeParts {
  const parts = value.split(/[.,]/);

  return {
    integerPart: parts[0] ?? "",
    decimalPart: parts[1] ?? "",
  };
}

function trimLeadingZeros(value: string): string {
  const trimmedValue = value.replace(/^0+(?=\d)/, "");
  return trimmedValue || "0";
}

function isCodeCharacter(character: string): character is CodeChar {
  return character in CODE_TO_DIGIT;
}
