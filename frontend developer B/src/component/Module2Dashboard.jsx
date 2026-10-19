import React, { useState } from 'react';
import WorkoutPlanForm from './WorkoutPlanForm';
import ProgressForm from './ProgressForm';
import ProgressDashboard from './ProgressDashboard';

const Module2Dashboard = ({ initialRole }) => {
  const [userRole, setUserRole] = useState(
    initialRole || localStorage.getItem('userRole') || 'Member'
  );
  // Default to workoutPlan so the Workout Plan test cases are immediately accessible
  const [activeTab, setActiveTab] = useState('workoutPlan');

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '16px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>
          Gym Membership and Workout Planner
        </h2>
        <div>
          <label style={{ marginRight: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Active View:
          </label>
          <select
            value={userRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Member">Member View</option>
            <option value="Trainer">Trainer View</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('workoutPlan')}
          style={{
            padding: '8px 16px',
            fontWeight: activeTab === 'workoutPlan' ? 'bold' : 'normal',
            background: activeTab === 'workoutPlan' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'workoutPlan' ? '#ffffff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Workout Plan Page
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '8px 16px',
            fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
            background: activeTab === 'dashboard' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'dashboard' ? '#ffffff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Progress Dashboard
        </button>

        <button
          onClick={() => setActiveTab('logProgress')}
          style={{
            padding: '8px 16px',
            fontWeight: activeTab === 'logProgress' ? 'bold' : 'normal',
            background: activeTab === 'logProgress' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'logProgress' ? '#ffffff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          + Log Daily Progress
        </button>
      </div>

      {/* Main Tab Box */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '4px'
      }}>
        {activeTab === 'workoutPlan' && (
          <WorkoutPlanForm />
        )}
        {activeTab === 'dashboard' && (
          <ProgressDashboard onNavigateToLog={() => setActiveTab('logProgress')} />
        )}
        {activeTab === 'logProgress' && (
          <ProgressForm onProgressLogged={() => setActiveTab('dashboard')} />
        )}
      </div>
    </div>
  );
};

export default Module2Dashboard;