import React from 'react';

export default function Sidebar({ user, currentTab, setCurrentTab, collapsed, setCollapsed }) {
  if (!user) return null;

  const getMenuLinks = () => {
    switch (user.role) {
      case 'etudiant':
        return [
          { id: 'dashboard', name: 'Tableau de Bord', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
            </svg>
          )},
          { id: 'requests', name: 'Mes Demandes', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          )},
          { id: 'grades', name: 'Mes Notes', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          )},
          { id: 'settings', name: 'Paramètres', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          )}
        ];
      case 'agent':
        return [
          { id: 'dashboard', name: 'File des Demandes', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          )},
          { id: 'students', name: 'Dossiers Étudiants', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )},
          { id: 'settings', name: 'Paramètres', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          )}
        ];
      case 'prof':
        return [
          { id: 'grades', name: 'Saisie des Notes', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          )},
          { id: 'bulletins', name: 'Liste des Étudiants', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )},
          { id: 'settings', name: 'Paramètres', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          )}
        ];
      case 'admin':
        return [
          { id: 'dashboard', name: 'Vue d\'Ensemble', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          )},
          { id: 'students', name: 'Gestion Étudiants', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )},
          { id: 'users', name: 'Comptes Utilisateurs', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          )},
          { id: 'configurations', name: 'Dépts & Cohortes', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          )},
          { id: 'audits', name: 'Journaux d\'Audit', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )},
          { id: 'settings', name: 'Paramètres', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          )}
        ];
      default:
        return [];
    }
  };

  const menuLinks = getMenuLinks();

  const handleRoleName = (role) => {
    switch (role) {
      case 'etudiant': return 'Étudiant';
      case 'prof': return 'Professeur';
      case 'agent': return 'Scolarité / Secrétaire';
      case 'admin': return 'Administrateur';
      default: return '';
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={sidebarStyles}>
      {/* Institution Logo & Title */}
      <div style={{ ...logoContainerStyles, justifyContent: 'center' }}>
        {collapsed ? (
          <div style={logoIconStyles}>ISI</div>
        ) : (
          <svg width="150" height="52" viewBox="0 0 150 52" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <text x="50%" y="16" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="bold" fontSize="13" fill="#90b7dd" textAnchor="middle" letterSpacing="3">GROUPE</text>
            <text x="50%" y="48" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="900" fontSize="32" fill="#ffffff" textAnchor="middle" letterSpacing="1">ISI</text>
          </svg>
        )}
      </div>

      {/* Nav Links */}
      <nav style={navContainerStyles}>
        {menuLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setCurrentTab(link.id)}
            style={{
              ...navLinkStyles,
              backgroundColor: currentTab === link.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: currentTab === link.id ? '#60a5fa' : '#cbd5e1',
              fontWeight: currentTab === link.id ? '600' : '400',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '12px 0' : '12px 20px',
            }}
            title={collapsed ? link.name : ''}
          >
            <span style={{ color: currentTab === link.id ? '#3b82f6' : '#94a3b8' }}>
              {link.icon}
            </span>
            {!collapsed && <span style={{ marginLeft: '12px' }}>{link.name}</span>}
          </button>
        ))}
      </nav>

      {/* Collapsed Toggle Button */}
      <div style={footerStyles}>
        {!collapsed && (
          <div style={userInfoStyles}>
            <div style={userNameStyles}>{user.name}</div>
            <div style={userRoleStyles}>{handleRoleName(user.role)}</div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          style={collapseBtnStyles}
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
    </aside>
  );
}

// Inline Styles for structural controls to prevent CSS load race issues
const sidebarStyles = {
  width: 'var(--sidebar-width)',
  backgroundColor: '#0f172a',
  color: 'white',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 100,
  transition: 'var(--transition)',
  borderRight: '1px solid #1e293b',
};

// Collapsed helper styles (will override standard width if state is set)
const logoContainerStyles = {
  height: 'var(--header-height)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 20px',
  borderBottom: '1px solid #1e293b',
  gap: '12px',
  overflow: 'hidden',
};

const logoIconStyles = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: '#2563eb',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '0.9rem',
  flexShrink: 0,
};

const logoTextContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
};

const logoTitleStyles = {
  fontWeight: '700',
  fontSize: '1rem',
  letterSpacing: '0.05em',
  color: '#f8fafc',
};

const logoSubtitleStyles = {
  fontSize: '0.7rem',
  color: '#94a3b8',
};

const navContainerStyles = {
  flexGrow: 1,
  padding: '20px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const navLinkStyles = {
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'var(--transition)',
  width: '100%',
  textAlign: 'left',
  outline: 'none',
  fontSize: '0.9rem',
};

const footerStyles = {
  padding: '16px',
  borderTop: '1px solid #1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  overflow: 'hidden',
};

const userInfoStyles = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '150px',
};

const userNameStyles = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#f8fafc',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const userRoleStyles = {
  fontSize: '0.7rem',
  color: '#94a3b8',
};

const collapseBtnStyles = {
  background: 'none',
  border: 'none',
  color: '#cbd5e1',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#1e293b',
  flexShrink: 0,
};
