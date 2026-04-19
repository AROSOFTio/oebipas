import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans text-[var(--text-strong)]">
      {/* Header */}
      <header className="w-full mx-auto px-6 py-6 lg:px-12 flex items-center justify-between border-b border-slate-200/60 bg-white">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="UEDCL Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-[var(--text-strong)] hidden sm:block">OEBIPAS</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[#3543bb] transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-[#3543bb] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#283394] transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center animate-slide-up-fade">
          <span className="inline-block rounded-md bg-[#e8ebff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3543bb] mb-6">
            Academic Project
          </span>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            Online Electricity Billing and Payment System <br className="hidden lg:block" /> a Case of UEDCL
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            A comprehensive, minimalistic portal built to automate consumption tracking, billing distribution, and unified settlement routing via Pesapal.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link to="/login" className="w-full sm:w-auto rounded-xl bg-[#3543bb] px-8 py-3.5 text-base font-bold text-white shadow-md hover:bg-[#283394] hover:-translate-y-0.5 transition-all">
               Access Portal
             </Link>
             <Link to="/register" className="w-full sm:w-auto rounded-xl bg-white border border-slate-200 px-8 py-3.5 text-base font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
               Register Account
             </Link>
          </div>
        </div>

        {/* Minimalistic Tabs Area */}
        <div className="mt-20 w-full max-w-3xl mx-auto animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
          
          <div className="flex justify-center gap-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-4 px-2 text-sm sm:text-base font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'features' ? 'border-[#3543bb] text-[#3543bb]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              System Features
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`pb-4 px-2 text-sm sm:text-base font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'tech' ? 'border-[#3543bb] text-[#3543bb]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Tech Stack
            </button>
          </div>

          <div className="mt-8 bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-sm">
            {activeTab === 'features' && (
              <div className="grid gap-4 sm:grid-cols-2 animate-slide-up-fade">
                {[
                  'Secure Authentication & Roles',
                  'Staff Customer Onboarding',
                  'Dynamic Consumer Registration',
                  'Automated Monthly Billing logic',
                  'Embedded Pesapal Payments',
                  'Real-time Ledger Reconciliation',
                  'Live Email & SMS Notifications',
                  'Overdue Penalty Calculations'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8ebff] text-[#3543bb]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="grid gap-4 sm:grid-cols-2 animate-slide-up-fade">
                {[
                  { label: 'Frontend', value: 'React.js, Tailwind CSS, Vite' },
                  { label: 'Backend Controller', value: 'Node.js, Express.js' },
                  { label: 'Database', value: 'MySQL (Relational SQL)' },
                  { label: 'Authentication', value: 'JWT, bcrypt hashing' },
                  { label: 'Payment Gateway', value: 'Pesapal API v3' },
                  { label: 'Cloud Deployment', value: 'Docker Compose' }
                ].map((tech, i) => (
                  <div key={i} className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#3543bb]">{tech.label}</span>
                    <span className="mt-1 text-sm font-medium text-slate-700">{tech.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
