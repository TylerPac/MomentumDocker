import React from 'react';
import { apiFetch } from '../api';
import LineChart from '../components/LineChart';
import { formatMinutesAsClock } from '../utils/duration';

function flattenWorkoutMap(workoutMap) {
  const entries = Object.entries(workoutMap || {});
  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries;
}

export default function Dashboard() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');

  const workoutMap = data?.workoutMap || {};
  const workoutType = data?.workoutType || '';
  const workoutName = data?.workoutName || '';

  async function load(params) {
    setError('');
    try {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
      const resp = await apiFetch(`/dashboard${qs}`);
      setData(resp);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard');
    }
  }

  React.useEffect(() => {
    load();
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
  const graph2Label = isCardio ? 'Distance' : 'Reps';

  const graph1Title = isCardio ? 'Pace' : 'Weight';
  const graph2Title = isCardio ? 'Distance per run' : 'Reps';

  const graph1AxisLabel = isCardio ? 'Pace' : 'Weight';
  const graph2AxisLabel = isCardio ? 'Distance' : 'Reps';

  // Make cardio charts "clean" with fixed increments.
  const graph1TickMin = isCardio ? 8 : undefined;
  const graph1TickStep = isCardio ? 0.5 : undefined; // 30s if pace is stored as minutes
  const graph2TickMin = isCardio ? 1.5 : undefined;
  const graph2TickStep = isCardio ? 0.25 : undefined;

  return (
    <div className="main-content">
      <h2>Dashboard</h2>
      {error ? <div className="error-message">{error}</div> : null}

      <div className="dashboard-controls">
        <label>
          Workout Type
          <select value={workoutType} onChange={(e) => onTypeChange(e.target.value)}>
            <option value="" disabled>Select</option>
            {flattenWorkoutMap(workoutMap).map(([type]) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Workout Name
          <select value={workoutName} onChange={(e) => onNameChange(e.target.value)} disabled={!workoutType}>
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
          yTickMin={graph1TickMin}
          yTickStep={graph1TickStep}
        />
        <LineChart
          title={graph2Title}
          labels={data?.sortedDates || []}
          values={data?.graph2Values || []}
          yLabel={graph2Label}
          yAxisLabel={graph2AxisLabel}
          yTickMin={graph2TickMin}
          yTickStep={graph2TickStep}
        />
      </div>

      <h3>Workout Details</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Name</th>
              <th>Distance</th>
              <th>Time</th>
              <th>Weight</th>
              <th>Reps</th>
            </tr>
          </thead>
          <tbody>
            {(data?.workoutDetails || []).map((w) => (
              <tr key={w.workoutId}>
                <td>{w.workoutDate}</td>
                <td>{w.workoutType}</td>
                <td>{w.workoutName}</td>
                <td>{w.distance ?? ''}</td>
                <td>{w.workoutType === 'Cardio' ? formatMinutesAsClock(w.time) : (w.time ?? '')}</td>
                <td>{w.weight ?? ''}</td>
                <td>{w.reps ?? ''}</td>
              </tr>
            ))}
            {(data?.workoutDetails || []).length === 0 ? (
              <tr><td colSpan={7}>No workouts yet</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
