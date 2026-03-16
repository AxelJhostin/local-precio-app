"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CATEGORY_MARGINS,
  PRODUCT_CATEGORY_OPTIONS,
  calculateAutomaticValues,
  calculateProfit,
  calculateProfitPercentage,
  parseSalePriceInput,
} from "@/lib/calculator";
import { resolveQuickInput } from "@/lib/quick-view";
import { loadCategoryMargins } from "@/lib/storage";
import type { CategoryMargins, ProductCategory } from "@/types/calculator";

type ResolvedValue<T> = {
  value: T | null;
  error: string;
};

export function QuickViewPanel() {
  const [inputValue, setInputValue] = useState("");
  const [category, setCategory] = useState<ProductCategory>("celular");
  const [realSalePriceInput, setRealSalePriceInput] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [categoryMargins, setCategoryMargins] = useState<CategoryMargins>(() =>
    loadCategoryMargins(DEFAULT_CATEGORY_MARGINS),
  );

  const refreshCategoryMargins = useCallback(
    () => setCategoryMargins(loadCategoryMargins(DEFAULT_CATEGORY_MARGINS)),
    [],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCategoryMargins();
      }
    };

    const handleStorage = () => {
      refreshCategoryMargins();
    };

    window.addEventListener("focus", refreshCategoryMargins);
    window.addEventListener("pageshow", refreshCategoryMargins);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshCategoryMargins);
      window.removeEventListener("pageshow", refreshCategoryMargins);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshCategoryMargins]);

  const selectedMargins = categoryMargins[category];

  const resolvedInput = useMemo<ResolvedValue<ReturnType<typeof resolveQuickInput>>>(() => {
    const trimmedInput = inputValue.trim();

    if (!trimmedInput) {
      return { value: null, error: "" };
    }

    try {
      return { value: resolveQuickInput(trimmedInput), error: "" };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "No se pudo procesar la entrada.",
      };
    }
  }, [inputValue]);

  const resolvedData = resolvedInput.value;

  const automaticCalculation = useMemo(() => {
    if (!resolvedInput.value) {
      return null;
    }

    return calculateAutomaticValues(
      resolvedInput.value.cost,
      selectedMargins.suggested,
      selectedMargins.minimum,
    );
  }, [resolvedInput.value, selectedMargins.minimum, selectedMargins.suggested]);

  const realSimulation = useMemo<
    ResolvedValue<{ salePrice: number; profit: number; profitPercentage: number }>
  >(() => {
    if (!realSalePriceInput.trim()) {
      return { value: null, error: "" };
    }

    if (!resolvedInput.value) {
      return {
        value: null,
        error: "Primero ingresa un precio o código válido.",
      };
    }

    try {
      const salePrice = parseSalePriceInput(realSalePriceInput);
      const cost = resolvedInput.value.cost;

      return {
        value: {
          salePrice,
          profit: calculateProfit(cost, salePrice),
          profitPercentage: calculateProfitPercentage(cost, salePrice),
        },
        error: "",
      };
    } catch (error) {
      return {
        value: null,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la utilidad real.",
      };
    }
  }, [realSalePriceInput, resolvedInput.value]);

  function handleClear() {
    setInputValue("");
    setCategory("celular");
    setRealSalePriceInput("");
    setCopyMessage("");
  }

  async function handleCopy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`${label} copiado.`);
    } catch {
      setCopyMessage("No se pudo copiar automáticamente.");
    }
  }

  return (
    <div className="mt-6 space-y-4 sm:space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Entrada rápida</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ingresa un precio o código LUBRICADOS. La detección es automática.
        </p>

        <div className="mt-4 grid gap-3">
          <div className="space-y-2">
            <label htmlFor="quick-view-input" className="text-sm font-medium text-slate-800">
              Precio o código
            </label>
            <input
              id="quick-view-input"
              type="text"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setCopyMessage("");
              }}
              placeholder="Ej: 120,50 o LU,SI"
              className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <p className="text-xs text-slate-500">
              Ejemplos: 120 | 120,50 | LU,SI | LI.US
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="quick-view-category" className="text-sm font-medium text-slate-800">
              Categoría
            </label>
            <select
              id="quick-view-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as ProductCategory)}
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleClear}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>

        {resolvedInput.error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {resolvedInput.error}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Resumen detectado</h2>
        <div className="mt-4 grid gap-3">
          <QuickStat
            label="Tipo detectado"
            value={
              resolvedData
                ? resolvedData.kind === "price"
                  ? "Precio manual"
                  : "Código LUBRICADOS"
                : "--"
            }
          />
          <CopyableStat
            label="Costo base"
            value={resolvedData ? resolvedData.normalizedCost : "--"}
            onCopy={
              resolvedData
                ? () => handleCopy(resolvedData.normalizedCost, "Costo base")
                : undefined
            }
          />
          <CopyableStat
            label="Código"
            value={resolvedData ? resolvedData.normalizedCode : "--"}
            onCopy={
              resolvedData
                ? () => handleCopy(resolvedData.normalizedCode, "Código")
                : undefined
            }
          />
          <QuickStat
            label="Márgenes activos"
            value={`${selectedMargins.suggested.toFixed(2)}% / ${selectedMargins.minimum.toFixed(
              2,
            )}%`}
          />
        </div>
        {copyMessage ? <p className="mt-3 text-xs text-slate-600">{copyMessage}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Resultados operativos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Precios y utilidades calculadas según la categoría seleccionada.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ResultCard
            title="Sugerido"
            salePrice={
              automaticCalculation
                ? formatMoney(automaticCalculation.suggested.salePrice)
                : "--"
            }
            margin={
              automaticCalculation
                ? formatPercent(automaticCalculation.suggested.marginPercent)
                : "--"
            }
            profit={
              automaticCalculation
                ? formatMoney(automaticCalculation.suggested.profitAmount)
                : "--"
            }
            profitPercentage={
              automaticCalculation
                ? formatPercent(automaticCalculation.suggested.profitPercentage)
                : "--"
            }
            onCopySalePrice={
              automaticCalculation
                ? () =>
                    handleCopy(
                      automaticCalculation.suggested.salePrice.toFixed(2),
                      "Precio sugerido",
                    )
                : undefined
            }
          />

          <ResultCard
            title="Mínimo"
            salePrice={
              automaticCalculation ? formatMoney(automaticCalculation.minimum.salePrice) : "--"
            }
            margin={
              automaticCalculation
                ? formatPercent(automaticCalculation.minimum.marginPercent)
                : "--"
            }
            profit={
              automaticCalculation
                ? formatMoney(automaticCalculation.minimum.profitAmount)
                : "--"
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
        <h2 className="text-lg font-semibold text-slate-900">Venta real (opcional)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Simula utilidad real para un precio final de venta.
        </p>

        <div className="mt-4 space-y-2">
          <label htmlFor="quick-view-sale-price" className="text-sm font-medium text-slate-800">
            Precio de venta real
          </label>
          <input
            id="quick-view-sale-price"
            type="text"
            inputMode="decimal"
            value={realSalePriceInput}
            onChange={(event) => setRealSalePriceInput(event.target.value)}
            placeholder="Ej: 140 o 140,00"
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {realSimulation.error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {realSimulation.error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <QuickStat
            label="Utilidad real ($)"
            value={realSimulation.value ? formatMoney(realSimulation.value.profit) : "--"}
          />
          <QuickStat
            label="Utilidad real (%)"
            value={
              realSimulation.value ? formatPercent(realSimulation.value.profitPercentage) : "--"
            }
          />
        </div>
      </section>
    </div>
  );
}

type ResultCardProps = {
  title: string;
  salePrice: string;
  margin: string;
  profit: string;
  profitPercentage: string;
  onCopySalePrice?: () => void;
};

function ResultCard({
  title,
  salePrice,
  margin,
  profit,
  profitPercentage,
  onCopySalePrice,
}: ResultCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{salePrice}</p>
        {onCopySalePrice ? (
          <button
            type="button"
            onClick={onCopySalePrice}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Copiar
          </button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2">
        <QuickStat label="Margen" value={margin} />
        <QuickStat label="Utilidad ($)" value={profit} />
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

type CopyableStatProps = {
  label: string;
  value: string;
  onCopy?: () => void;
};

function CopyableStat({ label, value, onCopy }: CopyableStatProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-900">{value}</p>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Copiar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
