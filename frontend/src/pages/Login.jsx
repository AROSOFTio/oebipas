import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, AtSign, Eye, EyeOff, LockKeyhole, Zap } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, getHomePath } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login', {
        identifier,
        email: identifier,
        password,
      });
      login(response.data.token, response.data.user);
      navigate(getHomePath(response.data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="electric-video" aria-hidden="true">
        <span className="electric-horizon" />
        <span className="electric-bolt electric-bolt-one" />
        <span className="electric-bolt electric-bolt-two" />
        <span className="electric-bolt electric-bolt-three" />
        <span className="electric-ring electric-ring-one" />
        <span className="electric-ring electric-ring-two" />
        <span className="spark-field spark-field-one" />
        <span className="spark-field spark-field-two" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="login-stage grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-cyan-200/15 bg-slate-950/55 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1fr]">
          <section className="hidden min-h-[620px] flex-col justify-between border-r border-cyan-200/10 bg-slate-950/35 p-10 lg:flex">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-white/10 shadow-[0_0_30px_rgba(34,211,238,0.24)]">
                <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
              </div>

              <div className="mt-20 max-w-sm">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  <Zap className="h-3.5 w-3.5" />
                  Live power billing
                </div>
                <h1 className="text-5xl font-black leading-[0.95] text-white">
                  Power stays moving.
                </h1>
                <p className="mt-6 text-base leading-7 text-cyan-50/72">
                  Secure billing access for customers, staff, and administrators across the electricity payment flow.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-cyan-50/70">
              <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.06] p-4">
                <span className="block text-lg text-cyan-200">24h</span>
                Session window
              </div>
              <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.06] p-4">
                <span className="block text-lg text-amber-200">UGX</span>
                Pesapal ready
              </div>
              <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.06] p-4">
                <span className="block text-lg text-emerald-200">UEDCL</span>
                Portal access
              </div>
            </div>
          </section>

          <section className="relative flex items-center justify-center p-5 sm:p-8 lg:p-12">
            <div className="w-full max-w-xl rounded-[1.5rem] border border-cyan-100/15 bg-[#081224]/82 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
              <div className="mb-8 flex items-center gap-4 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/20 bg-white/10">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">OEBIPAS</p>
                  <p className="text-sm text-cyan-50/60">Electricity billing portal</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Welcome back</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Login</h2>
                <p className="mt-2 text-sm font-medium text-slate-300">Sign in to your account.</p>
              </div>

              {error && (
                <div className="mt-7 rounded-2xl border border-rose-300/25 bg-rose-500/12 px-4 py-4 text-sm font-semibold text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.12)]">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
                    {error}
                  </div>
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-bold text-slate-200">Email or Username</label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-200/55" />
                    <input
                      className="h-14 w-full rounded-2xl border border-cyan-100/15 bg-white/[0.08] px-12 text-base font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:bg-white/[0.12] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)]"
                      value={identifier}
                      onChange={event => setIdentifier(event.target.value)}
                      required
                      autoComplete="username"
                      placeholder="benjamin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="ml-1 flex items-center justify-between gap-4">
                    <label className="text-sm font-bold text-slate-200">Password</label>
                    <Link to="/forgot-password" className="text-sm font-bold text-cyan-200 transition hover:text-amber-200">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-200/55" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="h-14 w-full rounded-2xl border border-cyan-100/15 bg-white/[0.08] px-12 pr-14 text-base font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:bg-white/[0.12] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)]"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
                      onClick={() => setShowPassword(current => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-cyan-300 px-5 text-sm font-black text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-y-0 left-[-30%] w-1/3 skew-x-[-22deg] bg-white/45 opacity-0 transition duration-500 group-hover:left-[120%] group-hover:opacity-100" />
                  <span className="relative flex items-center justify-center gap-2">
                    {submitting ? 'Please wait...' : 'Login'}
                    {!submitting && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
                  </span>
                </button>
              </form>

              <div className="mt-8 border-t border-cyan-100/10 pt-6 text-center">
                <p className="text-sm font-semibold text-slate-300">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-cyan-200 transition hover:text-amber-200">
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
