"use client";

import { useMemo, useState } from "react";
import { CODE_TO_DIGIT, DIGIT_TO_CODE } from "@/lib/code-map";
import {
  DEFAULT_CATEGORY_MARGINS,
  PRODUCT_CATEGORY_OPTIONS,
  parseMarginInput,
  validateMarginPair,
} from "@/lib/calculator";
import { codeToPrice, priceToCode } from "@/lib/converters";
import { loadCategoryMargins, saveCategoryMargins } from "@/lib/storage";
import type { CategoryMargins, ProductCategory } from "@/types/calculator";

type MarginDraft = {
  suggested: string;
  minimum: string;
};

type MarginDrafts = Record<ProductCategory, MarginDraft>;
type CategoryErrors = Partial<Record<ProductCategory, string>>;

type Feedback =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

const EXAMPLE_PRICE_INPUT = "15.20";
const EXAMPLE_CODE_INPUT = "LI.US";
const EXAMPLE_PRICE_TO_CODE = priceToCode(EXAMPLE_PRICE_INPUT);
const EXAMPLE_CODE_TO_PRICE = codeToPrice(EXAMPLE_CODE_INPUT);

export function ConfigurationPanel() {
  const [drafts, setDrafts] = useState<MarginDrafts>(() => {
    const storedMargins = loadCategoryMargins(DEFAULT_CATEGORY_MARGINS);
    return createMarginDrafts(storedMargins);
  });
  const [categoryErrors, setCategoryErrors] = useState<CategoryErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);

  const numberToCodeRows = useMemo(() => Object.entries(DIGIT_TO_CODE), []);
  const codeToNumberRows = useMemo(() => Object.entries(CODE_TO_DIGIT), []);

  function handleMarginChange(
    category: ProductCategory,
    field: keyof MarginDraft,
    value: string,
  ) {
    setFeedback(null);
    setCategoryErrors((previous) => ({ ...previous, [category]: undefined }));
    setDrafts((previous) => ({
      ...previous,
      [category]: {
        ...previous[category],
        [field]: value,
      },
    }));
  }

  function handleSaveMargins() {
    const nextErrors: CategoryErrors = {};
    const parsedMargins = cloneCategoryMargins(DEFAULT_CATEGORY_MARGINS);

    for (const option of PRODUCT_CATEGORY_OPTIONS) {
      const draft = drafts[option.value];

      try {
        const suggested = parseMarginInput(
          draft.suggested,
          `sugerido de ${option.label}`,
        );
        const minimum = parseMarginInput(draft.minimum, `mínimo de ${option.label}`);
        validateMarginPair(suggested, minimum);

        parsedMargins[option.value] = { suggested, minimum };
      } catch (error) {
        nextErrors[option.value] =
          error instanceof Error ? error.message : "Margen inválido en esta categoría.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setCategoryErrors(nextErrors);
      setFeedback({
        type: "error",
        message: "Corrige los márgenes marcados antes de guardar.",
      });
      return;
    }

    setCategoryErrors({});
    const wasSaved = saveCategoryMargins(parsedMargins);

    if (!wasSaved) {
      setFeedback({
        type: "error",
        message: "No se pudieron guardar los márgenes en localStorage.",
      });
      return;
    }

    setDrafts(createMarginDrafts(parsedMargins));
    setFeedback({
      type: "success",
      message: "Márgenes guardados correctamente.",
    });
  }

  function handleRestoreDefaults() {
    const defaults = cloneCategoryMargins(DEFAULT_CATEGORY_MARGINS);
    const wasSaved = saveCategoryMargins(defaults);

    if (!wasSaved) {
      setFeedback({
        type: "error",
        message: "No se pudieron restaurar los márgenes por defecto.",
      });
      return;
    }

    setDrafts(createMarginDrafts(defaults));
    setCategoryErrors({});
    setFeedback({
      type: "success",
      message: "Márgenes por defecto restaurados.",
    });
  }

  return (
    <div className="mt-6 space-y-4 sm:space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Código LUBRICADOS</h2>
        <p className="mt-1 text-sm text-slate-600">
          Esta equivalencia convierte números en letras para codificar y
          decodificar precios del local.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Número a código</h3>
            <div className="mt-3 space-y-2">
              {numberToCodeRows.map(([digit, code]) => (
                <PairRow
                  key={digit}
                  left={digit}
                  right={code}
                  leftLabel="Número"
                  rightLabel="Código"
                />
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Código a número</h3>
            <div className="mt-3 space-y-2">
              {codeToNumberRows.map(([code, digit]) => (
                <PairRow
                  key={code}
                  left={code}
                  right={digit}
                  leftLabel="Código"
                  rightLabel="Número"
                />
              ))}
            </div>
          </article>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Ejemplos rápidos</p>
          <p className="mt-2 text-sm text-slate-700">
            {EXAMPLE_PRICE_INPUT} → {EXAMPLE_PRICE_TO_CODE}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {EXAMPLE_CODE_INPUT} → {EXAMPLE_CODE_TO_PRICE}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Márgenes por categoría</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ajusta márgenes sugeridos y mínimos. Estos valores se guardan para el
          uso de la calculadora comercial.
        </p>

        <div className="mt-4 grid gap-3">
          {PRODUCT_CATEGORY_OPTIONS.map((option) => (
            <article
              key={option.value}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">{option.label}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor={`margin-suggested-${option.value}`}
                    className="text-sm font-medium text-slate-700"
                  >
                    Margen sugerido (%)
                  </label>
                  <input
                    id={`margin-suggested-${option.value}`}
                    type="text"
                    inputMode="decimal"
                    value={drafts[option.value].suggested}
                    onChange={(event) =>
                      handleMarginChange(option.value, "suggested", event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej: 20"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`margin-minimum-${option.value}`}
                    className="text-sm font-medium text-slate-700"
                  >
                    Margen mínimo (%)
                  </label>
                  <input
                    id={`margin-minimum-${option.value}`}
                    type="text"
                    inputMode="decimal"
                    value={drafts[option.value].minimum}
                    onChange={(event) =>
                      handleMarginChange(option.value, "minimum", event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej: 12"
                  />
                </div>
              </div>

              {categoryErrors[option.value] ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {categoryErrors[option.value]}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleSaveMargins}
            className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Guardar márgenes
          </button>
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Restaurar por defecto
          </button>
        </div>

        {feedback ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}

type PairRowProps = {
  left: string;
  right: string;
  leftLabel: string;
  rightLabel: string;
};

function PairRow({ left, right, leftLabel, rightLabel }: PairRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-sm text-slate-600">
        {leftLabel}: <span className="font-semibold text-slate-900">{left}</span>
      </p>
      <p className="text-sm text-slate-600">
        {rightLabel}: <span className="font-semibold text-slate-900">{right}</span>
      </p>
    </div>
  );
}

function createMarginDrafts(margins: CategoryMargins): MarginDrafts {
  return {
    celular: {
      suggested: String(margins.celular.suggested),
      minimum: String(margins.celular.minimum),
    },
    parlante: {
      suggested: String(margins.parlante.suggested),
      minimum: String(margins.parlante.minimum),
    },
    accesorio: {
      suggested: String(margins.accesorio.suggested),
      minimum: String(margins.accesorio.minimum),
    },
    personalizado: {
      suggested: String(margins.personalizado.suggested),
      minimum: String(margins.personalizado.minimum),
    },
  };
}

function cloneCategoryMargins(source: CategoryMargins): CategoryMargins {
  return {
    celular: { ...source.celular },
    parlante: { ...source.parlante },
    accesorio: { ...source.accesorio },
    personalizado: { ...source.personalizado },
  };
}
