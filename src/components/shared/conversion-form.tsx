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
  validate: (input: string) => ValidationResult;
  convert: (input: string) => string;
};

const FORM_CONFIG: Record<ConversionMode, FormConfig> = {
  price_to_code: {
    inputLabel: "Precio",
    inputPlaceholder: "Ej: 15.20 o 15,20",
    actionLabel: "Convertir a codigo",
    resultLabel: "Codigo generado",
    helperText: "Acepta coma o punto. El resultado usa formato ENTEROS,DECIMALES.",
    validate: validatePriceInput,
    convert: priceToCode,
  },
  code_to_price: {
    inputLabel: "Codigo",
    inputPlaceholder: "Ej: LI,US o LI.US",
    actionLabel: "Convertir a precio",
    resultLabel: "Precio normalizado",
    helperText: "Acepta mayusculas/minusculas y coma o punto en el separador.",
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
      setError(validation.error ?? "La entrada no es valida.");
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

  async function handleCopyResult() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
      setCopyMessage("Resultado copiado.");
    } catch {
      setCopyMessage("No se pudo copiar automaticamente.");
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
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
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {config.actionLabel}
        </button>
      </form>

      <p className="mt-3 text-xs text-slate-500">{config.helperText}</p>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">{config.resultLabel}</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <output className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold tracking-wide text-slate-900">
            {result || "--"}
          </output>
          <button
            type="button"
            onClick={handleCopyResult}
            disabled={!result}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copiar
          </button>
        </div>
        {copyMessage ? <p className="mt-2 text-xs text-slate-600">{copyMessage}</p> : null}
      </div>
    </section>
  );
}
