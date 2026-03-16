"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_CATEGORY_MARGINS,
  PRODUCT_CATEGORY_OPTIONS,
  calculateAutomaticValues,
  calculateProfit,
  calculateProfitPercentage,
  parseMarginInput,
  parseSalePriceInput,
  resolveCostFromManualOrCode,
  validateMarginPair,
} from "@/lib/calculator";
import { loadCategoryMargins, saveCategoryMargins } from "@/lib/storage";
import type { CategoryMargins, CostInputMode, ProductCategory } from "@/types/calculator";

type ResolvedValue<T> = {
  value: T | null;
  error: string;
};

type MarginDraft = {
  suggested: string;
  minimum: string;
};

type MarginDrafts = Record<ProductCategory, MarginDraft>;

type MarginState = {
  saved: CategoryMargins;
  drafts: MarginDrafts;
};

const COST_MODE_OPTIONS: { value: CostInputMode; label: string }[] = [
  { value: "manual", label: "Costo manual" },
  { value: "code", label: "Codigo LUBRICADOS" },
];

export function CommercialCalculator() {
  const [costMode, setCostMode] = useState<CostInputMode>("manual");
  const [costInput, setCostInput] = useState("");
  const [category, setCategory] = useState<ProductCategory>("celular");
  const [marginState, setMarginState] = useState<MarginState>(() => {
    const storedMargins = loadCategoryMargins(DEFAULT_CATEGORY_MARGINS);
    return {
      saved: storedMargins,
      drafts: createMarginDrafts(storedMargins),
    };
  });
  const [realSalePriceInput, setRealSalePriceInput] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const selectedDraft = marginState.drafts[category];

  const resolvedMargins = useMemo<ResolvedValue<{ suggested: number; minimum: number }>>(() => {
    try {
      const suggested = parseMarginInput(selectedDraft.suggested, "sugerido");
      const minimum = parseMarginInput(selectedDraft.minimum, "minimo");
      validateMarginPair(suggested, minimum);
      return { value: { suggested, minimum }, error: "" };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Margenes invalidos.",
      };
    }
  }, [selectedDraft.minimum, selectedDraft.suggested]);

  const resolvedCost = useMemo<ResolvedValue<ReturnType<typeof resolveCostFromManualOrCode>>>(() => {
    const trimmedInput = costInput.trim();
    if (!trimmedInput) {
      return { value: null, error: "" };
    }

    try {
      return { value: resolveCostFromManualOrCode(costMode, trimmedInput), error: "" };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "No se pudo resolver el costo.",
      };
    }
  }, [costInput, costMode]);

  const automaticCalculation = useMemo(() => {
    if (!resolvedCost.value || !resolvedMargins.value) {
      return null;
    }

    return calculateAutomaticValues(
      resolvedCost.value.cost,
      resolvedMargins.value.suggested,
      resolvedMargins.value.minimum,
    );
  }, [resolvedCost.value, resolvedMargins.value]);

  const simulation = useMemo<ResolvedValue<{ salePrice: number; profit: number; profitPercentage: number }>>(() => {
    if (!realSalePriceInput.trim()) {
      return { value: null, error: "" };
    }

    if (!resolvedCost.value) {
      return {
        value: null,
        error: "Primero ingresa un costo valido para simular la venta real.",
      };
    }

    try {
      const salePrice = parseSalePriceInput(realSalePriceInput);
      return {
        value: {
          salePrice,
          profit: calculateProfit(resolvedCost.value.cost, salePrice),
          profitPercentage: calculateProfitPercentage(resolvedCost.value.cost, salePrice),
        },
        error: "",
      };
    } catch (error) {
      return {
        value: null,
        error:
          error instanceof Error ? error.message : "No se pudo calcular la simulacion.",
      };
    }
  }, [realSalePriceInput, resolvedCost.value]);

  function handleSaveMargins() {
    if (!resolvedMargins.value) {
      setSaveMessage(resolvedMargins.error || "No se pueden guardar margenes invalidos.");
      return;
    }

    const nextMargins: CategoryMargins = {
      ...marginState.saved,
      [category]: {
        suggested: resolvedMargins.value.suggested,
        minimum: resolvedMargins.value.minimum,
      },
    };

    setMarginState((previousState) => ({
      saved: nextMargins,
      drafts: {
        ...previousState.drafts,
        [category]: {
          suggested: String(resolvedMargins.value?.suggested ?? ""),
          minimum: String(resolvedMargins.value?.minimum ?? ""),
        },
      },
    }));
    const wasSaved = saveCategoryMargins(nextMargins);
    setSaveMessage(
      wasSaved
        ? "Margenes guardados en este navegador."
        : "No se pudieron guardar los margenes en localStorage.",
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Costo base</h2>
        <p className="mt-1 text-sm text-slate-600">
          Define el costo manual o usa un codigo LUBRICADOS para obtenerlo.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {COST_MODE_OPTIONS.map((modeOption) => (
            <button
              key={modeOption.value}
              type="button"
              onClick={() => setCostMode(modeOption.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                costMode === modeOption.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {modeOption.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <label htmlFor="calculator-cost-input" className="text-sm font-medium text-slate-800">
            {costMode === "manual" ? "Costo manual" : "Codigo LUBRICADOS"}
          </label>
          <input
            id="calculator-cost-input"
            type="text"
            value={costInput}
            onChange={(event) => setCostInput(event.target.value)}
            placeholder={costMode === "manual" ? "Ej: 120 o 120,50" : "Ej: LU,SI o LU.SI"}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {resolvedCost.error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {resolvedCost.error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Costo base</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {resolvedCost.value ? formatMoney(resolvedCost.value.cost) : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Costo normalizado</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {resolvedCost.value ? resolvedCost.value.normalizedCost : "--"}
            </p>
          </div>
          {costMode === "code" ? (
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Codigo interpretado
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {resolvedCost.value?.normalizedCode ?? "--"}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Categoria y margenes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configura margen sugerido y minimo segun la categoria del producto.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="calculator-category" className="text-sm font-medium text-slate-800">
              Categoria
            </label>
            <select
              id="calculator-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as ProductCategory);
                setSaveMessage("");
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="calculator-margin-suggested"
              className="text-sm font-medium text-slate-800"
            >
              Margen sugerido (%)
            </label>
            <input
              id="calculator-margin-suggested"
              type="text"
              inputMode="decimal"
              value={selectedDraft.suggested}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSaveMessage("");
                setMarginState((previousState) => ({
                  ...previousState,
                  drafts: {
                    ...previousState.drafts,
                    [category]: {
                      ...previousState.drafts[category],
                      suggested: nextValue,
                    },
                  },
                }));
              }}
              placeholder="Ej: 20"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="calculator-margin-minimum"
              className="text-sm font-medium text-slate-800"
            >
              Margen minimo (%)
            </label>
            <input
              id="calculator-margin-minimum"
              type="text"
              inputMode="decimal"
              value={selectedDraft.minimum}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSaveMessage("");
                setMarginState((previousState) => ({
                  ...previousState,
                  drafts: {
                    ...previousState.drafts,
                    [category]: {
                      ...previousState.drafts[category],
                      minimum: nextValue,
                    },
                  },
                }));
              }}
              placeholder="Ej: 12"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {resolvedMargins.error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {resolvedMargins.error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveMargins}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Guardar margenes por defecto
          </button>
          {saveMessage ? <p className="text-sm text-slate-600">{saveMessage}</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Resultados automaticos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Calcula precios sugeridos y minimos segun costo y margenes definidos.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ResultCard
            title="Sugerido"
            marginLabel={
              automaticCalculation
                ? formatPercent(automaticCalculation.suggested.marginPercent)
                : "--"
            }
            salePrice={
              automaticCalculation ? formatMoney(automaticCalculation.suggested.salePrice) : "--"
            }
            profitAmount={
              automaticCalculation
                ? formatMoney(automaticCalculation.suggested.profitAmount)
                : "--"
            }
            profitPercentage={
              automaticCalculation
                ? formatPercent(automaticCalculation.suggested.profitPercentage)
                : "--"
            }
          />

          <ResultCard
            title="Minimo"
            marginLabel={
              automaticCalculation
                ? formatPercent(automaticCalculation.minimum.marginPercent)
                : "--"
            }
            salePrice={
              automaticCalculation ? formatMoney(automaticCalculation.minimum.salePrice) : "--"
            }
            profitAmount={
              automaticCalculation ? formatMoney(automaticCalculation.minimum.profitAmount) : "--"
            }
            profitPercentage={
              automaticCalculation
                ? formatPercent(automaticCalculation.minimum.profitPercentage)
                : "--"
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Simulacion de venta real</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ingresa un precio de venta real para ver utilidad en dolares y porcentaje.
        </p>

        <div className="mt-4 space-y-2">
          <label htmlFor="calculator-real-price" className="text-sm font-medium text-slate-800">
            Precio de venta real
          </label>
          <input
            id="calculator-real-price"
            type="text"
            inputMode="decimal"
            value={realSalePriceInput}
            onChange={(event) => setRealSalePriceInput(event.target.value)}
            placeholder="Ej: 140 o 140,00"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {simulation.error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {simulation.error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <ResultValue
            label="Venta real"
            value={simulation.value ? formatMoney(simulation.value.salePrice) : "--"}
          />
          <ResultValue
            label="Utilidad real ($)"
            value={simulation.value ? formatMoney(simulation.value.profit) : "--"}
          />
          <ResultValue
            label="Utilidad real (%)"
            value={simulation.value ? formatPercent(simulation.value.profitPercentage) : "--"}
          />
        </div>
      </section>
    </div>
  );
}

type ResultCardProps = {
  title: string;
  marginLabel: string;
  salePrice: string;
  profitAmount: string;
  profitPercentage: string;
};

function ResultCard({
  title,
  marginLabel,
  salePrice,
  profitAmount,
  profitPercentage,
}: ResultCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid gap-3">
        <ResultValue label="Margen" value={marginLabel} />
        <ResultValue label="Precio de venta" value={salePrice} />
        <ResultValue label="Utilidad ($)" value={profitAmount} />
        <ResultValue label="Utilidad (%)" value={profitPercentage} />
      </div>
    </article>
  );
}

type ResultValueProps = {
  label: string;
  value: string;
};

function ResultValue({ label, value }: ResultValueProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function createMarginDrafts(margins: CategoryMargins): MarginDrafts {
  return {
    celular: toMarginDraft(margins.celular.suggested, margins.celular.minimum),
    parlante: toMarginDraft(margins.parlante.suggested, margins.parlante.minimum),
    accesorio: toMarginDraft(margins.accesorio.suggested, margins.accesorio.minimum),
    personalizado: toMarginDraft(
      margins.personalizado.suggested,
      margins.personalizado.minimum,
    ),
  };
}

function toMarginDraft(suggested: number, minimum: number): MarginDraft {
  return {
    suggested: String(suggested),
    minimum: String(minimum),
  };
}
