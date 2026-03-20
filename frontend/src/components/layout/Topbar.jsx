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
          <strong>{user?.email}</strong>
          <span>{user?.roleLabel}</span>
        </div>
      </div>
    </div>
  );
}