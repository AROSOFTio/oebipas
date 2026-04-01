import AppIcon from './AppIcon';

export default function StatCard({ label, value, helper, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="stat-label">{label}</p>
        {icon && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)'
          }}>
            <AppIcon name={icon} />
          </div>
        )}
      </div>
      <p className="stat-value">{value}</p>
      {helper ? <p className="stat-helper">{helper}</p> : null}
    </article>
  );
}