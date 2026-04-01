import { useAuth } from '../../context/AuthContext';
import AppIcon from '../common/AppIcon';

const workspaceTitles = {
  customer: 'Customer',
  billing_officer: 'Billing',
  helpdesk_officer: 'Helpdesk',
  administrator: 'Administration',
};

export default function Topbar({ onMenuToggle }) {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-start">
          <button className="topbar-menu" type="button" aria-label="Open workspace menu" onClick={onMenuToggle}>
            <AppIcon name="menu" />
          </button>
          <strong className="topbar-title">{workspaceTitles[user?.role] || 'Workspace'}</strong>
        </div>
        <div className="topbar-user-meta">
          <div className="topbar-user-info">
            <strong style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>{user?.email}</strong>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{user?.roleLabel}</span>
          </div>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(74, 58, 255, 0.2)'
          }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
}