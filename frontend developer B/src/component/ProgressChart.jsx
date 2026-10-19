import React from 'react';

const ProgressChart = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p style={{ color: '#777', fontStyle: 'italic' }}>No progress data to visualize yet.</p>;
  }

  // Sort logs chronologically (oldest to newest)
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const maxWeight = Math.max(...sortedLogs.map((l) => l.weight), 100);

  return (
    <div style={{
      background: '#f9f9f9',
      border: '1px solid #ddd',
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Weight Progress Visualizer</h4>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '140px',
        gap: '12px',
        paddingTop: '15px',
        borderBottom: '1px solid #ccc'
      }}>
        {sortedLogs.map((log, index) => {
          const barHeight = Math.max(15, (log.weight / maxWeight) * 110);
          return (
            <div key={log._id || index} style={{ textAlign: 'center', flex: 1, minWidth: '35px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                {log.weight}kg
              </span>
              <div
                style={{
                  height: `${barHeight}px`,
                  background: '#0288d1',
                  borderRadius: '3px 3px 0 0',
                  margin: '0 auto',
                  width: '60%'
                }}
              />
              <span style={{ fontSize: '10px', color: '#666', display: 'block', marginTop: '4px' }}>
                {new Date(log.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressChart;