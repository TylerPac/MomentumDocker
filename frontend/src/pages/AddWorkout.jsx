import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { isClockInputMaybeValid, parseClockToMinutes } from '../utils/duration';
import { usePageMeta } from '../utils/pageMeta';

export default function AddWorkout() {
  const navigate = useNavigate();

  usePageMeta({ title: 'Momentum — Add Workout', description: 'Add a new cardio or weightlifting workout.' });

  const [workoutType, setWorkoutType] = React.useState('Cardio');
  const [workoutName, setWorkoutName] = React.useState('');
  const [workoutDate, setWorkoutDate] = React.useState('');

  const [distance, setDistance] = React.useState('');
  const [time, setTime] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [sets, setSets] = React.useState('');
  const [reps, setReps] = React.useState('');

  const [existingNames, setExistingNames] = React.useState([]);
  const [error, setError] = React.useState('');

  const [namesLoading, setNamesLoading] = React.useState(true);
  const abortRef = React.useRef(null);

  React.useEffect(() => {
    setNamesLoading(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    apiFetch('/workouts/names', { signal: controller.signal })
      .then((names) => setExistingNames(names || []))
      .catch(() => setExistingNames([]))
      .finally(() => {
        if (abortRef.current === controller) setNamesLoading(false);
      });

    return () => abortRef.current?.abort?.();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      let parsedTime = null;
      if (workoutType === 'Cardio' && time.trim() !== '') {
        parsedTime = parseClockToMinutes(time);
      }

      const payload = {
        workoutType,
        workoutName,
        workoutDate,
        distance: workoutType === 'Cardio' && distance !== '' ? Number(distance) : null,
        time: workoutType === 'Cardio' ? parsedTime : null,
        weight: workoutType === 'Weightlifting' && weight !== '' ? Number(weight) : null,
        sets: workoutType === 'Weightlifting' && sets !== '' ? Number(sets) : null,
        reps: workoutType === 'Weightlifting' && reps !== '' ? Number(reps) : null,
      };

      await apiFetch('/workouts', { method: 'POST', body: JSON.stringify(payload) });
      navigate('/history');
    } catch (err) {
      setError(err?.message || 'Failed to add workout');
    }
  }

  const isCardio = workoutType === 'Cardio';

  return (
    <div className="main-content">
      <div className="page page-narrow">
        <h2>Add a New Workout</h2>
        {error ? <div className="error-message">{error}</div> : null}
        {namesLoading ? <div style={{ padding: '8px 0', opacity: 0.8 }}>Loading workout names…</div> : null}

        <form onSubmit={onSubmit} className="workout-form">
        <label>
          Workout Type
          <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
            <option value="Cardio">Cardio</option>
            <option value="Weightlifting">Weightlifting</option>
          </select>
        </label>

        <label>
          Workout Name
          <input list="workout-names" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} required />
          <datalist id="workout-names">
            {existingNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>

        <label>
          Workout Date
          <input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} required />
        </label>

        {isCardio ? (
          <>
            <label>
              Distance
              <input value={distance} onChange={(e) => setDistance(e.target.value)} inputMode="decimal" />
            </label>
            <label>
              Time
              <input
                value={time}
                onChange={(e) => {
                  const next = e.target.value;
                  if (!isClockInputMaybeValid(next)) return;
                  setTime(next);
                }}
                placeholder="m:ss"
                inputMode="numeric"
                autoComplete="off"
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Weight
              <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" />
            </label>
            <label>
              Sets
              <input value={sets} onChange={(e) => setSets(e.target.value)} inputMode="numeric" />
            </label>
            <label>
              Reps
              <input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" />
            </label>
          </>
        )}

          <button type="submit" className="btn-primary">Add Workout</button>
        </form>
      </div>
    </div>
  );
}
