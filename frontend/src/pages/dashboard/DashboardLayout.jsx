export default function DashboardLayout({ variant, children }) {
  const spacing = {
    admin: 'space-y-5',
    billing: 'space-y-6',
    customer: 'space-y-8',
  };

  return (
    <div className={`dashboard-${variant} ${spacing[variant] || spacing.billing}`}>
      {children}
    </div>
  );
}

export function DashboardPanel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`role-dashboard-panel rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft ${className}`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children }) {
  return (
    <p className="py-4 text-center text-sm text-[var(--text-muted)]">
      {children}
    </p>
  );
}
