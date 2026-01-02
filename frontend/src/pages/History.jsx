import React from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { formatMinutesAsClock } from '../utils/duration';

export default function History() {
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState('');

  async function load() {
    setError('');
    try {
      const rows = await apiFetch('/workouts/history');
      setItems(rows || []);
    } catch (err) {
      setError(err?.message || 'Failed to load history');
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    if (!window.confirm('Delete this workout?')) return;
    await apiFetch(`/workouts/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="main-content">
      <div className="page">
        <h2>Workout History</h2>
        {error ? <div className="error-message">{error}</div> : null}

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
                <td>{w.reps ?? ''}</td>
                <td>
                  <div className="action-buttons">
                    <Link className="edit-btn" to={`/workouts/${w.workoutId}/edit`}>Edit</Link>
                    <button className="delete-btn" type="button" onClick={() => onDelete(w.workoutId)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr><td colSpan={8}>No workouts yet</td></tr>
            ) : null}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
