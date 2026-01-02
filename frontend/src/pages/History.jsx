import React from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { formatMinutesAsClock } from '../utils/duration';
import { usePageMeta } from '../utils/pageMeta';

export default function History() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  usePageMeta({ title: 'Momentum — Workout History', description: 'View and manage your workout history.' });

  const abortRef = React.useRef(null);

  async function load() {
    setError('');
    setLoading(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const rows = await apiFetch('/workouts/history', { signal: controller.signal });
      setItems(rows || []);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Failed to load history');
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    return () => abortRef.current?.abort?.();
  }, []);

  async function onDelete(id) {
    if (!window.confirm('Delete this workout?')) return;
    if (loading) return;
    await apiFetch(`/workouts/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="main-content">
      <div className="page">
        <h2>Workout History</h2>
        {error ? <div className="error-message">{error}</div> : null}
        {loading ? <div style={{ padding: '8px 0', opacity: 0.8 }}>Loading history…</div> : null}

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
              <th>Sets</th>
              <th>Reps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={w.workoutId}>
                <td>{w.workoutDate}</td>
                <td>{w.workoutType}</td>
                <td>{w.workoutName}</td>
                <td>{w.distance ?? ''}</td>
                <td>{w.workoutType === 'Cardio' ? formatMinutesAsClock(w.time) : (w.time ?? '')}</td>
                <td>{w.weight ?? ''}</td>
                <td>{w.sets ?? ''}</td>
                <td>{w.reps ?? ''}</td>
                <td>
                  <div className="action-buttons">
                    <Link className="edit-btn" to={`/workouts/${w.workoutId}/edit`}>Edit</Link>
                    <button className="delete-btn" type="button" onClick={() => onDelete(w.workoutId)} disabled={loading}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr><td colSpan={9}>No workouts yet</td></tr>
            ) : null}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
