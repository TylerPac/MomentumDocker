import React from 'react';

function clampNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function formatValue(value) {
  if (!Number.isFinite(value)) return '—';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

function formatDateShort(value) {
  if (!value) return '—';
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[2]}/${m[3]}`;
  return s;
}

function decimalsForStep(step) {
  if (!Number.isFinite(step) || step <= 0) return 2;
  const s = String(step);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : Math.min(4, s.length - dot - 1);
}

function formatTick(value, stepHint) {
  if (!Number.isFinite(value)) return '—';
  const d = decimalsForStep(stepHint);
  const out = d === 0 ? String(Math.round(value)) : value.toFixed(d);
  // trim trailing zeros
  return out.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
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

export default function LineChart({ title, labels, values, yLabel, yAxisLabel, yTickMin, yTickStep }) {
  const width = 700;
  const height = 240;
  const padLeft = 56;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 44;
  const gridLines = 4;
  const gradientId = React.useId();

  const svgRef = React.useRef(null);
  const [svgScale, setSvgScale] = React.useState({ sx: 1, sy: 1 });

  const [hoveredIndex, setHoveredIndex] = React.useState(-1);
  const [hoverPos, setHoverPos] = React.useState(null);

  React.useEffect(() => {
    if (!svgRef.current) return;

    let rafId = 0;

    function measureScale() {
      const svg = svgRef.current;
      if (!svg) return;

      // Prefer CTM because it reflects actual viewBox->screen scale,
      // even when CSS/layout causes non-uniform stretching.
      const ctm = typeof svg.getScreenCTM === 'function' ? svg.getScreenCTM() : null;
      // Use the lengths of transformed unit vectors to account for
      // any skew/rotation that can appear in the CTM.
      const sx = ctm ? clampNumber(Math.hypot(ctm.a, ctm.c), NaN) : NaN;
      const sy = ctm ? clampNumber(Math.hypot(ctm.b, ctm.d), NaN) : NaN;
      if (Number.isFinite(sx) && sx > 0 && Number.isFinite(sy) && sy > 0) {
        setSvgScale((prev) => (
          Math.abs(prev.sx - sx) < 1e-4 && Math.abs(prev.sy - sy) < 1e-4
            ? prev
            : { sx, sy }
        ));
        return;
      }

      // Fallback for environments where getScreenCTM is unavailable.
      const rect = svg.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const nextSx = rect.width / width;
      const nextSy = rect.height / height;
      if (!Number.isFinite(nextSx) || nextSx <= 0 || !Number.isFinite(nextSy) || nextSy <= 0) return;
      setSvgScale((prev) => (
        Math.abs(prev.sx - nextSx) < 1e-4 && Math.abs(prev.sy - nextSy) < 1e-4
          ? prev
          : { sx: nextSx, sy: nextSy }
      ));
    }

    function scheduleScale() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(measureScale);
      });
    }

    scheduleScale();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleScale) : null;
    ro?.observe(svgRef.current);
    window.addEventListener('resize', scheduleScale);
    document.addEventListener('fullscreenchange', scheduleScale);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener('resize', scheduleScale);
      document.removeEventListener('fullscreenchange', scheduleScale);
    };
  }, [width, height]);

  const yScale = React.useMemo(() => {
    const ys = (values || []).map((v) => clampNumber(v, 0));
    if (ys.length === 0) {
      return { min: 0, max: 1, step: 1, ticks: [] };
    }

    const dataMin = Math.min(...ys);
    const dataMax = Math.max(...ys);

    const step = Number.isFinite(yTickStep) && yTickStep > 0
      ? yTickStep
      : niceStepFromRange(dataMin, dataMax, gridLines + 3);

    // Add a little padding so points don't sit on the bounds.
    const span = dataMax - dataMin;
    const pad = span > 0 ? span * 0.05 : step;
    let paddedMin = dataMin - pad;
    let paddedMax = dataMax + pad;

    // If a min is provided, treat it as a *preferred* lower bound, but never
    // allow it to clip the dataset.
    if (Number.isFinite(yTickMin) && yTickMin <= dataMin) {
      paddedMin = Math.min(paddedMin, yTickMin);
    }

    let min = floorToStep(paddedMin, step);
    let max = ceilToStep(paddedMax, step);

    // These series are non-negative in the app; avoid negative axes.
    if (dataMin >= 0) min = Math.max(0, min);

    if (min === max) {
      min = Math.max(0, min - step);
      max = max + step;
    }

    const ticks = [];
    const maxTicks = 14;
    for (let v = min; v <= max + step / 2; v += step) {
      ticks.push(v);
      if (ticks.length >= maxTicks) break;
    }

    return { min, max, step, ticks };
  }, [values, yTickMin, yTickStep, gridLines]);

  const yTicks = React.useMemo(() => {
    const chartH = height - padTop - padBottom;
    if (!yScale.ticks.length) return [];

    const span = (yScale.max - yScale.min) || 1;
    return yScale.ticks.map((value) => {
      const t = (yScale.max - value) / span;
      const y = padTop + (chartH * t);
      return { value, y, step: yScale.step };
    });
  }, [yScale, height, padTop, padBottom]);

  const points = React.useMemo(() => {
    const xs = (labels || []).map((_, i) => i);
    const ys = (values || []).map((v) => clampNumber(v, 0));
    if (xs.length === 0) return [];

    const spanY = (yScale.max - yScale.min) || 1;
    const spanX = (xs.length - 1) || 1;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    return ys.map((y, i) => {
      const xPx = padLeft + (chartW * (i / spanX));
      const yPx = padTop + (chartH * (1 - ((y - yScale.min) / spanY)));
      return { x: xPx, y: yPx };
    });
  }, [labels, values, yScale, width, height, padLeft, padRight, padTop, padBottom]);

  const xTicks = React.useMemo(() => {
    const ls = labels || [];
    if (ls.length === 0) return [];

    const maxTicks = 5;
    const tickCount = Math.min(maxTicks, ls.length);
    const spanX = (ls.length - 1) || 1;
    const chartW = width - padLeft - padRight;

    const indices = new Set();
    for (let i = 0; i < tickCount; i++) {
      indices.add(Math.round((i * (ls.length - 1)) / (tickCount - 1 || 1)));
    }

    return Array.from(indices)
      .sort((a, b) => a - b)
      .map((idx) => ({
        idx,
        label: formatDateShort(ls[idx]),
        x: padLeft + (chartW * (idx / spanX)),
      }));
  }, [labels, width, padLeft, padRight]);

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  const areaPolygon = React.useMemo(() => {
    if (points.length === 0) return '';
    const baselineY = height - padBottom;
    const first = points[0];
    const last = points[points.length - 1];
    return `${polyline} ${last.x},${baselineY} ${first.x},${baselineY}`;
  }, [points, polyline, height, padBottom]);

  function showTooltip(index) {
    if (index < 0 || index >= points.length) return;
    const p = points[index];
    setHoveredIndex(index);
    setHoverPos({
      leftPct: (p.x / width) * 100,
      topPct: (p.y / height) * 100,
    });
  }

  function hideTooltip() {
    setHoveredIndex(-1);
    setHoverPos(null);
  }

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div className="chart-card__title">{title}</div>
        <div className="chart-card__meta">{yLabel}</div>
      </div>

      {points.length === 0 ? (
        <div className="chart-empty">No data</div>
      ) : (
        <div className="chart-wrap">
          <svg
            className="chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            onMouseLeave={hideTooltip}
            ref={svgRef}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

          {/* grid (aligned with ticks) */}
          {yTicks.map((t, i) => (
            <line
              key={i}
              className="chart-grid"
              x1={padLeft}
              y1={t.y}
              x2={width - padRight}
              y2={t.y}
            />
          ))}

          {/* axes */}
          <line className="chart-axis" x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} />
          <line className="chart-axis" x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} />

          {/* series */}
          <g className="chart-series">
            {areaPolygon ? (
              <polygon
                className="chart-area"
                points={areaPolygon}
                fill={`url(#${gradientId})`}
              />
            ) : null}

            <polyline className="chart-line" points={polyline} />

            {points.map((p, idx) => {
              const isActive = idx === hoveredIndex;
              const r = isActive ? 4 : 3;
              const hit = 12;
              // SVG is stretched to fill the element (preserveAspectRatio="none").
              // Use ellipses with radii compensated by the X/Y scale so markers stay circular on screen.
              const rx = r / (svgScale.sx || 1);
              const ry = r / (svgScale.sy || 1);
              const hitRx = hit / (svgScale.sx || 1);
              const hitRy = hit / (svgScale.sy || 1);

              return (
                <g key={idx}>
                  {/* larger invisible hit target for hover */}
                  <ellipse
                    className="chart-hit"
                    cx={p.x}
                    cy={p.y}
                    rx={hitRx}
                    ry={hitRy}
                    onMouseEnter={() => showTooltip(idx)}
                    onMouseMove={() => showTooltip(idx)}
                    onFocus={() => showTooltip(idx)}
                    onBlur={hideTooltip}
                    tabIndex={0}
                  />
                  <ellipse
                    className={isActive ? 'chart-point chart-point--active' : 'chart-point'}
                    cx={p.x}
                    cy={p.y}
                    rx={rx}
                    ry={ry}
                  />
                </g>
              );
            })}
          </g>
          </svg>

          {/* Non-stretched axis tick labels (HTML overlay) */}
          <div className="chart-overlay" aria-hidden="true">
            {yTicks.map((t, i) => (
              <div
                key={`y-${i}`}
                className="chart-y-tick"
                style={{ top: `${(t.y / height) * 100}%`, left: `${(padLeft / width) * 100}%` }}
              >
                {formatTick(t.value, t.step)}
              </div>
            ))}

            {xTicks.map((t) => (
              <div
                key={`x-${t.idx}`}
                className="chart-x-tick"
                style={{ left: `${(t.x / width) * 100}%`, top: `${((height - padBottom) / height) * 100}%` }}
              >
                {t.label}
              </div>
            ))}

            <div
              className="chart-y-axis-label"
              style={{ left: `${(padLeft / width) * 100}%` }}
            >
              {yAxisLabel ?? yLabel}
            </div>
          </div>

          {hoverPos && hoveredIndex >= 0 ? (
            <div
              className="chart-tooltip"
              style={{ left: `${hoverPos.leftPct}%`, top: `${hoverPos.topPct}%` }}
            >
              <div className="chart-tooltip__label">{labels?.[hoveredIndex] ?? '—'}</div>
              <div className="chart-tooltip__value">{formatValue(clampNumber(values?.[hoveredIndex], NaN))}</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
