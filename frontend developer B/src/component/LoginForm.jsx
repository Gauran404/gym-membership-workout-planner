import React, { useState } from 'react';
import axios from 'axios';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [showRenewOption, setShowRenewOption] = useState(false);
  const [expiredEmail, setExpiredEmail] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showGeneratePassword, setShowGeneratePassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setErrorMessage('');
    setSuccessMessage('');
    setShowRenewOption(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setShowRenewOption(false);

    const emailTrimmed = formData.email.trim();
    const passwordTrimmed = formData.password.trim();

    // TC_LOG_003: Login with empty email and password
    if (!emailTrimmed && !passwordTrimmed) {
      setErrorMessage('Email and password are required');
      return;
    }
    if (!emailTrimmed || !passwordTrimmed) {
      setErrorMessage('Email and password are required');
      return;
    }

    // TC_LOG_004: Login with invalid email format
    if (!emailRegex.test(emailTrimmed)) {
      setErrorMessage('Enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: emailTrimmed,
        password: passwordTrimmed
      });

      const token = response.data.token;
      const role = response.data.role || response.data.user?.role || 'Member';
      const user = response.data.user || { role, email: emailTrimmed, name: role };

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', user.name || role);
      localStorage.setItem('userEmail', user.email || emailTrimmed);

      setFailedAttempts(0);
      setShowGeneratePassword(false);

      // TC_LOG_001: Success redirect
      if (onLoginSuccess) {
        onLoginSuccess(token, role, user);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Login error:', err);
      const resData = err.response?.data;
      const status = err.response?.status;

      // TC_LOG_005: Expired membership
      if (status === 403 && resData?.expired) {
        setErrorMessage(resData.message || 'Your membership has expired. Please renew');
        setShowRenewOption(true);
        setExpiredEmail(resData.email || emailTrimmed);
        return;
      }

      // Check failed attempts for Bug 4 feature
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      const serverAttempts = resData?.failedAttempts;
      const allowReset = resData?.allowReset || newAttempts >= 3 || serverAttempts >= 3;

      if (allowReset) {
        setShowGeneratePassword(true);
      }

      // TC_LOG_002: Invalid email or password
      setErrorMessage(
        resData?.message || 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // TC_LOG_005: Renew Option Handler
  const handleRenewMembership = async () => {
    setIsRenewing(true);
    setErrorMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/renew-membership', {
        email: expiredEmail || formData.email
      });
      setShowRenewOption(false);
      setSuccessMessage(res.data.message || 'Membership renewed successfully! Please click Login.');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to renew membership. Please try again.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleGeneratePassword = async () => {
    if (!formData.email) {
      setErrorMessage('Please enter your email or username first to generate a new password.');
      return;
    }

    setIsResetting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: formData.email
      });

      const newPass = res.data.newPassword;
      setFormData((prev) => ({ ...prev, password: newPass }));
      setFailedAttempts(0);
      setShowGeneratePassword(false);
      setSuccessMessage(
        `New password generated: "${newPass}". Auto-filled into password field. You can now click "Log In".`
      );
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to generate new password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '50px auto',
      padding: '24px',
      background: '#ffffff',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 16px 0', color: '#333' }}>
        Gym Membership and Workout Planner
      </h2>
      <h4 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#666', fontWeight: 'normal' }}>
        Login Portal
      </h4>

      {errorMessage && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          border: '1px solid #ef9a9a',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '14px',
          fontSize: '13px'
        }}>
          <div>{errorMessage}</div>
          {/* TC_LOG_005: Renew Option */}
          {showRenewOption && (
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleRenewMembership}
                disabled={isRenewing}
                style={{
                  padding: '6px 12px',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: isRenewing ? 'not-allowed' : 'pointer'
                }}
              >
                {isRenewing ? 'Renewing...' : 'Renew Membership'}
              </button>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #a5d6a7',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '14px',
          fontSize: '13px'
        }}>
          {successMessage}
        </div>
      )}

      {/* 3 Failed Attempts Notice & Password Generator */}
      {showGeneratePassword && (
        <div style={{
          background: '#fff8e1',
          border: '1px solid #ffe082',
          color: '#f57f17',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            ⚠️ 3 failed login attempts detected!
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#555' }}>
            You can generate a new password for this account.
          </p>
          <button
            type="button"
            onClick={handleGeneratePassword}
            disabled={isResetting}
            style={{
              padding: '6px 12px',
              background: '#ff9800',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: isResetting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            {isResetting ? 'Generating...' : '🔑 Generate New Password'}
          </button>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>
            Email:
          </label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="member@gymfit.com"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Gym@1234"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px',
            background: isLoading ? '#90caf9' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '4px'
          }}
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>

      {/* Test Cases Quick Fill */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '12px', color: '#666' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Blackbox Test Scenarios:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleQuickFill('member@gymfit.com', 'Gym@1234')}
            style={{
              padding: '6px 10px',
              border: '1px solid #ccc',
              background: '#f9f9f9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left'
            }}
          >
            <strong>TC_LOG_001 (Valid):</strong> member@gymfit.com / Gym@1234
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('member@gymfit.com', 'Wrong@123')}
            style={{
              padding: '6px 10px',
              border: '1px solid #ccc',
              background: '#f9f9f9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left'
            }}
          >
            <strong>TC_LOG_002 (Wrong Password):</strong> member@gymfit.com / Wrong@123
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('expired@gymfit.com', 'Gym@1234')}
            style={{
              padding: '6px 10px',
              border: '1px solid #ccc',
              background: '#f9f9f9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left'
            }}
          >
            <strong>TC_LOG_005 (Expired):</strong> expired@gymfit.com / Gym@1234
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;