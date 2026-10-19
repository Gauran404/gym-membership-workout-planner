import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const ProgressDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [historyRes, statsRes] = await Promise.all([
        API.get('/progress/history?page=1&limit=50'),
        API.get('/progress/stats')
      ]);

      setLogs(historyRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      console.error('Progress dashboard error:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch progress dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await API.delete(`/progress/${id}`);
      fetchData(); // Refresh table and stats
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Progress History & Stats Dashboard</h3>
        <button
          onClick={() => fetchData()}
          style={{
            padding: '5px 10px',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Refresh Data
        </button>
      </div>

      {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}

      {/* Aggregate Stats Cards */}
      {stats && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '4px', flex: 1, border: '1px solid #d0dbe5' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}>Total Workouts</h4>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {stats.totalWorkouts || 0}
            </p>
          </div>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '4px', flex: 1, border: '1px solid #c8e6c9' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}>Total Calories</h4>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {stats.totalCaloriesBurned || 0} kcal
            </p>
          </div>
          <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '4px', flex: 1, border: '1px solid #ffe0b2' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}>Avg Weight</h4>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {stats.averageWeight ? stats.averageWeight.toFixed(1) : 0} kg
            </p>
          </div>
        </div>
      )}

      {/* History Table */}
      <h4 style={{ margin: '0 0 10px 0' }}>Recent Logs</h4>
      {loading ? (
        <p style={{ color: '#666' }}>Loading records...</p>
      ) : logs.length === 0 ? (
        <p style={{ color: '#777' }}>No progress records found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Date</th>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Workout</th>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Weight</th>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Duration</th>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Calories</th>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Notes</th>
              <th style={{ padding: '8px 10px', border: '1px solid #ccc' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc' }}>
                  {new Date(log.date).toLocaleDateString()}
                </td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc', fontWeight: 'bold' }}>
                  {log.workoutType}
                </td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc' }}>{log.weight} kg</td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc' }}>{log.durationMinutes} mins</td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc' }}>{log.caloriesBurned} kcal</td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc', color: '#666' }}>{log.notes || '—'}</td>
                <td style={{ padding: '8px 10px', border: '1px solid #ccc' }}>
                  <button
                    onClick={() => handleDelete(log._id)}
                    style={{
                      color: '#dc3545',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProgressDashboard;