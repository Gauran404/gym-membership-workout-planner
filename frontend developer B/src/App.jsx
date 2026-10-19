import React, { useState } from 'react';
import LoginForm from './component/LoginForm';
import Module2Dashboard from './component/Module2Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  const handleLoginSuccess = (newToken, newRole, user) => {
    setToken(newToken);
    setUserRole(newRole);
    setUserName(user?.name || newRole);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUserRole('');
    setUserName('');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
      {!token ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          {/* Simple Clean Header */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            background: '#2c3e50',
            color: '#fff'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Gym Fitness Management System
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px' }}>
                User: <strong>{userName || userRole}</strong> ({userRole})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 14px',
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Logout
              </button>
            </div>
          </header>

          {/* Main Container */}
          <main style={{ maxWidth: '960px', margin: '20px auto', padding: '0 15px' }}>
            <Module2Dashboard key={token} initialRole={userRole} />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;