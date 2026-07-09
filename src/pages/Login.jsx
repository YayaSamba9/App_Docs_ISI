import React, { useState } from 'react';
import { authenticateUser } from '../db/storage';
import { estBloqueBruteForce } from '../utils/security';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    // 1. Protection brute-force
    const bruteStatus = estBloqueBruteForce(email);
    if (bruteStatus.bloque) {
      setError(`Compte temporairement bloqué. Réessayez dans ${bruteStatus.minutesRestantes} minute(s).`);
      return;
    }

    setLoading(true);
    // Add small delay to simulate network call
    setTimeout(async () => {
      try {
        const user = await authenticateUser(email, password);
        setLoading(false);
        if (user) {
          const { reinitialiserEchecConnexion } = await import('../utils/security');
          reinitialiserEchecConnexion(email);
          onLoginSuccess(user);
        } else {
          const { enregistrerEchecConnexion } = await import('../utils/security');
          enregistrerEchecConnexion(email);
          
          const newBruteStatus = estBloqueBruteForce(email);
          if (newBruteStatus.bloque) {
            setError(`Compte temporairement bloqué. Réessayez dans 15 minutes.`);
          } else {
            setError('Identifiants incorrects. Veuillez réessayer.');
          }
        }
      } catch (err) {
        setLoading(false);
        setError('Une erreur est survenue lors de la connexion.');
      }
    }, 600);
  };

  const handleQuickLogin = async (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
    setLoading(true);
    
    const bruteStatus = estBloqueBruteForce(roleEmail);
    if (bruteStatus.bloque) {
      setLoading(false);
      setError(`Compte temporairement bloqué. Réessayez dans ${bruteStatus.minutesRestantes} minute(s).`);
      return;
    }

    setTimeout(async () => {
      try {
        const user = await authenticateUser(roleEmail, rolePassword);
        setLoading(false);
        if (user) {
          const { reinitialiserEchecConnexion } = await import('../utils/security');
          reinitialiserEchecConnexion(roleEmail);
          onLoginSuccess(user);
        } else {
          setError('Erreur d\'authentification avec le compte de test.');
        }
      } catch (err) {
        setLoading(false);
        setError('Une erreur est survenue.');
      }
    }, 400);
  };

  return (
    <div style={containerStyles}>
      {/* Brand Column (Left) */}
      <div style={brandColumnStyles}>
        <div style={brandOverlayStyles}>
          <div style={brandTagStyles}>Groupe ISI - Dakar, Sénégal</div>
          <h2 style={brandTitleStyles}>Institut Supérieur d'Informatique</h2>
          <p style={brandDescStyles}>
            Portail numérique de gestion et de délivrance de documents pédagogiques. Soumettez vos demandes, consultez vos bulletins semestriels, et suivez la validation de vos dossiers en temps réel.
          </p>
          <div style={brandFooterStyles}>
            © 2026 Groupe ISI Sénégal
          </div>
        </div>
      </div>

      {/* Form Column (Right) */}
      <div style={formColumnStyles}>
        <div style={formWrapperStyles}>
          {/* Logo */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <svg width="180" height="60" viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg">
              <text x="50%" y="18" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="bold" fontSize="16" fill="#1b4468" textAnchor="middle" letterSpacing="4">GROUPE</text>
              <text x="50%" y="54" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="900" fontSize="38" fill="#1b4468" textAnchor="middle" letterSpacing="1">ISI</text>
            </svg>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={formTitleStyles}>Scolarité Numérique</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Connectez-vous pour accéder à vos documents universitaires.
            </p>
          </div>

          {error && <div style={errorBannerStyles}>{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse E-mail Institutionnelle</label>
              <input
                type="email"
                className="form-control"
                placeholder="nom.prenom@isidk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Quick Login Helpers */}
          <div style={quickSectionStyles}>
            <div style={quickTitleStyles}>Comptes de test (Quick Login)</div>
            <div style={quickGridStyles}>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin@groupeisi.sn', 'Admin123@')} 
                style={quickBtnStyles}
                disabled={loading}
              >
                <strong>Admin (Diallo)</strong>
                <span>admin@groupeisi.sn</span>
                <span>pass: Admin123@</span>
              </button>
              
              <button 
                type="button" 
                onClick={() => handleQuickLogin('agent@groupeisi.sn', 'passer123@')} 
                style={quickBtnStyles}
                disabled={loading}
              >
                <strong>Scolarité (Gassama)</strong>
                <span>agent@groupeisi.sn</span>
                <span>pass: passer123@</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleQuickLogin('prof@groupeisi.sn', 'Prof123@')} 
                style={quickBtnStyles}
                disabled={loading}
              >
                <strong>Prof. Sow (GL)</strong>
                <span>prof@groupeisi.sn</span>
                <span>pass: Prof123@</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleQuickLogin('ablaye.gaye@groupeisi.sn', 'Prof123@')} 
                style={quickBtnStyles}
                disabled={loading}
              >
                <strong>Prof. Gaye (GL/IAGE)</strong>
                <span>ablaye.gaye@groupeisi.sn</span>
                <span>pass: Prof123@</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleQuickLogin('etudiant@isidk.sn', 'Prof123@')} 
                style={quickBtnStyles}
                disabled={loading}
              >
                <strong>Étudiant (Coulibaly)</strong>
                <span>etudiant@isidk.sn</span>
                <span>pass: Etudiant123@</span>
              </button>
            </div>
            
          </div>
        
        </div>
      </div>
    </div>
  );
}

// Inline CSS for Login Page layout
const containerStyles = {
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
};

const brandColumnStyles = {
  flex: '1.2',
  backgroundColor: '#1e3a8a',
  backgroundLinearGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
  color: 'white',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '60px',
  boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.1)',
  backgroundImage: 'radial-gradient(circle at 20% 30%, #2563eb 0%, #1e3a8a 70%)',
};

const brandOverlayStyles = {
  maxWidth: '520px',
};

const brandTagStyles = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: '#60a5fa',
  fontWeight: '700',
  marginBottom: '16px',
};

const brandTitleStyles = {
  fontSize: '2.25rem',
  fontWeight: '800',
  marginBottom: '20px',
  lineHeight: '1.2',
};

const brandDescStyles = {
  fontSize: '1rem',
  lineHeight: '1.6',
  color: '#cbd5e1',
  marginBottom: '40px',
};

const brandFooterStyles = {
  position: 'absolute',
  bottom: '40px',
  left: '60px',
  fontSize: '0.8rem',
  color: '#94a3b8',
};

const formColumnStyles = {
  flex: '1',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px',
};

const formWrapperStyles = {
  width: '100%',
  maxWidth: '400px',
};

const logoIconStyles = {
  width: '48px',
  height: '48px',
  borderRadius: '10px',
  backgroundColor: '#2563eb',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '900',
  fontSize: '1.25rem',
  marginBottom: '24px',
};

const formTitleStyles = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: 'var(--primary-dark)',
  marginBottom: '4px',
};

const errorBannerStyles = {
  padding: '12px 16px',
  backgroundColor: 'var(--status-rejected-bg)',
  color: 'var(--status-rejected)',
  borderRadius: 'var(--border-radius)',
  fontSize: '0.85rem',
  fontWeight: '500',
  marginBottom: '20px',
  border: '1px solid #cbd5e1',
};

const quickSectionStyles = {
  marginTop: '40px',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px',
};

const quickTitleStyles = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '12px',
};

const quickGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
};

const quickBtnStyles = {
  padding: '8px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  transition: 'var(--transition)',
  outline: 'none',
  fontSize: '0.68rem',
  color: 'var(--text-secondary)',
};
