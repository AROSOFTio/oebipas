import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
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

  return (
    <>
      <div className="dashboard-shell">
        <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <section className="dashboard-main">
          <Topbar onMenuToggle={() => setMenuOpen((current) => !current)} />
          <div className="dashboard-content">
            <Outlet />
          </div>
        </section>
      </div>
      <button
        className={`offcanvas-backdrop${menuOpen ? ' open' : ''}`}
        type="button"
        aria-label="Close workspace menu"
        onClick={() => setMenuOpen(false)}
      />
    </>
  );
}