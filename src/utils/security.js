/**
 * Module de sécurité pour ISI-Docs
 * Fournit les outils de hachage, de validation de mot de passe, de gestion brute-force et de session.
 */

/**
 * Hash un mot de passe en SHA-256 avec la Web Crypto API native
 * @param {string} motDePasse - Le mot de passe en clair
 * @returns {Promise<string>} - Hash hexadécimal
 */
export async function hasherMotDePasse(motDePasse) {
  const encoder = new TextEncoder();
  const data = encoder.encode(motDePasse);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valide la complexité d'un mot de passe
 * @param {string} mdp - Le mot de passe à valider
 * @returns {{ valide: boolean, erreurs: string[] }}
 */
export function validerMotDePasse(mdp) {
  const erreurs = [];
  if (!mdp || mdp.length < 8) {
    erreurs.push("Minimum 8 caractères.");
  }
  if (!/[A-Z]/.test(mdp)) {
    erreurs.push("Au moins une lettre majuscule.");
  }
  if (!/[a-z]/.test(mdp)) {
    erreurs.push("Au moins une lettre minuscule.");
  }
  if (!/[0-9]/.test(mdp)) {
    erreurs.push("Au moins un chiffre.");
  }
  if (!/[@!#$%&*\?]/.test(mdp)) {
    erreurs.push("Au moins un caractère spécial : @ ! # $ % & * ?");
  }
  return {
    valide: erreurs.length === 0,
    erreurs
  };
}

/**
 * Calcule la force du mot de passe
 * @param {string} mdp - Le mot de passe à évaluer
 * @returns {'faible' | 'moyen' | 'fort'}
 */
export function calculerForceMotDePasse(mdp) {
  if (!mdp) return 'faible';
  let score = 0;
  if (mdp.length >= 8) score++;
  if (/[A-Z]/.test(mdp)) score++;
  if (/[a-z]/.test(mdp)) score++;
  if (/[0-9]/.test(mdp)) score++;
  if (/[@!#$%&*\?]/.test(mdp)) score++;

  if (score <= 2) return 'faible';
  if (score <= 4) return 'moyen';
  return 'fort';
}

/**
 * Vérifie si un email est bloqué par brute-force
 * @param {string} email - L'email de connexion
 * @returns {{ bloque: boolean, minutesRestantes: number }}
 */
export function estBloqueBruteForce(email) {
  const key = `brute_${email.toLowerCase().trim()}`;
  const dataStr = localStorage.getItem(key);
  if (!dataStr) return { bloque: false, minutesRestantes: 0 };
  
  try {
    const data = JSON.parse(dataStr);
    if (data.count >= 5 && data.blockedUntil > Date.now()) {
      const diffMs = data.blockedUntil - Date.now();
      return { bloque: true, minutesRestantes: Math.ceil(diffMs / 60000) };
    }
  } catch (e) {
    // Ignorer
  }
  return { bloque: false, minutesRestantes: 0 };
}

/**
 * Enregistre un échec de connexion brute-force
 * @param {string} email - L'email de connexion
 */
export function enregistrerEchecConnexion(email) {
  const key = `brute_${email.toLowerCase().trim()}`;
  const dataStr = localStorage.getItem(key);
  let data = { count: 0, blockedUntil: 0 };
  
  if (dataStr) {
    try {
      data = JSON.parse(dataStr);
    } catch (e) {}
  }
  
  // Si le blocage précédent a expiré, on recommence
  if (data.blockedUntil && data.blockedUntil <= Date.now()) {
    data.count = 1;
    data.blockedUntil = 0;
  } else {
    data.count += 1;
  }
  
  if (data.count >= 5) {
    data.blockedUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
  }
  
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Réinitialise le statut brute-force après connexion réussie
 * @param {string} email - L'email de connexion
 */
export function reinitialiserEchecConnexion(email) {
  const key = `brute_${email.toLowerCase().trim()}`;
  localStorage.removeItem(key);
}

/**
 * Génère un mot de passe temporaire fort et conforme
 * Format : "Anty" + 4 chiffres + 1 caractère spécial + 2 lettres majuscules
 * @returns {string}
 */
export function genererMotDePasseTemporaire() {
  const digits = Math.floor(1000 + Math.random() * 9000).toString(); // 4 chiffres
  const specials = ['@', '!', '#', '$', '%', '&', '*', '?'];
  const spec = specials[Math.floor(Math.random() * specials.length)];
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const up1 = uppers[Math.floor(Math.random() * 26)];
  const up2 = uppers[Math.floor(Math.random() * 26)];
  return `Anty${digits}${spec}${up1}${up2}`;
}
