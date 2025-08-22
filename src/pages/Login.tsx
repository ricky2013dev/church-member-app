import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Supporter } from '../types';

interface LoginProps {
  onLogin: (supporter: {
    id: number;
    name: string;
    group_code: string;
    gender: 'male' | 'female';
    phone_number?: string;
    email?: string;
    profile_picture_url?: string;
  }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [selectedSupporterId, setSelectedSupporterId] = useState<number | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [groupPinCode, setGroupPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSupporters, setLoadingSupporters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        setLoadingSupporters(true);
        // Fetch only active supporters for login
        const data = await apiService.getSupporters(undefined, 'on');
        const sortedData = data.sort((a, b) => a.display_sort - b.display_sort);
        setSupporters(sortedData);
      } catch (err) {
        console.error('Error fetching supporters:', err);
        setError('Failed to load supporters. Please check if the server is running.');
      } finally {
        setLoadingSupporters(false);
      }
    };

    fetchSupporters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupporterId) {
      setError('Please select a supporter');
      return;
    }

    if (!pinCode || !groupPinCode) {
      setError('Both pin codes are required');
      return;
    }

    if (pinCode.length !== 4 || groupPinCode.length !== 4) {
      setError('Pin codes must be exactly 4 digits');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.login(selectedSupporterId, pinCode, groupPinCode);

      if (response.success) {
        onLogin(response.supporter);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please check your pin codes.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinCodeChange = (value: string, setter: (value: string) => void) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setter(numericValue);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Church Member App
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            Sign in with your pin codes
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              Select Supporter
            </label>
            {loadingSupporters ? (
              <div
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                }}
              >
                Loading supporters...
              </div>
            ) : (
              <select
                value={selectedSupporterId || ''}
                onChange={e => setSelectedSupporterId(Number(e.target.value) || null)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                }}
                required
              >
                <option value="">Select your account...</option>
                {supporters.map(supporter => (
                  <option key={supporter.id} value={supporter.id}>
                    {supporter.name} 
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              Personal Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pinCode}
              onChange={e => handlePinCodeChange(e.target.value, setPinCode)}
              placeholder="4-digit pin code"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1.125rem',
                textAlign: 'center',
                letterSpacing: '0.25em',
              }}
              maxLength={4}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              Team Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={groupPinCode}
              onChange={e => handlePinCodeChange(e.target.value, setGroupPinCode)}
              placeholder="4-digit group pin code"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1.125rem',
                textAlign: 'center',
                letterSpacing: '0.25em',
              }}
              maxLength={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={
              loading || !selectedSupporterId || pinCode.length !== 4 || groupPinCode.length !== 4
            }
            style={{
              width: '100%',
              backgroundColor:
                loading || !selectedSupporterId || pinCode.length !== 4 || groupPinCode.length !== 4
                  ? '#9ca3af'
                  : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor:
                loading || !selectedSupporterId || pinCode.length !== 4 || groupPinCode.length !== 4
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>
            <strong>Instructions:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            <li>Select your supporter account from the list</li>
            <li>Enter your personal 4-digit pin code</li>
            <li>Enter your group's 4-digit pin code</li>
            <li>All fields are required to access the app</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
