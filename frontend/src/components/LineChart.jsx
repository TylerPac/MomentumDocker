import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function toNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

function formatValue(value) {
  if (!Number.isFinite(value)) return 'N/A';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

function formatDateShort(value) {
  if (!value) return 'N/A';
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[2]}/${m[3]}`;
  return s;
}

function niceStepFromRange(minY, maxY, targetTicks) {
  const span = Math.max(1e-9, maxY - minY);
  const raw = span / Math.max(2, targetTicks);
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function floorToStep(value, step) {
  return Math.floor(value / step) * step;
}

function ceilToStep(value, step) {
  return Math.ceil(value / step) * step;
}

function buildYScale(values, yTickMin, yTickStep, targetTickCount = 6) {
  const ys = (values || []).map((v) => toNumber(v));
  if (!ys.length) {
    return { min: 0, max: 1, ticks: [0, 1] };
  }

  const dataMin = Math.min(...ys);
  const dataMax = Math.max(...ys);
  const step = Number.isFinite(yTickStep) && yTickStep > 0
    ? yTickStep
    : niceStepFromRange(dataMin, dataMax, targetTickCount);

  const span = dataMax - dataMin;
  const pad = span > 0 ? span * 0.05 : step;
  let paddedMin = dataMin - pad;
  let paddedMax = dataMax + pad;

  if (Number.isFinite(yTickMin) && yTickMin <= dataMin) {
    paddedMin = Math.min(paddedMin, yTickMin);
  }

  let min = floorToStep(paddedMin, step);
  let max = ceilToStep(paddedMax, step);

  if (dataMin >= 0) min = Math.max(0, min);

  if (min === max) {
    min = Math.max(0, min - step);
    max = max + step;
  }

  const ticks = [];
  for (let v = min; v <= max + step / 2; v += step) {
    ticks.push(Number(v.toFixed(6)));
    if (ticks.length >= 14) break;
  }

  return { min, max, ticks };
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label || 'N/A'}</div>
      <div className="chart-tooltip__value">{formatValue(payload[0].value)}</div>
    </div>
  );
}

export default function LineChart({ title, labels, values, yLabel, yAxisLabel, yTickMin, yTickStep }) {
  const chartData = React.useMemo(() => {
    return (labels || []).map((label, i) => ({
      label: String(label || ''),
      value: toNumber(values?.[i]),
      shortLabel: formatDateShort(label),
    }));
  }, [labels, values]);

  const yScale = React.useMemo(() => buildYScale(values, yTickMin, yTickStep), [values, yTickMin, yTickStep]);
  const gradientId = `chart-gradient-${React.useId().replace(/:/g, '')}`;

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div className="chart-card__title">{title}</div>
        <div className="chart-card__meta">{yLabel}</div>
      </div>

      {chartData.length === 0 ? (
        <div className="chart-empty">No data</div>
      ) : (
        <div className="chart-wrap chart-wrap--recharts">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 16, right: 20, bottom: 20, left: 16 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: 'var(--color-placeholder)', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={{ stroke: 'var(--color-border)' }}
                minTickGap={24}
              />
              <YAxis
                domain={[yScale.min, yScale.max]}
                ticks={yScale.ticks}
                tickFormatter={formatValue}
                tick={{ fill: 'var(--color-placeholder)', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={{ stroke: 'var(--color-border)' }}
                width={52}
                label={{
                  value: yAxisLabel ?? yLabel,
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'var(--color-placeholder)',
                  style: { fontSize: 12, fontWeight: 700 },
                }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }}
                labelFormatter={(v, payload) => payload?.[0]?.payload?.label || String(v || '')}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-accent)' }}
                activeDot={{ r: 4.5, stroke: 'var(--color-bg-1)', strokeWidth: 1, fill: 'var(--color-accent)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
