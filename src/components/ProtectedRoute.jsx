import React, { useState } from 'react';
import { updateUserPassword } from '../db/storage';
import { validerMotDePasse, calculerForceMotDePasse } from '../utils/security';

/**
 * Composant de protection des routes par rôle.
 * Gère également la session expirée et le changement de mot de passe obligatoire.
 *
 * @param {Object} props
 * @param {string[]} props.roles - Liste des rôles autorisés
 * @param {React.ReactNode} props.children - Contenu protégé à afficher
 * @param {Object} props.user - Utilisateur connecté
 * @param {Function} props.onLogout - Callback de déconnexion
 * @param {Function} props.onPasswordChanged - Callback après changement de mot de passe réussi
 * @param {Function} props.addToast - Outil de notification Toast
 */
export default function ProtectedRoute({ roles, children, user, onLogout, onPasswordChanged, addToast }) {
  const activeSessionStr = sessionStorage.getItem('isidocs_session');
  
  let shouldLogout = false;
  let sessionExpired = false;
  
  if (!activeSessionStr || !user) {
    shouldLogout = true;
  } else {
    try {
      const session = JSON.parse(activeSessionStr);
      if (session.expiresAt < Date.now()) {
        shouldLogout = true;
        sessionExpired = true;
      }
    } catch (e) {
      shouldLogout = true;
    }
  }

  // Unconditional useEffect at the top level
  React.useEffect(() => {
    if (shouldLogout) {
      if (sessionExpired) {
        addToast("Session expirée. Veuillez vous reconnecter.", "info");
      }
      onLogout();
    }
  }, [shouldLogout, sessionExpired]);

  // If we need to log out, return null immediately
  if (shouldLogout) {
    return null;
  }

  // 3. Vérification du rôle autorisé
  if (!roles.includes(user.role)) {
    return (
      <div style={deniedContainerStyles}>
        <div style={deniedCardStyles}>
          <div style={deniedIconStyles}>
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px', color: '#0e294b' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 style={deniedTitleStyles}>Accès Refusé</h2>
          <p style={deniedTextStyles}>
            Votre compte ({user.email}) ne dispose pas des droits d'accès nécessaires pour consulter cet espace.
          </p>
          <button onClick={onLogout} className="btn btn-primary" style={{ width: '100%' }}>
            Se connecter avec un autre compte
          </button>
        </div>
      </div>
    );
  }

  // 4. Vérification du changement obligatoire de mot de passe
  if (user.doitChangerMotDePasse) {
    return (
      <ForceChangePassword 
        user={user} 
        onPasswordChanged={onPasswordChanged} 
        addToast={addToast} 
      />
    );
  }

  return children;
}

/**
 * Composant de changement obligatoire de mot de passe
 */
function ForceChangePassword({ user, onPasswordChanged, addToast }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validation = validerMotDePasse(newPass);
  const strength = calculerForceMotDePasse(newPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPass || !newPass || !confirmPass) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!validation.valide) {
      setError('Le nouveau mot de passe ne respecte pas les règles de sécurité.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserPassword(user.id, currentPass, newPass);
      setLoading(false);
      if (res.success) {
        addToast("Mot de passe modifié avec succès !", "success");
        onPasswordChanged(newPass);
      } else {
        setError(res.message || "Erreur lors de la modification.");
      }
    } catch (err) {
      setLoading(false);
      setError("Une erreur est survenue lors de la communication avec la base de données.");
    }
  };

  const getStrengthLabel = () => {
    switch (strength) {
      case 'fort': return 'Sécurité : Forte';
      case 'moyen': return 'Sécurité : Moyenne';
      default: return 'Sécurité : Faible';
    }
  };

  const getStrengthPercent = () => {
    switch (strength) {
      case 'fort': return '100%';
      case 'moyen': return '66%';
      default: return '33%';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'fort': return '#0e294b'; // Steel Blue
      case 'moyen': return '#2563eb'; // Brand Blue
      default: return '#94a3b8'; // Grey/Light Slate
    }
  };

  return (
    <div style={forceContainerStyles}>
      <div style={forceCardStyles}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <svg width="150" height="50" viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '12px' }}>
            <text x="50%" y="18" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="bold" fontSize="14" fill="#0e294b" textAnchor="middle" letterSpacing="3">GROUPE</text>
            <text x="50%" y="54" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="900" fontSize="34" fill="#0e294b" textAnchor="middle" letterSpacing="1">ISI</text>
          </svg>
          <h2 style={forceTitleStyles}>Sécurisation Obligatoire</h2>
          <p style={forceSubTitleStyles}>
            C'est votre première connexion. Vous devez changer votre mot de passe temporaire pour continuer.
          </p>
        </div>

        {error && <div style={errorBannerStyles}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={labelStyles}>Mot de passe temporaire actuel</label>
            <input
              type="password"
              className="form-control"
              placeholder="Saisissez le mot de passe reçu"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label style={labelStyles}>Nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 8 caractères complexes"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              disabled={loading}
              required
            />
            
            {/* Strength Bar */}
            {newPass && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: getStrengthColor(), marginBottom: '4px' }}>
                  <span>{getStrengthLabel()}</span>
                  <span>{getStrengthPercent()}</span>
                </div>
                <div style={strengthTrackStyles}>
                  <div style={{ ...strengthFillStyles, width: getStrengthPercent(), backgroundColor: getStrengthColor() }} />
                </div>
              </div>
            )}

            {/* Validation criteria */}
            <div style={criteriaGridStyles}>
              <div style={{ ...criteriaItemStyles, color: newPass.length >= 8 ? '#0e294b' : '#94a3b8', fontWeight: newPass.length >= 8 ? '700' : '400' }}>
                {newPass.length >= 8 ? '✓' : '○'} Min. 8 caractères
              </div>
              <div style={{ ...criteriaItemStyles, color: /[A-Z]/.test(newPass) ? '#0e294b' : '#94a3b8', fontWeight: /[A-Z]/.test(newPass) ? '700' : '400' }}>
                {/[A-Z]/.test(newPass) ? '✓' : '○'} 1 Majuscule
              </div>
              <div style={{ ...criteriaItemStyles, color: /[a-z]/.test(newPass) ? '#0e294b' : '#94a3b8', fontWeight: /[a-z]/.test(newPass) ? '700' : '400' }}>
                {/[a-z]/.test(newPass) ? '✓' : '○'} 1 Minuscule
              </div>
              <div style={{ ...criteriaItemStyles, color: /[0-9]/.test(newPass) ? '#0e294b' : '#94a3b8', fontWeight: /[0-9]/.test(newPass) ? '700' : '400' }}>
                {/[0-9]/.test(newPass) ? '✓' : '○'} 1 Chiffre
              </div>
              <div style={{ ...criteriaItemStyles, color: /[@!#$%&*\?]/.test(newPass) ? '#0e294b' : '#94a3b8', fontWeight: /[@!#$%&*\?]/.test(newPass) ? '700' : '400' }}>
                {/[@!#$%&*\?]/.test(newPass) ? '✓' : '○'} 1 Caractère spécial (@!#$%&*?)
              </div>
            </div>
          </div>

          <div className="form-group">
            <label style={labelStyles}>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirmez votre nouveau mot de passe"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '44px' }}
            disabled={loading || !validation.valide || newPass !== confirmPass}
          >
            {loading ? 'Modification en cours...' : 'Changer et Accéder au Portail'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const deniedContainerStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f8fafc',
  padding: '24px',
};

const deniedCardStyles = {
  maxWidth: '440px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(14, 41, 75, 0.1), 0 8px 10px -6px rgba(14, 41, 75, 0.1)',
  padding: '40px 32px',
  border: '1px solid #e2e8f0',
  textAlign: 'center',
};

const deniedIconStyles = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const deniedTitleStyles = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: '#0e294b',
  marginBottom: '10px',
};

const deniedTextStyles = {
  fontSize: '0.9rem',
  color: '#64748b',
  lineHeight: '1.5',
  marginBottom: '24px',
};

const forceContainerStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f1f5f9',
  padding: '20px',
};

const forceCardStyles = {
  maxWidth: '480px',
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(14, 41, 75, 0.08), 0 10px 10px -5px rgba(14, 41, 75, 0.04)',
  padding: '36px 30px',
  border: '1px solid #e2e8f0',
};

const forceTitleStyles = {
  fontSize: '1.35rem',
  fontWeight: '800',
  color: '#0e294b',
  marginBottom: '6px',
};

const forceSubTitleStyles = {
  fontSize: '0.85rem',
  color: '#64748b',
  lineHeight: '1.45',
};

const labelStyles = {
  fontSize: '0.82rem',
  fontWeight: '600',
  color: '#0e294b',
  marginBottom: '6px',
  display: 'block',
};

const strengthTrackStyles = {
  height: '6px',
  backgroundColor: '#e2e8f0',
  borderRadius: '3px',
  width: '100%',
  overflow: 'hidden',
  marginTop: '4px',
};

const strengthFillStyles = {
  height: '100%',
  borderRadius: '3px',
  transition: 'width 0.3s ease, background-color 0.3s ease',
};

const criteriaGridStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginTop: '12px',
  backgroundColor: '#f8fafc',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #f1f5f9',
};

const criteriaItemStyles = {
  fontSize: '0.76rem',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'color 0.2s',
};

const errorBannerStyles = {
  padding: '10px 14px',
  backgroundColor: '#eff6ff', // Keep it in blue tones to avoid red parasite colors
  color: '#0e294b',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: '600',
  marginBottom: '18px',
  border: '1.5px solid #dbeafe',
  lineHeight: '1.4',
};
