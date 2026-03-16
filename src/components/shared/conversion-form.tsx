"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  codeToPrice,
  priceToCode,
  validateCodeInput,
  validatePriceInput,
} from "@/lib/converters";
import type { ConversionMode, ValidationResult } from "@/types/converters";

type ConversionFormProps = {
  mode: ConversionMode;
};

type FormConfig = {
  inputLabel: string;
  inputPlaceholder: string;
  actionLabel: string;
  resultLabel: string;
  helperText: string;
  examples: string[];
  validate: (input: string) => ValidationResult;
  convert: (input: string) => string;
};

const FORM_CONFIG: Record<ConversionMode, FormConfig> = {
  price_to_code: {
    inputLabel: "Precio",
    inputPlaceholder: "Ej: 15.20 o 15,20",
    actionLabel: "Convertir a código",
    resultLabel: "Código generado",
    helperText:
      "Acepta coma o punto. El resultado siempre usa formato ENTEROS,DECIMALES.",
    examples: ["15.20 → LI,US", "15 → LI,SS", "7.00 → A,SS"],
    validate: validatePriceInput,
    convert: priceToCode,
  },
  code_to_price: {
    inputLabel: "Código",
    inputPlaceholder: "Ej: LI,US o LI.US",
    actionLabel: "Convertir a precio",
    resultLabel: "Precio normalizado",
    helperText:
      "Acepta mayúsculas/minúsculas y coma o punto como separador decimal.",
    examples: ["LI,US → 15.20", "li.us → 15.20", "A,SS → 7.00"],
    validate: validateCodeInput,
    convert: codeToPrice,
  },
};

export function ConversionForm({ mode }: ConversionFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const config = useMemo(() => FORM_CONFIG[mode], [mode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopyMessage("");

    const validation = config.validate(inputValue);
    if (!validation.isValid) {
      setError(validation.error ?? "La entrada no es válida.");
      setResult("");
      return;
    }

    try {
      const convertedValue = config.convert(inputValue);
      setResult(convertedValue);
      setError("");
    } catch (conversionError) {
      const message =
        conversionError instanceof Error
          ? conversionError.message
          : "No se pudo convertir el valor ingresado.";
      setError(message);
      setResult("");
    }
  }

  function handleClear() {
    setInputValue("");
    setResult("");
    setError("");
    setCopyMessage("");
  }

  async function handleCopyResult() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
      setCopyMessage("Resultado copiado.");
    } catch {
      setCopyMessage("No se pudo copiar automáticamente.");
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor={`conversion-input-${mode}`}
            className="text-sm font-medium text-slate-800"
          >
            {config.inputLabel}
          </label>
          <input
            id={`conversion-input-${mode}`}
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={config.inputPlaceholder}
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <p className="text-xs text-slate-500">{config.helperText}</p>
          <p className="text-xs text-slate-500">
            Ejemplos: {config.examples.join(" · ")}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {config.actionLabel}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {config.resultLabel}
        </p>
        <output className="mt-2 block min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl font-semibold tracking-wide text-slate-900">
          {result || "--"}
        </output>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyResult}
            disabled={!result}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copiar resultado
          </button>
          {copyMessage ? <p className="text-xs text-slate-600">{copyMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}
