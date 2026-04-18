import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-[var(--panel-strong)] p-8 text-white shadow-xl lg:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-200">Final Year Project System</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight lg:text-5xl">
            Development of an Online Electricity Billing and Payment System: A Case Study of UEDCL
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200">
            A focused academic system demonstrating automated billing, secure payment processing, automatic penalties,
            notifications, usability, and strict role-based access for Branch Manager, Billing Staff, and Customer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--panel-strong)]">
              Open portal
            </Link>
            <Link to="/register" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white">
              Customer registration
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Included modules</h2>
          <div className="mt-6 grid gap-4">
            {[
              'Authentication and password reset',
              'Customer management',
              'Consumption entry',
              'Automated bill generation',
              'Payment processing and callback handling',
              'Automatic penalty calculation',
              'Email notifications',
              'Dashboard and basic reports',
            ].map(item => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
