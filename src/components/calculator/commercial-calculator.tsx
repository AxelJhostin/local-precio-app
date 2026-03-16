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
  { value: "code", label: "Código LUBRICADOS" },
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

  const resolvedMargins = useMemo<
    ResolvedValue<{ suggested: number; minimum: number }>
  >(() => {
    try {
      const suggested = parseMarginInput(selectedDraft.suggested, "sugerido");
      const minimum = parseMarginInput(selectedDraft.minimum, "mínimo");
      validateMarginPair(suggested, minimum);
      return { value: { suggested, minimum }, error: "" };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Márgenes inválidos.",
      };
    }
  }, [selectedDraft.minimum, selectedDraft.suggested]);

  const resolvedCost = useMemo<
    ResolvedValue<ReturnType<typeof resolveCostFromManualOrCode>>
  >(() => {
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

  const simulation = useMemo<
    ResolvedValue<{ salePrice: number; profit: number; profitPercentage: number }>
  >(() => {
    if (!realSalePriceInput.trim()) {
      return { value: null, error: "" };
    }

    if (!resolvedCost.value) {
      return {
        value: null,
        error: "Primero ingresa un costo válido para simular la venta real.",
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
          error instanceof Error ? error.message : "No se pudo calcular la simulación.",
      };
    }
  }, [realSalePriceInput, resolvedCost.value]);

  function handleSaveMargins() {
    if (!resolvedMargins.value) {
      setSaveMessage(resolvedMargins.error || "No se pueden guardar márgenes inválidos.");
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
        ? "Márgenes guardados en este navegador."
        : "No se pudieron guardar los márgenes en localStorage.",
    );
  }

  function handleClearCalculator() {
    setCostMode("manual");
    setCostInput("");
    setCategory("celular");
    setRealSalePriceInput("");
    setSaveMessage("");
    setMarginState((previousState) => ({
      saved: previousState.saved,
      drafts: createMarginDrafts(previousState.saved),
    }));
  }

  function handleClearSimulation() {
    setRealSalePriceInput("");
  }

  return (
    <div className="mt-6 space-y-4 sm:space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">1. Costo base</h2>
        <p className="mt-1 text-sm text-slate-600">
          Elige cómo ingresar el costo para iniciar el cálculo.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {COST_MODE_OPTIONS.map((modeOption) => (
            <button
              key={modeOption.value}
              type="button"
              onClick={() => setCostMode(modeOption.value)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
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
            {costMode === "manual" ? "Costo manual" : "Código LUBRICADOS"}
          </label>
          <input
            id="calculator-cost-input"
            type="text"
            value={costInput}
            onChange={(event) => setCostInput(event.target.value)}
            placeholder={costMode === "manual" ? "Ej: 120 o 120,50" : "Ej: LU,SI o LU.SI"}
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <p className="text-xs text-slate-500">
            {costMode === "manual"
              ? "Ejemplo: 120,50 → costo base 120.50"
              : "Ejemplo: LU,SI → costo base 12.50"}
          </p>
        </div>

        {resolvedCost.error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {resolvedCost.error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <QuickStat
            label="Costo base"
            value={resolvedCost.value ? formatMoney(resolvedCost.value.cost) : "--"}
          />
          <QuickStat
            label="Costo normalizado"
            value={resolvedCost.value ? resolvedCost.value.normalizedCost : "--"}
          />
          {costMode === "code" ? (
            <QuickStat
              label="Código interpretado"
              value={resolvedCost.value?.normalizedCode ?? "--"}
            />
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">2. Categoría y márgenes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Define márgenes sugeridos y mínimos según el tipo de producto.
        </p>

        <div className="mt-4 grid gap-4">
          <div className="space-y-2">
            <label htmlFor="calculator-category" className="text-sm font-medium text-slate-800">
              Categoría
            </label>
            <select
              id="calculator-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as ProductCategory);
                setSaveMessage("");
              }}
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="calculator-margin-minimum"
                className="text-sm font-medium text-slate-800"
              >
                Margen mínimo (%)
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
                className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Ejemplo: sugerido 20% y mínimo 12%.
        </p>

        {resolvedMargins.error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {resolvedMargins.error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleSaveMargins}
            className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Guardar márgenes por defecto
          </button>
          <button
            type="button"
            onClick={handleClearCalculator}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Limpiar calculadora
          </button>
        </div>

        {saveMessage ? <p className="mt-3 text-sm text-slate-600">{saveMessage}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">3. Resultados automáticos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Revisa precio sugerido, precio mínimo y utilidad esperada.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
            title="Mínimo"
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">4. Simulación de venta real</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ingresa un precio de venta real para ver utilidad en dólares y porcentaje.
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
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <p className="text-xs text-slate-500">Ejemplo: costo 120 y venta 140 → utilidad 20.</p>
        </div>

        {simulation.error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {simulation.error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <QuickStat
            label="Venta real"
            value={simulation.value ? formatMoney(simulation.value.salePrice) : "--"}
          />
          <QuickStat
            label="Utilidad real ($)"
            value={simulation.value ? formatMoney(simulation.value.profit) : "--"}
          />
          <QuickStat
            label="Utilidad real (%)"
            value={simulation.value ? formatPercent(simulation.value.profitPercentage) : "--"}
          />
        </div>

        <button
          type="button"
          onClick={handleClearSimulation}
          className="mt-3 min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Limpiar simulación
        </button>
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
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{salePrice}</p>
      <div className="mt-4 grid gap-2">
        <QuickStat label="Margen" value={marginLabel} />
        <QuickStat label="Utilidad ($)" value={profitAmount} />
        <QuickStat label="Utilidad (%)" value={profitPercentage} />
      </div>
    </article>
  );
}

type QuickStatProps = {
  label: string;
  value: string;
};

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
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
