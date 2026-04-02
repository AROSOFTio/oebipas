import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
    <section className="auth-page" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem 2rem',
      background: 'var(--color-background)',
      minHeight: 'calc(100vh - 84px)',
      margin: '20px 0'
    }}>
      <div className="auth-panel" style={{ 
        maxWidth: '480px', 
        width: '100%', 
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)'
      }}>
        <div className="page-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 className="page-title" style={{ fontWeight: '800', letterSpacing: '-0.02em', fontSize: '2.5rem', margin: 0, color: 'var(--color-text)' }}>Secure Login</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Welcome back. Please enter your details.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="field">
            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-actions" style={{ marginTop: '0.5rem' }}>
            <button 
              className="button" 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: '600', transition: 'transform 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '1.5rem' }}>
            <AlertMessage tone="error">{error}</AlertMessage>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Signup or register</Link>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: '600' }}>Demo Quick Access</h4>
          
          <div style={{ minHeight: '24px', marginBottom: '0.75rem' }}>
            {copyFeedback && <div style={{ color: 'var(--color-success)', textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', background: 'var(--color-success-soft)', padding: '0.25rem', borderRadius: '6px' }}>{copyFeedback}</div>}
          </div>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {demoCredentials.map((creds, index) => (
              <div key={index} style={{ 
                background: 'var(--color-surface)', 
                padding: '1rem', 
                borderRadius: '12px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--color-border-strong)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ color: 'var(--color-text)', fontWeight: '600', fontSize: '0.9rem' }}>{creds.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{creds.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="button-outline"
                    onClick={() => handleCopy(creds.email, 'Email')}
                    title={`Copy Email: ${creds.email}`}
                    style={{ padding: '0.4rem 0.6rem', minHeight: 'auto', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}
                  >
                    Copy Email
                  </button>
                  <button 
                    type="button" 
                    className="button-outline"
                    onClick={() => handleCopy(creds.password, 'Password')}
                    title="Copy Password"
                    style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)', borderColor: 'transparent', padding: '0.4rem 0.6rem', minHeight: 'auto', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--color-primary-soft)'; }}
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