import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col font-sans relative overflow-hidden text-[var(--text-strong)]">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[130px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 p-2">
            <img src="/logo.png" alt="OEBIPAS" className="h-full w-full object-contain drop-shadow-sm" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-strong)]">OEBIPAS</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--panel-strong)] transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-full bg-[var(--panel-strong)] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pb-20 mt-10 lg:mt-0">
        <div className="animate-slide-up-fade max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--panel-soft)] bg-white/50 backdrop-blur-md px-4 py-2 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--panel-strong)]">Academic Case Study Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-[var(--panel-strong)] to-slate-900 pb-2">
            Intelligent Electricity<br/>Billing & Payments.
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-medium leading-relaxed">
            A state-of-the-art demonstrator for UEDCL featuring automated consumption tracking, secure Pesapal integrations, and real-time ledger settlement.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link to="/login" className="w-full sm:w-auto rounded-2xl bg-[var(--panel-strong)] px-8 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl hover:bg-[#283394] hover:-translate-y-1 transition-all">
               Access Portal Environment
             </Link>
             <Link to="/register" className="w-full sm:w-auto rounded-2xl bg-white/80 backdrop-blur border border-slate-200 px-8 py-4 text-base font-bold text-[var(--text-strong)] hover:border-[var(--panel-soft)] hover:bg-white transition-all shadow-sm hover:-translate-y-1">
               Register as Consumer
             </Link>
          </div>
        </div>

        {/* Feature Highlights beneath */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
          {[
            { title: 'Automated Tariffs', desc: 'Dynamic logic for domestic and commercial power indexing.' },
            { title: 'Live Settlements', desc: 'Instant ledger tracking across secure Pesapal API integrations.' },
            { title: 'Strict IAM', desc: 'Complete segmentation between staff, managers, and consumers.' }
          ].map(feature => (
             <div key={feature.title} className="glass-panel p-8 rounded-[2rem] text-left hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-6">
                   <div className="h-4 w-4 rounded-full bg-[var(--panel-strong)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-strong)]">{feature.title}</h3>
                <p className="mt-3 text-sm text-[var(--text-muted)] font-medium leading-relaxed">{feature.desc}</p>
             </div>
          ))}
        </div>
      </main>
    </div>
  );
}
