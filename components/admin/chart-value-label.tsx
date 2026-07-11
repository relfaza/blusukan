import type { ReactElement } from "react";
import type { LabelProps } from "recharts";

const MAX_LABELS_BEFORE_THINNING = 6;

/**
 * Content renderer untuk recharts <LabelList> — kalau titik data terlalu banyak/padat
 * (lebih dari MAX_LABELS_BEFORE_THINNING), cuma titik dengan nilai tertinggi yang dilabeli
 * supaya chart tidak penuh sesak. Kalau datanya sedikit, semua titik dilabeli langsung.
 */
export function pointValueLabelContent(values: number[], formatValue: (v: number) => string, color: string) {
  const showAll = values.length <= MAX_LABELS_BEFORE_THINNING;
  let maxIndex = 0;
  values.forEach((v, i) => {
    if (v > values[maxIndex]) maxIndex = i;
  });

  return function ChartValueLabel(props: LabelProps): ReactElement | null {
    const { x, y, value, index } = props as typeof props & { index?: number };
    if (value == null || index == null) return null;
    if (!showAll && index !== maxIndex) return null;
    return (
      <text x={x} y={Number(y ?? 0) - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
        {formatValue(Number(value))}
      </text>
    );
  };
}
