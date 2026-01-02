import React from 'react';
import { apiFetch } from '../api';
import LineChart from '../components/LineChart';
import { formatMinutesAsClock } from '../utils/duration';
import { usePageMeta } from '../utils/pageMeta';

function flattenWorkoutMap(workoutMap) {
  const entries = Object.entries(workoutMap || {});
  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries;
}

export default function Dashboard() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  usePageMeta({ title: 'Momentum — Dashboard', description: 'Momentum dashboard and workout charts.' });

  const abortRef = React.useRef(null);

  const workoutMap = data?.workoutMap || {};
  const workoutType = data?.workoutType || '';
  const workoutName = data?.workoutName || '';

  const sortedWorkoutTypes = React.useMemo(() => flattenWorkoutMap(workoutMap), [workoutMap]);

  async function load(params) {
    setError('');
    setLoading(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
      const resp = await apiFetch(`/dashboard${qs}`, { signal: controller.signal });
      setData(resp);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    return () => abortRef.current?.abort?.();
  }, []);

  function onTypeChange(nextType) {
    const names = workoutMap?.[nextType] || [];
    const nextName = names[0] || '';
    load({ workoutType: nextType, workoutName: nextName });
  }

  function onNameChange(nextName) {
    load({ workoutType, workoutName: nextName });
  }

  const isCardio = workoutType === 'Cardio';
  const graph1Label = isCardio ? 'Pace (time/distance)' : 'Weight';
  const graph2Label = isCardio ? 'Distance' : 'Volume (weight × sets × reps)';

  const graph1Title = isCardio ? 'Pace' : 'Weight';
  const graph2Title = isCardio ? 'Distance per run' : 'Volume';

  const graph1AxisLabel = isCardio ? 'Pace' : 'Weight';
  const graph2AxisLabel = isCardio ? 'Distance' : 'Volume';

  return (
    <div className="main-content">
      <h2 className="page-title page-title--dashboard">Dashboard</h2>
      {error ? <div className="error-message">{error}</div> : null}

      <div className="dashboard-controls">
        <label>
          Workout Type
          <select value={workoutType} onChange={(e) => onTypeChange(e.target.value)} disabled={!data || loading}>
            <option value="" disabled>Select</option>
            {sortedWorkoutTypes.map(([type]) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Workout Name
          <select value={workoutName} onChange={(e) => onNameChange(e.target.value)} disabled={!workoutType || loading}>
            <option value="" disabled>Select</option>
            {(workoutMap?.[workoutType] || []).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <div className="dashboard-summary">
          <div>Total workouts: <strong>{data?.totalWorkouts ?? 0}</strong></div>
          <div>Latest workout: <strong>{data?.latestWorkout?.workoutName || '—'}</strong></div>
        </div>
      </div>

      <div className="dashboard-charts">
        <LineChart
          title={graph1Title}
          labels={data?.sortedDates || []}
          values={data?.graph1Values || []}
          yLabel={graph1Label}
          yAxisLabel={graph1AxisLabel}
        />
        <LineChart
          title={graph2Title}
          labels={data?.sortedDates || []}
          values={data?.graph2Values || []}
          yLabel={graph2Label}
          yAxisLabel={graph2AxisLabel}
        />
      </div>

      {loading ? (
        <div style={{ padding: '8px 0', opacity: 0.8 }}>Loading dashboard…</div>
      ) : null}

      <h3>Workout Details</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Name</th>
              {isCardio ? (
                <>
                  <th>Distance</th>
                  <th>Time</th>
                </>
              ) : (
                <>
                  <th>Weight</th>
                  <th>Sets</th>
                  <th>Reps</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {(data?.workoutDetails || []).map((w) => (
              <tr key={w.workoutId}>
                <td>{w.workoutDate}</td>
                <td>{w.workoutType}</td>
                <td>{w.workoutName}</td>
                {isCardio ? (
                  <>
                    <td>{w.distance ?? ''}</td>
                    <td>{formatMinutesAsClock(w.time)}</td>
                  </>
                ) : (
                  <>
                    <td>{w.weight ?? ''}</td>
                    <td>{w.sets ?? ''}</td>
                    <td>{w.reps ?? ''}</td>
                  </>
                )}
              </tr>
            ))}
            {!loading && (data?.workoutDetails || []).length === 0 ? (
              <tr><td colSpan={isCardio ? 5 : 6}>No workouts yet</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
