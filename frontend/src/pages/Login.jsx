import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, getHomePath } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate(getHomePath(response.data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">


      <div className="flex w-full max-w-5xl premium-shadow rounded-[3rem] overflow-hidden animate-slide-up-fade bg-white/70 backdrop-blur-2xl border border-white/50">
        
        {/* Left Side: Brand & Visual */}
        <div className="hidden lg:flex lg:w-5/12 bg-[var(--panel-strong)] flex-col justify-between p-12 text-white relative">
          <div className="z-10 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-8">
              <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              Powering<br/>Intelligent<br/>Billing.
            </h1>
            <p className="mt-6 text-blue-100 max-w-sm leading-relaxed">
              Securely access your electricity metrics, track payments, and manage your billing cycles entirely online.
            </p>
          </div>
          
          <div className="z-10 text-sm text-blue-200/80 font-medium">
            &copy; 2026 UEDCL Management
          </div>

          {/* Abstract background graphics on the blue side */}
          <div className="absolute right-0 bottom-0 top-0 left-0 overflow-hidden rounded-[3rem] pointer-events-none mix-blend-overlay opacity-30">
            <svg viewBox="0 0 800 800" className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] animate-float-slow">
              <path fill="#ffffff" d="M372.5,419.5Q282,589,178.5,456.5Q75,324,204,180Q333,36,462,143Q591,250,372.5,419.5Z" />
            </svg>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-14 md:p-20 relative">
          <div className="animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
            <div className="lg:hidden flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] mb-8">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>

            <h2 className="text-3xl font-bold text-[var(--text-strong)] tracking-tight">Welcome Return</h2>
            <p className="mt-2 text-[var(--text-muted)] font-medium">Authenticate to access the portal engine.</p>

            {error && (
              <div className="mt-8 animate-slide-up-fade rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-sm font-medium text-rose-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              </div>
            )}

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5 group">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email or Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--panel-strong)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </div>
                  <input
                    className="w-full rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] px-11 py-3.5 text-base text-[var(--text-strong)] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:shadow-[0_0_0_2px_var(--panel-strong)]"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-bold text-[var(--panel-strong)] hover:text-[var(--panel-strong-dark)] transition-colors">
                    Recovery
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--panel-strong)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type="password"
                    className="w-full rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] px-11 py-3.5 text-base text-[var(--text-strong)] placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:shadow-[0_0_0_2px_var(--panel-strong)]"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full overflow-hidden rounded-2xl bg-[var(--panel-strong)] px-4 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--panel-strong-dark)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center justify-center gap-2">
                  {submitting ? (
                    'Processing Key...' 
                  ) : (
                    <>
                      Enter Dashboard
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-[var(--text-muted)]">
                Unregistered consumer?{' '}
                <Link to="/register" className="font-bold text-[var(--panel-strong)] hover:text-[var(--panel-strong-dark)] transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
