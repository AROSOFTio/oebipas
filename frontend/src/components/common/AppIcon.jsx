function iconPaths(name) {
  switch (name) {
    case 'menu':
      return (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      );
    case 'close':
      return (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      );
    case 'dashboard':
      return (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.6" />
          <rect x="14" y="3" width="7" height="5" rx="1.6" />
          <rect x="14" y="10.5" width="7" height="10.5" rx="1.6" />
          <rect x="3" y="12.5" width="7" height="8.5" rx="1.6" />
        </>
      );
    case 'users':
    case 'customers':
      return (
        <>
          <path d="M16.5 19a4.5 4.5 0 0 0-9 0" />
          <circle cx="12" cy="8" r="3.5" />
          <path d="M19.5 18.5a3.5 3.5 0 0 0-2.7-3.4" />
          <path d="M16.6 4.9a3 3 0 0 1 0 6" />
        </>
      );
    case 'user-plus':
    case 'add-customer':
    case 'add-user':
      return (
        <>
          <path d="M15.5 19a4.5 4.5 0 0 0-9 0" />
          <circle cx="11" cy="8" r="3.5" />
          <path d="M19 8v6" />
          <path d="M16 11h6" />
        </>
      );
    case 'profile':
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </>
      );
    case 'meter':
    case 'add-meter':
      return (
        <>
          <rect x="5" y="3.5" width="14" height="17" rx="2.2" />
          <path d="M8.5 8h7" />
          <path d="M8.5 11.5h7" />
          <circle cx="12" cy="16" r="1.8" />
        </>
      );
    case 'readings':
      return (
        <>
          <path d="M5 19.5h14" />
          <path d="M7.5 19.5v-4.8a4.5 4.5 0 1 1 9 0v4.8" />
          <path d="M12 12l2-2" />
        </>
      );
    case 'generate':
      return (
        <>
          <path d="M7 3.5h7l4 4v13H7z" />
          <path d="M14 3.5v4h4" />
          <path d="M12 11v6" />
          <path d="M9 14h6" />
        </>
      );
    case 'bills':
      return (
        <>
          <path d="M7 3.5h7l4 4v13H7z" />
          <path d="M14 3.5v4h4" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h5" />
        </>
      );
    case 'payments':
      return (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="2.2" />
          <path d="M3.5 10h17" />
          <path d="M8 14h3.5" />
        </>
      );
    case 'receipts':
      return (
        <>
          <path d="M7 3.5h10v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4z" />
          <path d="M9.5 8h5" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h3.5" />
        </>
      );
    case 'notifications':
    case 'sms':
      return (
        <>
          <path d="M6 8.5a6 6 0 1 1 12 0c0 6 2.5 7 2.5 7h-17S6 14.5 6 8.5" />
          <path d="M10 19.5a2 2 0 0 0 4 0" />
        </>
      );
    case 'complaints':
      return (
        <>
          <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17 15H10l-4.5 4v-4H7A2.5 2.5 0 0 1 4.5 12.5z" />
          <path d="M9.5 8h5" />
          <path d="M9.5 11h4" />
        </>
      );
    case 'resolved':
      return (
        <>
          <path d="M12 3.5l7 3v5.8c0 4.2-2.6 8-7 9.7-4.4-1.7-7-5.5-7-9.7V6.5z" />
          <path d="M9 12l2 2 4-4" />
        </>
      );
    case 'tariffs':
      return (
        <>
          <path d="M5 6h14" />
          <path d="M5 12h14" />
          <path d="M5 18h14" />
          <circle cx="9" cy="6" r="1.7" />
          <circle cx="15" cy="12" r="1.7" />
          <circle cx="11" cy="18" r="1.7" />
        </>
      );
    case 'reports':
      return (
        <>
          <path d="M4.5 19.5h15" />
          <path d="M7.5 16v-5" />
          <path d="M12 16V7" />
          <path d="M16.5 16v-8" />
        </>
      );
    case 'settings':
      return (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 1 1-3.6 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 1 1 0-3.6h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1.8 1.8 0 1 1 0 3.6h-.2a1 1 0 0 0-.9.6" />
        </>
      );
    case 'logout':
      return (
        <>
          <path d="M10 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
          <path d="M14 16l4-4-4-4" />
          <path d="M18 12H9" />
        </>
      );
    case 'support':
      return (
        <>
          <path d="M4.5 11.5a7.5 7.5 0 0 1 15 0v5.5h-4v-3h-7v3h-4z" />
          <path d="M8.5 17h7" />
        </>
      );
    case 'expand_more':
      return <path d="M6 9l6 6 6-6" />;
    case 'expand_less':
      return <path d="M18 15l-6-6-6 6" />;
    case 'filter_list':
      return <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
    case 'download':
      return (
        <>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </>
      );
    case 'home':
      return (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      );
    case 'info':
    case 'about':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </>
      );
    case 'contact':
    case 'phone':
      return (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      );
    case 'login':
      return (
        <>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </>
      );
    default:
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2 2" />
        </>
      );
  }
}

export default function AppIcon({ name, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`app-icon ${className}`.trim()}
      aria-hidden="true"
    >
      {iconPaths(name)}
    </svg>
  );
}