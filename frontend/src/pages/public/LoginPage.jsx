import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage';
import { useAuth } from '../../context/AuthContext';
import { demoCredentials, homePathByRole } from '../../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login(form);
      const redirectTo = location.state?.from?.pathname || homePathByRole[user.role];
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label}!`);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="page-header">
          <div>
            <h2 className="page-title">Secure Login</h2>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Login'}
            </button>
          </div>
        </form>

        {error && (
          <AlertMessage tone="error">{error}</AlertMessage>
        )}

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '1rem', margin: '0 0 16px 0', color: 'var(--color-text-muted)' }}>Demo Accounts</h4>
          
          {copyFeedback && (
            <AlertMessage tone="success" style={{ marginBottom: '16px' }}>{copyFeedback}</AlertMessage>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {demoCredentials.map((creds, index) => (
              <div key={index} style={{ 
                padding: '16px', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-hover)'
              }}>
                <div>
                  <div style={{ color: 'var(--color-text)', fontWeight: '600', marginBottom: '4px' }}>{creds.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{creds.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <button 
                    type="button" 
                    className="button-outline"
                    onClick={() => handleCopy(creds.email, 'Email')}
                    title={`Copy Email: ${creds.email}`}
                    style={{ padding: '0 12px', fontSize: '0.8rem', minHeight: '32px' }}
                  >
                    Copy Email
                  </button>
                  <button 
                    type="button"
                    className="button-outline"
                    onClick={() => handleCopy(creds.password, 'Password')}
                    title="Copy Password"
                    style={{ padding: '0 12px', fontSize: '0.8rem', minHeight: '32px' }}
                  >
                    Copy Pwd
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}