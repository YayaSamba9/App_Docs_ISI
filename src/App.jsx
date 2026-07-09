import React, { useState, useEffect } from 'react';
import { initDb, logAuditAction, getUserById } from './db/storage';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initialize DB on mount
  useEffect(() => {
    initDb();
    
    // Check if session exists in sessionStorage
    const activeSession = sessionStorage.getItem('isidocs_session');
    if (activeSession) {
      try {
        const sessionObj = JSON.parse(activeSession);
        // check expiration
        if (sessionObj.expiresAt < Date.now()) {
          sessionStorage.removeItem('isidocs_session');
          setUser(null);
          addToast("Session expirée. Veuillez vous reconnecter.", "info");
        } else {
          // get user details from localStorage
          const userFromDb = getUserById(sessionObj.userId);
          if (userFromDb && userFromDb.actif) {
            setUser(userFromDb);
          } else {
            sessionStorage.removeItem('isidocs_session');
            setUser(null);
          }
        }
      } catch (e) {
        sessionStorage.removeItem('isidocs_session');
        setUser(null);
      }
    }
  }, []);

  // Set first tab on role switch
  useEffect(() => {
    setCurrentTab('dashboard');
  }, [user?.role]);

  // Alert Toaster Manager
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Clear toast after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    
    const sessionToken = crypto.randomUUID ? crypto.randomUUID() : `tok-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const sessionObj = {
      userId: authenticatedUser.id,
      role: authenticatedUser.role,
      nom: authenticatedUser.nom || '',
      prenom: authenticatedUser.prenom || '',
      email: authenticatedUser.email,
      token: sessionToken,
      expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 heures
    };

    sessionStorage.setItem('isidocs_session', JSON.stringify(sessionObj));
    addToast(`Bienvenue, ${authenticatedUser.name || (authenticatedUser.prenom + ' ' + authenticatedUser.nom)} !`, 'success');
  };

  const handleLogout = () => {
    if (user) {
      logAuditAction(user.id, user.name || `${user.prenom} ${user.nom}`, user.role, 'LOGOUT', 'Déconnexion de l\'utilisateur');
    }
    setUser(null);
    sessionStorage.clear();
    addToast('Vous avez été déconnecté avec succès.', 'info');
  };

  const handlePasswordChanged = () => {
    if (user) {
      const updatedUser = getUserById(user.id);
      setUser(updatedUser);
    }
  };

  // Render appropriate dashboard depending on role
  const renderDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'etudiant':
        return (
          <ProtectedRoute roles={['etudiant']} user={user} onLogout={handleLogout} onPasswordChanged={handlePasswordChanged} addToast={addToast}>
            <StudentDashboard
              user={user}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              addToast={addToast}
            />
          </ProtectedRoute>
        );
      case 'agent':
        return (
          <ProtectedRoute roles={['agent']} user={user} onLogout={handleLogout} onPasswordChanged={handlePasswordChanged} addToast={addToast}>
            <StaffDashboard
              user={user}
              currentTab={currentTab}
              addToast={addToast}
            />
          </ProtectedRoute>
        );
      case 'prof':
        return (
          <ProtectedRoute roles={['prof']} user={user} onLogout={handleLogout} onPasswordChanged={handlePasswordChanged} addToast={addToast}>
            <ProfessorDashboard
              user={user}
              currentTab={currentTab}
              addToast={addToast}
            />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute roles={['admin']} user={user} onLogout={handleLogout} onPasswordChanged={handlePasswordChanged} addToast={addToast}>
            <AdminDashboard
              user={user}
              currentTab={currentTab}
              addToast={addToast}
            />
          </ProtectedRoute>
        );
      default:
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            Erreur : Rôle utilisateur non reconnu.
          </div>
        );
    }
  };

  // 1. If not authenticated, render Login Page
  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {/* Render Toasts */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 1.5. If password change is required, force full screen changment
  if (user.doitChangerMotDePasse) {
    return (
      <>
        <ProtectedRoute 
          roles={['admin', 'prof', 'agent', 'etudiant']} 
          user={user} 
          onLogout={handleLogout} 
          onPasswordChanged={handlePasswordChanged} 
          addToast={addToast}
        >
          <div style={{ padding: '40px', textAlign: 'center', color: '#0e294b' }}>
            Chargement...
          </div>
        </ProtectedRoute>
        {/* Render Toasts */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 2. Authenticated layout
  return (
    <div className="app-container">
      {/* Responsive Left Sidebar */}
      <Sidebar
        user={user}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header
          user={user}
          currentTab={currentTab}
          onLogout={handleLogout}
          notifications={notifications}
          setNotifications={setNotifications}
        />
        
        {/* Dynamic Inner Page */}
        {renderDashboardContent()}
      </div>

      {/* Render Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
