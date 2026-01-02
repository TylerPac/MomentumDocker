import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { formatMinutesAsClock, isClockInputMaybeValid, parseClockToMinutes } from '../utils/duration';

export default function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [workoutType, setWorkoutType] = React.useState('Cardio');
  const [workoutName, setWorkoutName] = React.useState('');
  const [workoutDate, setWorkoutDate] = React.useState('');

  const [distance, setDistance] = React.useState('');
  const [time, setTime] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [reps, setReps] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    apiFetch(`/workouts/${id}`)
      .then((w) => {
        const type = w.workoutType || 'Cardio';
        setWorkoutType(type);
        setWorkoutName(w.workoutName || '');
        setWorkoutDate(w.workoutDate || '');
        setDistance(w.distance ?? '');
        setTime(type === 'Cardio' ? formatMinutesAsClock(w.time) : (w.time ?? ''));
        setWeight(w.weight ?? '');
        setReps(w.reps ?? '');
      })
      .catch((err) => setError(err?.message || 'Failed to load workout'))
      .finally(() => setLoading(false));
  }, [id]);

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
        reps: workoutType === 'Weightlifting' && reps !== '' ? Number(reps) : null,
      };

      await apiFetch(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      navigate('/history');
    } catch (err) {
      setError(err?.message || 'Failed to update workout');
    }
  }

  if (loading) return <div className="main-content"><div className="page">Loading…</div></div>;

  const isCardio = workoutType === 'Cardio';

  return (
    <div className="main-content">
      <div className="page page-narrow">
        <h2>Edit Workout</h2>
        {error ? <div className="error-message">{error}</div> : null}

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
          <input value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} required />
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
              Reps
              <input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" />
            </label>
          </>
        )}

          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
