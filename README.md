# ISI-Docs : Portail de Gestion Documentaire et Scolaire Digitale
### Groupe ISI — Dakar, Sénégal

**ISI-Docs** est une application web moderne, centralisée et sécurisée pour la gestion administrative et académique du **Groupe ISI (Institut Supérieur d'Informatique) à Dakar, Sénégal**. Ce portail remplace les processus manuels et optimise le traitement, la validation et la délivrance officielle de documents universitaires (attestations d'inscription, relevés de notes, bulletins semestriels et attestations de validation de stage).

---

## 🚀 Fonctionnalités Clés

### 1. Espace Étudiant
*   **Tableau des Demandes & Pagination** : Interface sous forme de tableau interactif, filtrable et paginé (Année scolaire, Type de demande, Date, État, Actions) avec recherche textuelle.
*   **Soumission par Modal & Justificatif de Réclamation** : Bouton « Nouvelle demande » ouvrant un formulaire modal. Le dépôt d'une pièce justificative (PDF, PNG, JPG) est requis de manière strictement obligatoire **uniquement** pour les demandes de **Réclamation de note** (grade claims). Pour les autres demandes (Bulletins, Attestations), aucun justificatif n'est affiché ni demandé.
*   **Suivi de Demandes en Temps Réel** : Ligne du temps d'instruction (timeline) accessible via le bouton « Détails » retraçant chaque étape (Soumise → En cours → Approuvée/Rejetée → Délivrée) avec les remarques écrites des agents de la scolarité.
*   **Téléchargement Officiel** : Génération de documents au format **PDF** intégrant le logo de l'institut, signatures numériques, tampons officiels et codes QR de certification.

### 2. Espace Scolarité (Staff)
*   **File d'Attente Globale** : Gestion, tri et filtrage avancé de toutes les requêtes (par département, cohorte, type de document ou statut).
*   **Instruction des Requêtes** : Possibilité de passer en traitement, valider, délivrer ou rejeter (avec motif obligatoire) les requêtes des étudiants.
*   **Saisie des Évaluations (LMD)** : Outil de saisie de notes structuré par UE avec distinction de la note **MCC (40%)** (Contrôle Continu) et de la note **Examen (60%)**. Calcul instantané des moyennes d'EC, des coefficients, des moyennes d'UE et attribution automatique de crédits.
*   **Restriction des Habilitations** : Un professeur ne peut saisir ou modifier que les notes des matières et spécialités qui lui ont été affectées par l'administrateur. Les autres matières de la fiche étudiant restent en lecture seule (icône cadenas 🔒).

### 3. Portail d'Administration (Admin)
*   **Indicateurs & Décisions** : Dashboard analytique complet (taux d'approbation, temps moyen d'instruction, histogramme de répartition des documents).
*   **Gestion des Comptes Étudiants** : CRUD complet pour créer, modifier, et désactiver des fiches étudiants.
*   **Sécurité et Conformité E-mail** : Enregistrement restreint aux domaines institutionnels `@groupeisi.sn` ou `@isidk.sn` uniquement.
*   **Journaux d'Audit (Audit Trail)** : Historique d'audit retraçant chaque connexion, soumission, modification académique ou administrative avec nom, rôle, action et horodatage de sécurité.

---

## 🛡️ Sécurité et Politique d'Accès

L'application intègre des mesures de sécurité robustes conformément aux exigences de conformité et de confidentialité :
1. **Hachage des Mots de Passe** : Tous les mots de passe sont hachés de manière asynchrone à l'aide de l'algorithme SHA-256 via la Web Crypto API native du navigateur. Aucun mot de passe en clair n'est stocké en base.
2. **Politique de Complexité** : Tout mot de passe modifié doit comporter :
   - Minimum 8 caractères.
   - Au moins une lettre majuscule.
   - Au moins une lettre minuscule.
   - Au moins un chiffre.
   - Au moins un caractère spécial parmi `@ ! # $ % & * ?`.
3. **Changement Obligatoire à la Première Connexion** : Lors de la création d'un compte par l'administrateur, un mot de passe temporaire fort et conforme est généré automatiquement (format `Anty` + 4 chiffres + 1 car. spécial + 2 majuscules). L'utilisateur (étudiant, professeur, agent) est contraint de le modifier immédiatement dès sa première connexion sur une interface sécurisée dédiée.
4. **Protection Brute-Force** : Après 5 tentatives infructueuses consécutives sur une même adresse e-mail, la connexion est verrouillée pendant 15 minutes.
5. **Gestion de Session Temporaire** : La session active est conservée dans le `sessionStorage` (qui s'efface automatiquement à la fermeture du navigateur ou de l'onglet) et expire automatiquement après 8 heures d'inactivité.
6. **Restrictions de Domaines** : Seules les adresses e-mail appartenant aux domaines institutionnels officiels `@groupeisi.sn` et `@isidk.sn` sont autorisées dans le système.

---

## 🛠️ Architecture Technique

*   **Langages & Technologies Frontend** :
    *   **JavaScript (ES6+)** : Logique de présentation et de gestion d'état réactive (Framework **React.js** scaffoldé avec **Vite**).
    *   **HTML5 & CSS3 Vanilla** : Structure sémantique et système de style sur mesure.
*   **Langages & Technologies Backend** :
    *   **JavaScript** : L'application adopte une architecture client-side complète ("serverless" local). La couche backend (logique métier, authentification, validation de domaine, calculs académiques LMD) et la base de données sont simulées et gérées en **JavaScript** dans le navigateur (fichier d'état et persistance via `localStorage` dans `src/db/storage.js`).
*   **Design & UI System** : Charte graphique stricte basée exclusivement sur le **Bleu et le Blanc** (Bleu Acier `#0e294b`, bleu de marque `#2563eb`, gris ardoise et blanc pur), garantissant la neutralité visuelle exigée. Structure adaptative (responsive mobile), transitions fluides et animations de fenêtres modales sans aucune autre couleur parasite (pas d'orange, de vert ou de rouge).
*   **Système d'Impression PDF** : Intégration dans `src/components/DocumentViewer.jsx` qui pilote l'impression vectorielle native des navigateurs pour générer des fichiers PDF officiels en haute résolution.

---

## 🔑 Mode Démonstration (Comptes de Test)

Des raccourcis de connexion rapide sont intégrés au bas de l'écran d'accueil pour tester chaque rôle :

| Rôle | Adresse E-mail | Mot de passe | Nom d'utilisateur | Habilitations / Spécificités |
| :--- | :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@groupeisi.sn` | `Admin123@` | Prof. Papa Diallo | Accès Root complet |
| **Scolarité (Agent)** | `agent@groupeisi.sn` | `passer123@` | Aissatou Diaby GASSAMA | Traitement des documents |
| **Professeur (Sow)** | `prof@groupeisi.sn` | `passer123@` | Prof. Amadou Sow | Java avancé, C Sharp (Génie Logiciel) |
| **Professeur (Gaye)** | `ablaye.gaye@groupeisi.sn` | `passer123@` | Prof. Ablaye Gaye | Algorithme (GL), Java (IAGE) |
| **Étudiant (L3 GL)** | `etudiant@isidk.sn` | `passer123@` | Yaya COULIBALY | Visualisation et requêtes |

---

## 📈 Règlementation Académique (Modèle Sénégalais)

L'évaluation respecte le système LMD (Semestre 5, IAGE) :
- La note de l'élément constitutif (Moy EC) est calculée comme suit :  
  $$\text{Moy EC} = (\text{MCC} \times 0.4) + (\text{Examen} \times 0.6)$$
- La moyenne de l'Unité d'Enseignement (Moyenne UE) est pondérée par les coefficients individuels des éléments constitutifs de cette UE.
- Une UE est validée si sa moyenne est supérieure ou égale à **10,00/20**, attribuant ainsi l'intégralité des crédits (Cr.) associés à cette unité. Le semestre complet valide un maximum de **30,00 crédits**.

---

## ⚙️ Installation et Lancement Local

### Prérequis
- Node.js (Version 18+ recommandée)
- NPM (inclus avec Node.js)

### Étapes de démarrage

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Démarrer le serveur de développement local** :
   ```bash
   npm run dev
   ```

3. **Accéder à l'application** :  
   Ouvrez votre navigateur et accédez à l'adresse suivante : [http://localhost:5173](http://localhost:5173).
