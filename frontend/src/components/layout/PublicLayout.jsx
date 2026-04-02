import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { APP_BRAND, homePathByRole } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../common/LoadingState';
import AppIcon from '../common/AppIcon';

function publicLinkClass({ isActive }) {
  return isActive ? 'active' : '';
}

export default function PublicLayout() {
  const { authLoading, isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  if (authLoading) {
    return <LoadingState message="Loading portal..." />;
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={homePathByRole[user.role]} replace />;
  }

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-header-inner">
          <NavLink className="brand-lockup" to="/" aria-label={APP_BRAND}>
            <img className="brand-logo" src={logo} alt="UEDCL logo" />
          </NavLink>

          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <AppIcon name="menu" />
          </button>

          <div className={`public-nav-panel${menuOpen ? ' open' : ''}`}>
            <div className="public-nav-panel-head">
              <NavLink className="brand-lockup brand-lockup-panel" to="/" aria-label={APP_BRAND} onClick={() => setMenuOpen(false)}>
                <img className="brand-logo" src={logo} alt="UEDCL logo" />
              </NavLink>
              <button className="public-nav-close" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}>
                <AppIcon name="close" />
              </button>
            </div>
            <nav className="public-nav">
              <NavLink className={publicLinkClass} end to="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AppIcon name="home" /> Home
              </NavLink>
              <NavLink className={publicLinkClass} to="/about" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AppIcon name="info" /> About
              </NavLink>
              <NavLink className={publicLinkClass} to="/contact" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AppIcon name="phone" /> Contact
              </NavLink>
              <NavLink className={publicLinkClass} to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', padding: 0, borderRadius: '50%' }} aria-label="User Account Login" title="Login">
                <AppIcon name="profile" />
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      <button
        className={`offcanvas-backdrop${menuOpen ? ' open' : ''}`}
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
      />
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-title">UEDCL Service Portal</span>
          <span className="footer-copy">Electricity billing, receipts, and customer service.</span>
        </div>
      </footer>
    </div>
  );
}