import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { homePathByRole, navigationByRole } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import AppIcon from '../common/AppIcon';

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});
  const items = navigationByRole[user?.role] || [];
  
  const exactItemMatch = items.find((item) => item.path === location.pathname || (item.children && item.children.some(child => location.pathname === child.path.split('?')[0])));

  async function handleLogout() {
    await logout();
    onClose();
    navigate('/login', { replace: true });
  }

  function isItemActive(path) {
    const basePath = path.split('?')[0];
    if (exactItemMatch) {
      if (exactItemMatch.path) return exactItemMatch.path === basePath;
      if (exactItemMatch.children) return exactItemMatch.children.some(c => c.path.split('?')[0] === basePath);
    }
    return location.pathname === basePath || location.pathname.startsWith(`${basePath}/`);
  }

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-head">
        <NavLink className="sidebar-brand-panel" to={homePathByRole[user?.role] || '/'} aria-label="Workspace home" onClick={onClose}>
          <div className="sidebar-brand-mark">
            <img className="sidebar-logo" src={logo} alt="UEDCL logo" />
          </div>
        </NavLink>
        <button className="sidebar-close" type="button" aria-label="Close workspace menu" onClick={onClose}>
          <AppIcon name="close" />
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          if (item.children) {
            const isMenuOpen = openMenus[item.label] || isItemActive(item.children[0].path);
            return (
              <div key={item.label} className="sidebar-group">
                <button 
                  className={`sidebar-nav-link${isItemActive(item.children[0].path) ? ' group-active' : ''}`}
                  onClick={() => toggleMenu(item.label)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span className="nav-icon-wrap"><AppIcon name={item.icon} /></span>
                    <span className="nav-link-copy">{item.label}</span>
                  </div>
                  <AppIcon name={isMenuOpen ? 'expand_less' : 'expand_more'} />
                </button>
                {isMenuOpen && (
                  <div className="sidebar-sub-nav" style={{ paddingLeft: '38px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    {item.children.map(child => {
                      const isActive = location.pathname + location.search === child.path;
                      return (
                        <NavLink
                          key={child.path}
                          className={`sidebar-nav-link sub-link${isActive ? ' active' : ''}`}
                          to={child.path}
                          onClick={onClose}
                          style={{ minHeight: '36px', fontSize: '0.85rem' }}
                        >
                          {child.label}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              className={`sidebar-nav-link${isItemActive(item.path) ? ' active' : ''}`}
              to={item.path}
              onClick={onClose}
            >
              <span className="nav-icon-wrap">
                <AppIcon name={item.icon} />
              </span>
              <span className="nav-link-copy">{item.label}</span>
            </NavLink>
          );
        })}
        <button className="sidebar-nav-link sidebar-logout" type="button" onClick={handleLogout} style={{ marginTop: 'auto' }}>
          <span className="nav-icon-wrap">
            <AppIcon name="logout" />
          </span>
          <span className="nav-link-copy">Logout</span>
        </button>
      </nav>
    </aside>
  );
}