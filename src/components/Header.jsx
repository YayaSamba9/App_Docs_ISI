import React, { useState, useEffect, useRef } from 'react';
import { getRequests } from '../db/storage';

export default function Header({ user, currentTab, onLogout, notifications, setNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for mock notifications from requests
  useEffect(() => {
    if (!user) return;
    
    // Fetch requests and extract recent actions as notifications
    const reqs = getRequests();
    let unread = [];
    
    if (user.role === 'etudiant') {
      // Find history events on student's requests from staff
      const studentReqs = reqs.filter(r => r.studentId === user.studentInfo?.id);
      studentReqs.forEach(r => {
        const lastAction = r.history[r.history.length - 1];
        if (lastAction && lastAction.role !== 'etudiant') {
          unread.push({
            id: `${r.id}-${lastAction.status}`,
            title: `Statut mis à jour`,
            message: `Votre demande de "${translateDocType(r.documentType)}" est passée à: ${translateStatus(lastAction.status)}.`,
            time: formatTime(lastAction.timestamp),
            isUnread: true
          });
        }
      });
    } else if (user.role === 'agent') {
      // Show newly submitted requests for staff
      const submitted = reqs.filter(r => r.status === 'submitted');
      submitted.forEach(r => {
        unread.push({
          id: r.id,
          title: 'Nouvelle demande',
          message: `${r.studentName} a demandé un "${translateDocType(r.documentType)}".`,
          time: formatTime(r.createdAt),
          isUnread: true
        });
      });
    } else {
      // Admin: show last few audit logs as notifications
      const mockNotifs = [
        { id: '1', title: 'Système en ligne', message: 'Toutes les passerelles d\'authentification ISI sont actives.', time: '1h', isUnread: false },
        { id: '2', title: 'Base de données', message: 'Mise à jour automatique des cohortes exécutée avec succès.', time: '2h', isUnread: false }
      ];
      unread = mockNotifs;
    }
    
    setNotifications(unread.slice(0, 5));
  }, [user, setNotifications]);

  const translateDocType = (type) => {
    switch(type) {
      case 'enrollment_certificate': return 'Attestation d\'inscription';
      case 'transcript': return 'Relevé de notes';
      case 'internship_certificate': return 'Attestation de stage';
      case 'report_card': return 'Bulletin des notes';
      default: return type;
    }
  };

  const translateStatus = (status) => {
    switch(status) {
      case 'submitted': return 'Soumise';
      case 'in_progress': return 'En cours';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'delivered': return 'Délivrée';
      default: return status;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Récemment';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return user?.role === 'etudiant' ? 'Espace Étudiant' : user?.role === 'agent' ? 'Gestion des Demandes' : 'Tableau de Bord Administrateur';
      case 'requests': return 'Mes Demandes de Documents';
      case 'grades': return user?.role === 'etudiant' ? 'Mes Notes & Moyennes' : 'Saisie des Notes Académiques';
      case 'students': return 'Gestion des Fiches Étudiants';
      case 'configurations': return 'Départements & Cohortes';
      case 'audits': return 'Journaux de Sécurité (Audit Trail)';
      default: return 'Groupe ISI - Docs';
    }
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header style={headerStyles}>
      {/* Title */}
      <h1 style={titleStyles}>{getPageTitle()}</h1>

      {/* Right Controls */}
      <div style={controlsContainerStyles}>
        {/* Notifications Icon Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} style={iconBtnStyles} title="Notifications">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '22px', height: '22px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            {unreadCount > 0 && <span style={badgeCountStyles}>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div style={dropdownNotifStyles}>
              <div style={dropdownNotifHeaderStyles}>
                <span style={{ fontWeight: '600' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={textLinkBtnStyles}>Tout marquer lu</button>
                )}
              </div>
              <div style={dropdownBodyStyles}>
                {notifications.length === 0 ? (
                  <div style={emptyNotifStyles}>Aucune notification récente</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ ...notifItemStyles, backgroundColor: n.isUnread ? '#eff6ff' : 'transparent' }}>
                      <div style={notifItemTitleRowStyles}>
                        <span style={notifItemTitleStyles}>{n.title}</span>
                        <span style={notifItemTimeStyles}>{n.time}</span>
                      </div>
                      <p style={notifItemMsgStyles}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={profileTriggerStyles}>
            <div style={avatarStyles}>
              {getUserInitials(user?.name)}
            </div>
            <div style={profileTextStyles}>
              <span style={profileNameStyles}>{user?.name}</span>
              <span style={profileRoleStyles}>{user?.email}</span>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px', marginLeft: '4px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {showProfileMenu && (
            <div style={dropdownProfileStyles}>
              <div style={dropdownProfileHeaderStyles}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              <div style={{ padding: '4px' }}>
                <button onClick={onLogout} style={logoutBtnStyles}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Header specific styles
const headerStyles = {
  height: 'var(--header-height)',
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  position: 'sticky',
  top: 0,
  zIndex: 90,
  boxShadow: 'var(--shadow-sm)',
};

const titleStyles = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--primary-dark)',
};

const controlsContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconBtnStyles = {
  background: 'none',
  border: '1px solid #e2e8f0',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  transition: 'var(--transition)',
  outline: 'none',
};

const badgeCountStyles = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  backgroundColor: 'var(--status-rejected)',
  color: 'white',
  fontSize: '0.65rem',
  fontWeight: '700',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid white',
};

const profileTriggerStyles = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '4px 8px',
  borderRadius: '8px',
  transition: 'var(--transition)',
  outline: 'none',
};

const avatarStyles = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: '#eff6ff',
  color: 'var(--accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '0.85rem',
  border: '1.5px solid #dbeafe',
};

const profileTextStyles = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
};

const profileNameStyles = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const profileRoleStyles = {
  fontSize: '0.7rem',
  color: 'var(--text-secondary)',
};

// Dropdowns
const dropdownNotifStyles = {
  position: 'absolute',
  top: '50px',
  right: 0,
  width: '320px',
  backgroundColor: 'white',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-lg)',
  border: '1px solid #e2e8f0',
  zIndex: 150,
  overflow: 'hidden',
};

const dropdownNotifHeaderStyles = {
  padding: '12px 16px',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.85rem',
};

const textLinkBtnStyles = {
  background: 'none',
  border: 'none',
  color: 'var(--accent)',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: '600',
};

const dropdownBodyStyles = {
  maxHeight: '280px',
  overflowY: 'auto',
};

const emptyNotifStyles = {
  padding: '24px',
  textAlign: 'center',
  color: 'var(--text-light)',
  fontSize: '0.85rem',
};

const notifItemStyles = {
  padding: '12px 16px',
  borderBottom: '1px solid #f8fafc',
  transition: 'var(--transition)',
};

const notifItemTitleRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '2px',
};

const notifItemTitleStyles = {
  fontWeight: '600',
  fontSize: '0.8rem',
  color: 'var(--text-primary)',
};

const notifItemTimeStyles = {
  fontSize: '0.7rem',
  color: 'var(--text-light)',
};

const notifItemMsgStyles = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.3',
};

const dropdownProfileStyles = {
  position: 'absolute',
  top: '50px',
  right: 0,
  width: '200px',
  backgroundColor: 'white',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-lg)',
  border: '1px solid #e2e8f0',
  zIndex: 150,
  overflow: 'hidden',
};

const dropdownProfileHeaderStyles = {
  padding: '12px 16px',
  borderBottom: '1px solid #f1f5f9',
};

const logoutBtnStyles = {
  width: '100%',
  padding: '10px 16px',
  border: 'none',
  background: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  textAlign: 'left',
  borderRadius: '6px',
  transition: 'var(--transition)',
  fontWeight: '500',
};
