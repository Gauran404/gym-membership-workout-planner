import React, { useState } from 'react';
import API from '../api/axiosConfig';

const WORKOUT_PRESETS = [
  'Upper Body & Core',
  'Leg Day',
  'Cardio & Running',
  'HIIT Intervals',
  'Full Body Strength'
];

const ProgressForm = ({ onProgressLogged }) => {
  const [formData, setFormData] = useState({
    weight: '',
    workoutType: '',
    durationMinutes: '',
    caloriesBurned: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePresetSelect = (preset) => {
    setFormData({ ...formData, workoutType: preset });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors([]);
    setIsSubmitting(true);

    try {
      const payload = {
        weight: Number(formData.weight),
        workoutType: formData.workoutType,
        durationMinutes: Number(formData.durationMinutes),
        caloriesBurned: formData.caloriesBurned ? Number(formData.caloriesBurned) : 0,
        notes: formData.notes,
        date: formData.date
      };

      const res = await API.post('/progress', payload);
      setMessage(res.data.message || 'Progress logged successfully!');
      
      setFormData({
        weight: '',
        workoutType: '',
        durationMinutes: '',
        caloriesBurned: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });

      if (onProgressLogged) {
        setTimeout(() => {
          onProgressLogged();
        }, 1200);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([err.response?.data?.message || 'Failed to submit progress']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px' }}>
      <h3 style={{ margin: '0 0 12px 0' }}>Log Daily Progress</h3>

      {message && <p style={{ color: 'green', fontWeight: 'bold' }}>✓ {message}</p>}
      {errors.length > 0 && (
        <div style={{ color: 'red', marginBottom: '12px', fontSize: '13px' }}>
          {errors.map((err, idx) => (
            <p key={idx} style={{ margin: '3px 0' }}>• {err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            Date:
          </label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            Body Weight (kg):
          </label>
          <input
            type="number"
            step="0.1"
            name="weight"
            placeholder="e.g. 74.5"
            required
            value={formData.weight}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            Workout Type:
          </label>
          <input
            type="text"
            name="workoutType"
            placeholder="e.g. Cardio, Leg Day, Push Workout"
            required
            value={formData.workoutType}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '6px' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {WORKOUT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  border: '1px solid #ccc',
                  background: formData.workoutType === preset ? '#007bff' : '#f0f0f0',
                  color: formData.workoutType === preset ? '#fff' : '#333',
                  cursor: 'pointer'
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            Duration (Minutes):
          </label>
          <input
            type="number"
            name="durationMinutes"
            placeholder="e.g. 45"
            required
            min="1"
            value={formData.durationMinutes}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            Calories Burned (kcal):
          </label>
          <input
            type="number"
            name="caloriesBurned"
            placeholder="e.g. 350"
            min="0"
            value={formData.caloriesBurned}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
            Notes:
          </label>
          <textarea
            name="notes"
            rows="3"
            placeholder="Workout session notes..."
            value={formData.notes}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 16px',
            background: isSubmitting ? '#90caf9' : '#007bff',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save Progress'}
        </button>
      </form>
    </div>
  );
};

export default ProgressForm;