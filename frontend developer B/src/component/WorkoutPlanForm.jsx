import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const WorkoutPlanForm = () => {
  const [plans, setPlans] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    goal: 'Muscle Gain',
    level: 'Beginner',
    daysPerWeek: 4
  });

  // For TC_WP_004: Add Exercise to existing plan
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    name: 'Bench Press',
    sets: 3,
    reps: 12
  });

  // For TC_WP_005: Custom Confirm Dialog
  const [planToDelete, setPlanToDelete] = useState(null);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadPlans = async () => {
    try {
      const res = await API.get('/workout-plans');
      setPlans(res.data?.data || []);
    } catch (err) {
      console.error('Fetch workout plans error:', err);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExerciseChange = (e) => {
    setExerciseData({ ...exerciseData, [e.target.name]: e.target.value });
  };

  // TC_WP_001, TC_WP_002, TC_WP_003: Create & Save Plan
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    const trimmedName = formData.planName.trim();

    // TC_WP_002: Create workout plan with empty plan name
    if (!trimmedName) {
      setErrorMessage('Plan name is required');
      return;
    }

    // TC_WP_003: Days per week must be between 1 and 7
    const days = Number(formData.daysPerWeek);
    if (isNaN(days) || days < 1 || days > 7) {
      setErrorMessage('Days per week must be between 1 and 7');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        planName: trimmedName,
        goal: formData.goal,
        level: formData.level,
        daysPerWeek: days
      };

      const res = await API.post('/workout-plans', payload);
      setMessage(res.data.message || 'Plan created successfully');
      setFormData({
        planName: '',
        goal: 'Muscle Gain',
        level: 'Beginner',
        daysPerWeek: 4
      });
      setShowCreateForm(false);
      await loadPlans();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  // TC_WP_004: Add Exercise to existing plan
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setMessage('');
    setErrorMessage('');

    if (!exerciseData.name || !exerciseData.name.trim()) {
      setErrorMessage('Exercise name is required');
      return;
    }

    try {
      const res = await API.post(`/workout-plans/${selectedPlanId}/exercises`, {
        name: exerciseData.name.trim(),
        sets: Number(exerciseData.sets) || 3,
        reps: Number(exerciseData.reps) || 10
      });

      setMessage(`Exercise "${exerciseData.name}" added successfully to the plan!`);
      setExerciseData({ name: '', sets: 3, reps: 10 });
      setShowAddExerciseForm(false);
      await loadPlans();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to add exercise');
    }
  };

  // TC_WP_005: Delete plan with confirmation dialog
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setMessage('');
    setErrorMessage('');

    try {
      const res = await API.delete(`/workout-plans/${planToDelete._id}`);
      setMessage(res.data?.message || 'Plan removed successfully from My Plans');
      setPlanToDelete(null);
      if (selectedPlanId === planToDelete._id) {
        setSelectedPlanId(null);
      }
      await loadPlans();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Workout Plan</h3>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setErrorMessage('');
            setMessage('');
          }}
          style={{
            padding: '7px 14px',
            background: showCreateForm ? '#6c757d' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Plan'}
        </button>
      </div>

      {message && (
        <div style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #a5d6a7',
          padding: '10px 14px',
          borderRadius: '4px',
          marginBottom: '14px',
          fontSize: '13px'
        }}>
          ✓ {message}
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          border: '1px solid #ef9a9a',
          padding: '10px 14px',
          borderRadius: '4px',
          marginBottom: '14px',
          fontSize: '13px'
        }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Confirmation Dialog for TC_WP_005 */}
      {planToDelete && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeeba',
          color: '#856404',
          padding: '14px',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
            Are you sure you want to delete the plan "{planToDelete.planName || planToDelete.title}"?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleConfirmDelete}
              style={{
                padding: '6px 14px',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => setPlanToDelete(null)}
              style={{
                padding: '6px 14px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create New Plan Form (TC_WP_001, TC_WP_002, TC_WP_003) */}
      {showCreateForm && (
        <form noValidate onSubmit={handleSavePlan} style={{
          background: '#f9f9f9',
          border: '1px solid #ddd',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Create New Workout Plan</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Plan Name:
              </label>
              <input
                type="text"
                name="planName"
                placeholder="e.g. Beginner Strength"
                value={formData.planName}
                onChange={handleFormChange}
                style={{ width: '100%', padding: '7px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Goal:
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleFormChange}
                style={{ width: '100%', padding: '7px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Fitness">Fitness</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Level:
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleFormChange}
                style={{ width: '100%', padding: '7px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Days per week (1 - 7):
              </label>
              <input
                type="number"
                name="daysPerWeek"
                value={formData.daysPerWeek}
                onChange={handleFormChange}
                style={{ width: '100%', padding: '7px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: '8px 14px',
                background: '#e0e0e0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* My Plans List (TC_WP_001, TC_WP_004, TC_WP_005) */}
      <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
        My Plans
      </h4>

      {plans.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>
          No workout plans found in My Plans. Click "Create New Plan" to add one.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {plans.map((plan) => {
            const isPlanSelected = selectedPlanId === plan._id;
            const planTitle = plan.planName || plan.title || 'Workout Plan';

            return (
              <div
                key={plan._id}
                style={{
                  border: isPlanSelected ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  background: isPlanSelected ? '#f8fbff' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{planTitle}</h4>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Goal: <strong>{plan.goal || 'General'}</strong> | Level: <strong>{plan.level || 'Beginner'}</strong> | Days/week: <strong>{plan.daysPerWeek || 4}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedPlanId(isPlanSelected ? null : plan._id);
                        setShowAddExerciseForm(false);
                      }}
                      style={{
                        padding: '5px 12px',
                        background: isPlanSelected ? '#007bff' : '#f0f0f0',
                        color: isPlanSelected ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {isPlanSelected ? 'Close Plan' : 'Open the plan'}
                    </button>

                    <button
                      onClick={() => setPlanToDelete(plan)}
                      style={{
                        padding: '5px 12px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Opened Plan Details: Exercises list & TC_WP_004 Add Exercise */}
                {isPlanSelected && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h5 style={{ margin: 0, fontSize: '13px' }}>
                        Exercises ({plan.exercises?.length || 0}):
                      </h5>
                      <button
                        onClick={() => setShowAddExerciseForm(!showAddExerciseForm)}
                        style={{
                          padding: '4px 10px',
                          background: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {showAddExerciseForm ? 'Cancel' : '+ Add Exercise'}
                      </button>
                    </div>

                    {/* Add Exercise Form (TC_WP_004) */}
                    {showAddExerciseForm && (
                      <form onSubmit={handleAddExercise} style={{
                        background: '#eef5fc',
                        border: '1px solid #c8ddf2',
                        padding: '10px 12px',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <input
                          type="text"
                          name="name"
                          placeholder="Exercise (e.g. Bench Press)"
                          value={exerciseData.name}
                          onChange={handleExerciseChange}
                          required
                          style={{ flex: 2, minWidth: '150px', padding: '5px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <label style={{ fontSize: '12px' }}>Sets:</label>
                          <input
                            type="number"
                            name="sets"
                            value={exerciseData.sets}
                            onChange={handleExerciseChange}
                            required
                            min="1"
                            style={{ width: '50px', padding: '5px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <label style={{ fontSize: '12px' }}>Reps:</label>
                          <input
                            type="number"
                            name="reps"
                            value={exerciseData.reps}
                            onChange={handleExerciseChange}
                            required
                            min="1"
                            style={{ width: '50px', padding: '5px 6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                          />
                        </div>
                        <button
                          type="submit"
                          style={{
                            padding: '5px 12px',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          Add
                        </button>
                      </form>
                    )}

                    {(!plan.exercises || plan.exercises.length === 0) ? (
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#777', fontStyle: 'italic' }}>
                        No exercises added yet. Click "Add Exercise" to add one.
                      </p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '6px' }}>
                        <thead>
                          <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                            <th style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Exercise</th>
                            <th style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Sets</th>
                            <th style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Reps</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.exercises.map((ex, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{ex.name}</td>
                              <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{ex.sets}</td>
                              <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{ex.reps}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanForm;