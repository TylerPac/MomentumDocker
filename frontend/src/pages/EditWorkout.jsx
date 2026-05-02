import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { formatMinutesAsClock, isClockInputMaybeValid, parseClockToMinutes } from '../utils/duration';
import { usePageMeta } from '../utils/pageMeta';
import { useToast } from '../utils/toast';
import { useAuth } from '../auth';

export default function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const unitSystem = user?.unitSystem || 'metric';
  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const distanceUnit = unitSystem === 'imperial' ? 'mi' : 'km';

  usePageMeta({ title: 'Momentum — Edit Workout', description: 'Edit an existing workout.' });

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [workoutType, setWorkoutType] = React.useState('Cardio');
  const [workoutName, setWorkoutName] = React.useState('');
  const [workoutDate, setWorkoutDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const [distance, setDistance] = React.useState('');
  const [time, setTime] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [sets, setSets] = React.useState('');
  const [reps, setReps] = React.useState('');
  const abortRef = React.useRef(null);

  React.useEffect(() => {
    setLoading(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    apiFetch(`/workouts/${id}`, { signal: controller.signal })
      .then((w) => {
        const type = w.workoutType || 'Cardio';
        setWorkoutType(type);
        setWorkoutName(w.workoutName || '');
        setWorkoutDate(w.workoutDate || '');
        setDistance(w.distance ?? '');
        setTime(type === 'Cardio' ? formatMinutesAsClock(w.time) : (w.time ?? ''));
        setWeight(w.weight ?? '');
        setSets(w.sets ?? '');
        setReps(w.reps ?? '');
        setNotes(w.notes || '');
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Failed to load workout');
      })
      .finally(() => {
        if (abortRef.current === controller) setLoading(false);
      });

    return () => abortRef.current?.abort?.();
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
        sets: workoutType === 'Weightlifting' && sets !== '' ? Number(sets) : null,
        reps: workoutType === 'Weightlifting' && reps !== '' ? Number(reps) : null,
        notes: notes || null,
      };

      await apiFetch(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Workout updated!', 'success');
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
                Distance ({distanceUnit})
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
                Weight ({weightUnit})
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

          <label>
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any injuries or PRs?"
              maxLength={1000}
            />
          </label>

          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}

