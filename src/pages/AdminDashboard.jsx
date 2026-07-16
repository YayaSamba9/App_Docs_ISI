import React, { useState, useEffect } from 'react';
import { 
  getSystemAnalytics, 
  getStudents, 
  saveStudent, 
  deleteStudent, 
  deleteMultipleStudents,
  getDepartments, 
  saveDepartments, 
  getCohorts, 
  saveCohorts, 
  getAuditLogs,
  getUsers,
  saveUser,
  deleteUser
} from '../db/storage';
import StatsCard from '../components/StatsCard';
import { validerMotDePasse, calculerForceMotDePasse, genererMotDePasseTemporaire } from '../utils/security';

export default function AdminDashboard({ user, currentTab, addToast }) {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Student Form State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [stdCardNumber, setStdCardNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deptId, setDeptId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [stdStatus, setStdStatus] = useState('active');

  // Additional Student profile fields
  const [sexe, setSexe] = useState('Masculin');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [birthPlace, setBirthPlace] = useState('Dakar');
  const [domaine, setDomaine] = useState('Sciences et Technologies');
  const [mention, setMention] = useState('Informatique');
  const [grade, setGrade] = useState('Licence');
  const [specialty, setSpecialty] = useState('');

  // Department Modal & Form State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptFormName, setDeptFormName] = useState('');
  const [deptFormCode, setDeptFormCode] = useState('');
  const [deptFormFilières, setDeptFormFilières] = useState([]);
  const [newFilièreName, setNewFilièreName] = useState('');

  // Cohort Modal & Form State
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [cohortFormName, setCohortFormName] = useState('');

  // User Management state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState('prof');
  const [userFormMatieres, setUserFormMatieres] = useState([]);
  const [newMatiereSubject, setNewMatiereSubject] = useState('');
  const [newMatiereSpecialty, setNewMatiereSpecialty] = useState('');
  const [users, setUsers] = useState([]);

  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Import states
  const [showImportStudentsModal, setShowImportStudentsModal] = useState(false);
  const [showImportUsersModal, setShowImportUsersModal] = useState(false);
  const [importLog, setImportLog] = useState('');
  const [importing, setImporting] = useState(false);

  // Settings & password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const validation = validerMotDePasse(newPassword);
  const strength = calculerForceMotDePasse(newPassword);

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
      case 'fort': return '#0e294b';
      case 'moyen': return '#2563eb';
      default: return '#94a3b8';
    }
  };

  // Reload data
  const loadAdminData = () => {
    setAnalytics(getSystemAnalytics());
    setStudents(getStudents());
    setDepartments(getDepartments());
    setCohorts(getCohorts());
    setAuditLogs(getAuditLogs());
    setUsers(getUsers());
    setSelectedStudentIds([]); // Clear selection on reload
  };

  useEffect(() => {
    loadAdminData();
  }, [currentTab]);

  const downloadStudentTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Matricule;Prenom;Nom;Sexe;DateNaissance;LieuNaissance;Domaine;Mention;Specialite;Niveau;Departement;Cohorte\r\n"
      + "24001;Mamadou;Diop;Masculin;2002-05-14;Dakar;Sciences et Technologies;Informatique;Génie Logiciel;Licence;Génie Informatique;Promotion 2024\r\n"
      + "24002;Awa;Ndiaye;Féminin;2003-08-22;Saint-Louis;Sciences et Technologies;Informatique;Génie Logiciel;Licence;Génie Informatique;Promotion 2024";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modele_import_etudiants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadUserTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "NomComplet;Email;Role;MatiereHabilitations\r\n"
      + "Prof. Ablaye Gaye;ablaye.gaye@groupeisi.sn;prof;Algorithme:Génie Logiciel|Java:Informatique de Gestion\r\n"
      + "Prof. Amadou Sow;prof@groupeisi.sn;prof;Java avancé:Génie Logiciel|C Sharp:Génie Logiciel\r\n"
      + "Agent Scolarite;agent@groupeisi.sn;agent;";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modele_import_utilisateurs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportStudents = async (file) => {
    if (!file) return;
    setImporting(true);
    setImportLog('Début de l\'analyse du fichier...\n');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          setImportLog(prev => prev + 'Erreur : Le fichier est vide ou ne contient pas de données.\n');
          setImporting(false);
          return;
        }
        
        const headerLine = lines[0];
        const separator = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        setImportLog(prev => prev + `Séparateur détecté : "${separator}"\n`);
        setImportLog(prev => prev + `Colonnes trouvées : ${headers.join(', ')}\n\n`);
        
        let successCount = 0;
        let skipCount = 0;
        
        // Load latest state
        const currentStudents = getStudents();
        const currentUsers = getUsers();
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(separator).map(v => v.trim().replace(/^["']|["']$/g, ''));
          if (values.length < 3) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (colonnes insuffisantes) : "${line}"\n`);
            skipCount++;
            continue;
          }
          
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          const matricule = row.Matricule || row.matricule || values[0];
          const prenom = row.Prenom || row.prenom || values[1];
          const nom = row.Nom || row.nom || values[2];
          
          if (!matricule || !prenom || !nom) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (champs obligatoires manquants : Matricule, Prenom, Nom) : ${line}\n`);
            skipCount++;
            continue;
          }
          
          // Validate Matricule / studentId is unique
          if (currentStudents.some(s => s.studentId === matricule)) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (Numéro Carte / Matricule ${matricule} déjà existant)\n`);
            skipCount++;
            continue;
          }
          
          // Generate institutional email automatically (prenom.nom@isidk.sn)
          const cleanStr = (str) => {
            return str
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // remove accents
              .replace(/[^a-z0-9.-]/g, "") // keep lowercase alphanumeric, dots, hyphens
              .replace(/\s+/g, ""); // remove spaces
          };
          const prenomClean = cleanStr(prenom);
          const nomClean = cleanStr(nom);
          let emailBase = `${prenomClean}.${nomClean}`;
          let generatedEmail = `${emailBase}@isidk.sn`;
          
          // Avoid email collision
          let counter = 1;
          while (currentUsers.some(u => u.email === generatedEmail) || currentStudents.some(s => s.email === generatedEmail)) {
            counter++;
            generatedEmail = `${emailBase}${counter}@isidk.sn`;
          }
          
          const deptName = row.Departement || row.departement || '';
          const cohortName = row.Cohorte || row.cohorte || '';
          
          const matchedDept = departments.find(d => 
            d.name.toLowerCase().includes(deptName.toLowerCase()) || 
            d.id.toLowerCase() === deptName.toLowerCase()
          ) || departments[0];
          
          const matchedCohort = cohorts.find(c => 
            c.name.toLowerCase().includes(cohortName.toLowerCase()) || 
            c.id.toLowerCase() === cohortName.toLowerCase()
          ) || cohorts[0];
          
          try {
            await saveStudent({
              studentId: matricule,
              firstName: prenom,
              lastName: nom,
              email: generatedEmail,
              departmentId: matchedDept ? matchedDept.id : 'dept-gi',
              cohortId: matchedCohort ? matchedCohort.id : 'coh-2024',
              sexe: row.Sexe || row.sexe || 'Masculin',
              birthDate: row.DateNaissance || row.birthDate || '2000-01-01',
              birthPlace: row.LieuNaissance || row.birthPlace || 'Dakar',
              domaine: row.Domaine || row.domaine || 'Sciences et Technologies',
              mention: row.Mention || row.mention || 'Informatique',
              specialty: row.Specialite || row.specialty || 'Génie Logiciel',
              grade: row.Niveau || row.grade || 'Licence',
              status: 'active',
              password: 'passer123@'
            }, user);
            
            setImportLog(prev => prev + `✓ Étudiant importé : ${prenom} ${nom} (${matricule}) -> E-mail : ${generatedEmail}\n`);
            successCount++;
            
            // Add to locally tracked list to prevent duplicate emails/matricules in same file
            currentStudents.push({ studentId: matricule, email: generatedEmail });
            currentUsers.push({ email: generatedEmail });
          } catch (err) {
            setImportLog(prev => prev + `✗ Erreur ligne ${i + 1} : ${err.message}\n`);
            skipCount++;
          }
        }
        
        setImportLog(prev => prev + `\n--- RAPPORT FINAL ---\nImportés : ${successCount}\nIgnorés/Erreurs : ${skipCount}\n`);
        addToast(`${successCount} étudiants importés avec succès !`, 'success');
        
        setStudents(getStudents());
        setAnalytics(getSystemAnalytics());
      } catch (err) {
        setImportLog(prev => prev + `Erreur critique de lecture : ${err.message}\n`);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImportUsers = async (file) => {
    if (!file) return;
    setImporting(true);
    setImportLog('Début de l\'analyse du fichier...\n');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          setImportLog(prev => prev + 'Erreur : Le fichier est vide ou ne contient pas de données.\n');
          setImporting(false);
          return;
        }
        
        const headerLine = lines[0];
        const separator = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        setImportLog(prev => prev + `Séparateur détecté : "${separator}"\n`);
        setImportLog(prev => prev + `Colonnes trouvées : ${headers.join(', ')}\n\n`);
        
        let successCount = 0;
        let skipCount = 0;
        
        // Load latest state
        const currentUsers = getUsers();
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(separator).map(v => v.trim().replace(/^["']|["']$/g, ''));
          if (values.length < 3) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (colonnes insuffisantes) : "${line}"\n`);
            skipCount++;
            continue;
          }
          
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          const nomComplet = row.NomComplet || row.name || values[0];
          const email = row.Email || row.email || values[1];
          const role = (row.Role || row.role || values[2]).toLowerCase();
          
          if (!nomComplet || !email || !role) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (champs obligatoires manquants) : ${line}\n`);
            skipCount++;
            continue;
          }
          
          if (!email.endsWith('@isidk.sn') && !email.endsWith('@groupeisi.sn')) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (domaine e-mail invalide, doit être @isidk.sn ou @groupeisi.sn) : ${email}\n`);
            skipCount++;
            continue;
          }
          
          if (role !== 'prof' && role !== 'agent' && role !== 'admin') {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (rôle "${role}" invalide, doit être: prof, agent ou admin) : ${line}\n`);
            skipCount++;
            continue;
          }
          
          if (currentUsers.some(u => u.email === email)) {
            setImportLog(prev => prev + `Ligne ${i + 1} ignorée (E-mail ${email} déjà existant)\n`);
            skipCount++;
            continue;
          }
          
          const habsRaw = row.MatiereHabilitations || row.habilitations || values[3] || '';
          const matieres = [];
          if (role === 'prof' && habsRaw) {
            const pairs = habsRaw.split('|');
            pairs.forEach(pair => {
              const parts = pair.split(':');
              if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
                matieres.push({
                  subject: parts[0].trim(),
                  specialty: parts[1].trim()
                });
              }
            });
          }
          
          try {
            await saveUser({
              name: nomComplet,
              email: email,
              role: role,
              matieres: matieres,
              password: 'passer123@'
            }, user);
            
            setImportLog(prev => prev + `✓ Utilisateur importé : ${nomComplet} (${email}, Rôle: ${role})\n`);
            successCount++;
            
            currentUsers.push({ email });
          } catch (err) {
            setImportLog(prev => prev + `✗ Erreur ligne ${i + 1} : ${err.message}\n`);
            skipCount++;
          }
        }
        
        setImportLog(prev => prev + `\n--- RAPPORT FINAL ---\nImportés : ${successCount}\nIgnorés/Erreurs : ${skipCount}\n`);
        addToast(`${successCount} utilisateurs importés avec succès !`, 'success');
        
        setUsers(getUsers());
        setAnalytics(getSystemAnalytics());
      } catch (err) {
        setImportLog(prev => prev + `Erreur critique de lecture : ${err.message}\n`);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Student CRUD operations
  const handleOpenCreateStudent = () => {
    setStudentId('');
    setStdCardNumber('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    
    const firstDept = departments[0];
    setDeptId(firstDept?.id || '');
    setCohortId(cohorts[0]?.id || '');
    setStdStatus('active');
    
    // Reset additional fields
    setSexe('Masculin');
    setBirthDate('2000-01-01');
    setBirthPlace('Dakar');
    setDomaine('Sciences et Technologies');
    setMention('Informatique');
    setGrade('Licence');
    setSpecialty(firstDept?.filières?.[0] || '');
    
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (s) => {
    setStudentId(s.id);
    setStdCardNumber(s.studentId);
    setFirstName(s.firstName);
    setLastName(s.lastName);
    setEmail(s.email);
    setPassword(''); // leave blank if no password update
    setDeptId(s.departmentId);
    setCohortId(s.cohortId);
    setStdStatus(s.status);
    
    // Pre-fill additional fields
    setSexe(s.sexe || 'Masculin');
    setBirthDate(s.birthDate || '2000-01-01');
    setBirthPlace(s.birthPlace || 'Dakar');
    setDomaine(s.domaine || 'Sciences et Technologies');
    setMention(s.mention || 'Informatique');
    setGrade(s.grade || 'Licence');
    setSpecialty(s.specialty || '');
    
    setShowStudentModal(true);
  };

  const handleDeptChange = (newDeptId) => {
    setDeptId(newDeptId);
    const dept = departments.find(d => d.id === newDeptId);
    if (dept && dept.filières && dept.filières.length > 0) {
      setSpecialty(dept.filières[0]);
    } else {
      setSpecialty('');
    }
  };

  const handleSaveStudentSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !stdCardNumber.trim()) {
      addToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    const emailLower = email.trim().toLowerCase();
    if (!emailLower.endsWith('@groupeisi.sn') && !emailLower.endsWith('@isidk.sn')) {
      addToast("L'adresse e-mail doit impérativement se terminer par @groupeisi.sn ou @isidk.sn.", "error");
      return;
    }

    let tempPass = undefined;
    if (!studentId) {
      tempPass = 'passer123@';
    }

    await saveStudent({
      id: studentId || undefined,
      studentId: stdCardNumber,
      firstName,
      lastName,
      email: emailLower,
      password: tempPass,
      departmentId: deptId,
      cohortId: cohortId,
      status: stdStatus,
      sexe,
      birthDate,
      birthPlace,
      domaine,
      mention,
      specialty,
      grade
    }, user);

    if (tempPass) {
      setCreatedCredentials({
        name: `${firstName} ${lastName}`,
        email: emailLower,
        password: tempPass,
        role: 'etudiant'
      });
    } else {
      addToast('Profil étudiant mis à jour.', 'success');
    }
    
    setShowStudentModal(false);
    loadAdminData();
  };

  const handleDeleteStudentClick = (sId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet étudiant ? Cette action supprimera également son compte utilisateur.')) {
      deleteStudent(sId, user);
      addToast('Compte étudiant supprimé.', 'success');
      loadAdminData();
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleBulkDeleteStudents = () => {
    if (selectedStudentIds.length === 0) return;
    const confirmMsg = `Êtes-vous sûr de vouloir supprimer ces ${selectedStudentIds.length} étudiants sélectionnés ? Cette action supprimera également leurs fiches et leurs comptes d'accès de manière définitive.`;
    if (window.confirm(confirmMsg)) {
      const res = deleteMultipleStudents(selectedStudentIds, user);
      if (res.success) {
        addToast(`${res.count} étudiants supprimés avec succès.`, 'success');
        loadAdminData();
      } else {
        addToast('Une erreur est survenue lors de la suppression groupée.', 'error');
      }
    }
  };

  // Department CRUD operations
  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setDeptFormName('');
    setDeptFormCode('');
    setDeptFormFilières([]);
    setNewFilièreName('');
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setDeptFormName(dept.name);
    setDeptFormCode(dept.code);
    setDeptFormFilières(dept.filières || []);
    setNewFilièreName('');
    setShowDeptModal(true);
  };

  const handleAddFilièreToForm = () => {
    if (!newFilièreName.trim()) return;
    if (deptFormFilières.includes(newFilièreName.trim())) {
      addToast('Cette filière existe déjà dans la liste.', 'error');
      return;
    }
    setDeptFormFilières([...deptFormFilières, newFilièreName.trim()]);
    setNewFilièreName('');
  };

  const handleRemoveFilièreFromForm = (index) => {
    setDeptFormFilières(deptFormFilières.filter((_, idx) => idx !== index));
  };

  const handleSaveDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptFormName.trim() || !deptFormCode.trim()) {
      addToast('Veuillez renseigner le nom et le code du département.', 'error');
      return;
    }

    let updatedDepts;
    if (editingDept) {
      updatedDepts = departments.map(d => d.id === editingDept.id ? {
        ...d,
        name: deptFormName.trim(),
        code: deptFormCode.trim().toUpperCase(),
        filières: deptFormFilières
      } : d);
      addToast('Département mis à jour.', 'success');
    } else {
      updatedDepts = [...departments, {
        id: `dept-${Date.now()}`,
        name: deptFormName.trim(),
        code: deptFormCode.trim().toUpperCase(),
        filières: deptFormFilières
      }];
      addToast('Nouveau département ajouté.', 'success');
    }

    saveDepartments(updatedDepts);
    setShowDeptModal(false);
    loadAdminData();
  };

  const handleDeleteDeptClick = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    // Check if students are attached
    const attachedStudents = students.filter(s => s.departmentId === deptId);
    if (attachedStudents.length > 0) {
      if (!window.confirm(`Attention : ${attachedStudents.length} étudiant(s) sont liés à ce département. Si vous le supprimez, leur département apparaîtra comme 'Inconnu'. Voulez-vous continuer ?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Voulez-vous vraiment supprimer le département "${dept.name}" ?`)) {
        return;
      }
    }

    const updatedDepts = departments.filter(d => d.id !== deptId);
    saveDepartments(updatedDepts);
    addToast('Département supprimé.', 'success');
    loadAdminData();
  };

  // Cohort CRUD operations
  const handleOpenCreateCohort = () => {
    setEditingCohort(null);
    setCohortFormName('');
    setShowCohortModal(true);
  };

  const handleOpenEditCohort = (cohort) => {
    setEditingCohort(cohort);
    setCohortFormName(cohort.name);
    setShowCohortModal(true);
  };

  const handleSaveCohortSubmit = (e) => {
    e.preventDefault();
    if (!cohortFormName.trim()) {
      addToast('Veuillez renseigner le nom de la cohorte.', 'error');
      return;
    }

    let updatedCohorts;
    if (editingCohort) {
      updatedCohorts = cohorts.map(c => c.id === editingCohort.id ? {
        ...c,
        name: cohortFormName.trim()
      } : c);
      addToast('Promotion/Cohorte mise à jour.', 'success');
    } else {
      updatedCohorts = [...cohorts, {
        id: `coh-${Date.now()}`,
        name: cohortFormName.trim()
      }];
      addToast('Nouvelle promotion/cohorte ajoutée.', 'success');
    }

    saveCohorts(updatedCohorts);
    setShowCohortModal(false);
    loadAdminData();
  };

  const handleDeleteCohortClick = (cohId) => {
    const cohort = cohorts.find(c => c.id === cohId);
    const attachedStudents = students.filter(s => s.cohortId === cohId);
    if (attachedStudents.length > 0) {
      if (!window.confirm(`Attention : ${attachedStudents.length} étudiant(s) sont liés à cette cohorte. Si vous la supprimez, leur cohorte apparaîtra comme 'Inconnu'. Voulez-vous continuer ?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Voulez-vous vraiment supprimer la cohorte "${cohort.name}" ?`)) {
        return;
      }
    }

    const updatedCohorts = cohorts.filter(c => c.id !== cohId);
    saveCohorts(updatedCohorts);
    addToast('Promotion/Cohorte supprimée.', 'success');
    loadAdminData();
  };

  // User Accounts CRUD
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPassword('');
    setUserFormRole('prof');
    setUserFormMatieres([]);
    setNewMatiereSubject('');
    setNewMatiereSpecialty('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserFormName(u.name);
    setUserFormEmail(u.email);
    setUserFormPassword(''); // blank if unchanged
    setUserFormRole(u.role);
    setUserFormMatieres(u.matieres || []);
    setNewMatiereSubject('');
    setNewMatiereSpecialty('');
    setShowUserModal(true);
  };

  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    if (!userFormName.trim() || !userFormEmail.trim()) {
      addToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    
    const emailLower = userFormEmail.trim().toLowerCase();
    if (!emailLower.endsWith('@groupeisi.sn') && !emailLower.endsWith('@isidk.sn')) {
      addToast("L'adresse e-mail doit se terminer par @groupeisi.sn ou @isidk.sn.", 'error');
      return;
    }

    let tempPass = undefined;
    if (!editingUser) {
      tempPass = 'passer123@';
    }

    await saveUser({
      id: editingUser?.id || undefined,
      name: userFormName.trim(),
      email: emailLower,
      role: userFormRole,
      password: tempPass,
      matieres: userFormRole === 'prof' ? userFormMatieres : undefined
    }, user);

    if (tempPass) {
      setCreatedCredentials({
        name: userFormName.trim(),
        email: emailLower,
        password: tempPass,
        role: userFormRole
      });
    } else {
      addToast('Compte utilisateur mis à jour.', 'success');
    }
    
    setShowUserModal(false);
    loadAdminData();
  };

  const handleDeleteUserClick = (uId) => {
    const targetUser = users.find(u => u.id === uId);
    if (!targetUser) return;
    
    if (targetUser.id === user.id) {
      addToast("Vous ne pouvez pas supprimer votre propre compte admin.", 'error');
      return;
    }

    let warning = `Voulez-vous vraiment supprimer le compte de ${targetUser.name} (${targetUser.email}) ?`;
    if (targetUser.role === 'etudiant') {
      warning += " Attention : Ce compte est lié à un étudiant. Supprimer ce compte supprimera également sa fiche étudiante !";
    }

    if (window.confirm(warning)) {
      deleteUser(uId, user);
      addToast('Compte utilisateur supprimé.', 'success');
      loadAdminData();
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Veuillez remplir tous les champs.', 'error');
      return;
    }
    
    const { validerMotDePasse } = await import('../utils/security');
    const validation = validerMotDePasse(newPassword);
    if (!validation.valide) {
      addToast(validation.erreurs[0] || 'Le nouveau mot de passe ne respecte pas les règles de sécurité.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }
    
    setIsSubmittingPassword(true);
    try {
      const { updateUserPassword } = await import('../db/storage');
      const res = await updateUserPassword(user.id, currentPassword, newPassword);
      setIsSubmittingPassword(false);
      
      if (res.success) {
        addToast(res.message, 'success');
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err) {
      setIsSubmittingPassword(false);
      addToast('Une erreur est survenue.', 'error');
    }
  };

  const translateDocType = (type) => {
    switch (type) {
      case 'enrollment_certificate': return 'Certificat Scolarité';
      case 'transcript': return 'Relevé Notes';
      case 'internship_certificate': return 'Attest. Stage';
      case 'report_card': return 'Bulletin';
      default: return type;
    }
  };

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="content-body fade-in">
      {/* 1. Analytics / Overview Tab */}
      {currentTab === 'dashboard' && analytics && (
        <div>
          {/* Stats widgets */}
          <div className="stats-grid">
            <StatsCard
              title="Demandes Totales"
              value={analytics.totalRequests}
              statusType="primary"
              description="Demandes soumises"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              }
            />
            <StatsCard
              title="Délivrées"
              value={analytics.deliveredCount}
              statusType="success"
              description="Transmises aux étudiants"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            />
            <StatsCard
              title="En Traitement"
              value={analytics.inProgressCount}
              statusType="warning"
              description="Instruction par la scolarité"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              }
            />
            <StatsCard
              title="Temps Moyen"
              value={analytics.avgProcessingTime}
              statusType="purple"
              description="Soumission → Clôture"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            />
          </div>

          <div className="dashboard-layout">
            {/* Custom SVG Distribution Chart */}
            <div className="card">
              <h3 className="card-title">Distribution des Documents Demandés</h3>
              <div className="chart-container">
                {Object.keys(analytics.docCounts).map(type => {
                  const val = analytics.docCounts[type];
                  const percentage = analytics.totalRequests > 0 ? (val / analytics.totalRequests) * 100 : 0;
                  
                  return (
                    <div key={type} className="chart-bar-group">
                      <div className="chart-bar-header">
                        <span>{translateDocType(type)}</span>
                        <span>{val} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="card">
              <h3 className="card-title">Résumé du Système</h3>
              <div style={quickStatsContainer}>
                <div style={quickStatsItem}>
                  <span>Étudiants Inscrits</span>
                  <strong>{analytics.activeStudentsCount}</strong>
                </div>
                <div style={quickStatsItem}>
                  <span>Demandes Rejetées</span>
                  <strong style={{ color: 'var(--status-rejected)' }}>{analytics.rejectedCount}</strong>
                </div>
                <div style={quickStatsItem}>
                  <span>Taux d'Approbation</span>
                  <strong style={{ color: 'var(--status-approved)' }}>
                    {analytics.totalRequests > 0 
                      ? `${(((analytics.approvedCount + analytics.deliveredCount) / analytics.totalRequests) * 100).toFixed(1)}%` 
                      : '100%'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Management CRUD */}
      {currentTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
            {selectedStudentIds.length > 0 && (
              <button onClick={handleBulkDeleteStudents} className="btn btn-danger" style={{ marginRight: 'auto' }}>
                🗑️ Supprimer la sélection ({selectedStudentIds.length})
              </button>
            )}
            <button onClick={() => { setImportLog(''); setShowImportStudentsModal(true); }} className="btn btn-secondary">
              📂 Importer Étudiants (CSV)
            </button>
            <button onClick={handleOpenCreateStudent} className="btn btn-primary">
              + Créer Fiche Étudiant
            </button>
          </div>

          <div className="card">
            <h3 className="card-title">Liste des Étudiants Inscrits</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingLeft: '20px' }}>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAllStudents} 
                        checked={selectedStudentIds.length === students.length && students.length > 0} 
                        style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                      />
                    </th>
                    <th>N° Carte</th>
                    <th>Nom Complet</th>
                    <th>E-mail</th>
                    <th>Département & Filière</th>
                    <th>Promotion / Cohorte</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{ paddingLeft: '20px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedStudentIds.includes(s.id)} 
                          onChange={() => handleSelectStudent(s.id)} 
                          style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                        />
                      </td>
                      <td style={{ fontWeight: '750' }}>{s.studentId}</td>
                      <td style={{ fontWeight: '500' }}>{s.lastName} {s.firstName}</td>
                      <td>{s.email}</td>
                      <td>
                        <span style={{ display: 'block', fontWeight: '500' }}>{s.departmentName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.specialty || 'Aucune filière'} ({s.grade})</span>
                      </td>
                      <td>{s.cohortName}</td>
                      <td>
                        <span className={`badge ${s.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                          {s.status === 'active' ? 'Actif' : 'Diplômé'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEditStudent(s)} style={actionBtnStyles} title="Modifier">
                          ✎
                        </button>
                        <button onClick={() => handleDeleteStudentClick(s.id)} style={{ ...actionBtnStyles, color: 'var(--status-rejected)' }} title="Supprimer">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Configurations CRUD (Depts & Cohorts) */}
      {currentTab === 'configurations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          
          {/* Departments & Filières Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Départements & Filières</h3>
              <button onClick={handleOpenCreateDept} className="btn btn-primary btn-sm">+ Nouveau Département</button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Code</th>
                    <th style={{ width: '35%' }}>Libellé Département</th>
                    <th style={{ width: '35%' }}>Filières / Subdivisions</th>
                    <th style={{ textAlign: 'right', width: '15%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 'bold' }}>{d.code}</td>
                      <td style={{ fontWeight: '500' }}>{d.name}</td>
                      <td>
                        {d.filières && d.filières.length > 0 ? (
                          <select 
                            className="form-control" 
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '6px 12px', 
                              height: 'auto', 
                              backgroundColor: 'var(--bg-primary)', 
                              borderColor: '#e2e8f0',
                              borderRadius: '6px',
                              color: 'var(--text-primary)',
                              width: '100%',
                              maxWidth: '220px'
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Voir les filières ({d.filières.length})</option>
                            {d.filières.map((f, idx) => (
                              <option key={idx} value={f}>{f}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Aucune filière définie</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEditDept(d)} style={actionBtnStyles} title="Modifier le département">
                          ✎
                        </button>
                        <button onClick={() => handleDeleteDeptClick(d.id)} style={{ ...actionBtnStyles, color: 'var(--status-rejected)' }} title="Supprimer le département">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cohorts Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Cohortes & Promotions</h3>
              <button onClick={handleOpenCreateCohort} className="btn btn-primary btn-sm">+ Nouvelle Cohorte</button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Libellé Promotion</th>
                    <th style={{ textAlign: 'right', width: '25%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '500' }}>{c.name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEditCohort(c)} style={actionBtnStyles} title="Modifier la cohorte">
                          ✎
                        </button>
                        <button onClick={() => handleDeleteCohortClick(c.id)} style={{ ...actionBtnStyles, color: 'var(--status-rejected)' }} title="Supprimer la cohorte">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.5 User Accounts Tab */}
      {currentTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => { setImportLog(''); setShowImportUsersModal(true); }} className="btn btn-secondary">
              📂 Importer Enseignants & Scolarité (CSV)
            </button>
            <button onClick={handleOpenCreateUser} className="btn btn-primary">
              + Créer un Compte
            </button>
          </div>

          <div className="card">
            <h3 className="card-title">Comptes Utilisateurs du Système</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom Complet</th>
                    <th>E-mail de connexion</th>
                    <th>Rôle du compte</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${
                          u.role === 'admin' ? 'badge-rejected' : 
                          u.role === 'agent' ? 'badge-in_progress' : 
                          u.role === 'prof' ? 'badge-submitted' : 'badge-approved'
                        }`}>
                          {u.role === 'admin' ? 'Administrateur' : 
                           u.role === 'agent' ? 'Secrétaire' : 
                           u.role === 'prof' ? 'Professeur' : 'Étudiant'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEditUser(u)} style={actionBtnStyles} title="Modifier l'utilisateur">
                          ✎
                        </button>
                        <button onClick={() => handleDeleteUserClick(u.id)} style={{ ...actionBtnStyles, color: 'var(--status-rejected)' }} title="Supprimer l'utilisateur">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Audit Trail Tab */}
      {currentTab === 'audits' && (
        <div className="card">
          <h3 className="card-title">Traces de Sécurité du Système</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Opération</th>
                  <th>Détails de l'action</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDateTime(l.timestamp)}</td>
                    <td style={{ fontWeight: '600' }}>{l.name}</td>
                    <td>
                      <span className={`badge ${l.role === 'admin' ? 'badge-rejected' : l.role === 'agent' ? 'badge-in_progress' : 'badge-approved'}`}>
                        {l.role}
                      </span>
                    </td>
                    <td><strong style={{ fontSize: '0.78rem' }}>{l.action}</strong></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Settings & Security Tab */}
      {currentTab === 'settings' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card fade-in">
            <h3 className="card-title">
              <span>Paramètres de Sécurité</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Protégez votre compte en changeant régulièrement votre mot de passe administrateur.
            </p>
            
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  id="currentPassword"
                  type="password"
                  className="form-control"
                  placeholder="Saisissez votre mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmittingPassword}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-control"
                    placeholder="Saisissez un mot de passe sécurisé"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                    required
                  />
                  
                  {/* Strength meter */}
                  {newPassword && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: getStrengthColor(), marginBottom: '4px' }}>
                        <span>{getStrengthLabel()}</span>
                        <span>{getStrengthPercent()}</span>
                      </div>
                      <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: getStrengthPercent(), backgroundColor: getStrengthColor(), transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Répétez le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                    required
                  />
                </div>
              </div>

              {/* Real-time criteria feedback */}
              {newPassword && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                  marginBottom: '16px',
                  marginTop: '-8px'
                }}>
                  <div style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px', color: newPassword.length >= 8 ? '#0e294b' : '#94a3b8', fontWeight: newPassword.length >= 8 ? '700' : '400' }}>
                    {newPassword.length >= 8 ? '✓' : '○'} Min. 8 caractères
                  </div>
                  <div style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px', color: /[A-Z]/.test(newPassword) ? '#0e294b' : '#94a3b8', fontWeight: /[A-Z]/.test(newPassword) ? '700' : '400' }}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '○'} 1 lettre Majuscule
                  </div>
                  <div style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px', color: /[a-z]/.test(newPassword) ? '#0e294b' : '#94a3b8', fontWeight: /[a-z]/.test(newPassword) ? '700' : '400' }}>
                    {/[a-z]/.test(newPassword) ? '✓' : '○'} 1 lettre minuscule
                  </div>
                  <div style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px', color: /[0-9]/.test(newPassword) ? '#0e294b' : '#94a3b8', fontWeight: /[0-9]/.test(newPassword) ? '700' : '400' }}>
                    {/[0-9]/.test(newPassword) ? '✓' : '○'} 1 chiffre
                  </div>
                  <div style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px', color: /[@!#$%&*\?]/.test(newPassword) ? '#0e294b' : '#94a3b8', fontWeight: /[@!#$%&*\?]/.test(newPassword) ? '700' : '400' }}>
                    {/[@!#$%&*\?]/.test(newPassword) ? '✓' : '○'} 1 caractère spécial (@!#$%&*?)
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingPassword || !validation.valide || newPassword !== confirmPassword}
                  style={{ width: '100%' }}
                >
                  {isSubmittingPassword ? 'Mise à jour en cours...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Student Modal */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{studentId ? 'Modifier Fiche Étudiant' : 'Créer Fiche Étudiant'}</h3>
              <button onClick={() => setShowStudentModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveStudentSubmit}>
              <div className="modal-body">
                
                {/* 1. Name grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom de famille</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 2. ID & email */}
                <div className="form-group">
                  <label>Numéro Carte Étudiant (Unique)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 411-23-296/ISI"
                    value={stdCardNumber}
                    onChange={(e) => setStdCardNumber(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>E-mail Institutionnel</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="nom.prenom@isidk.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={studentId ? "Laisser vide si inchangé" : "Généré automatiquement"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!studentId}
                    />
                  </div>
                </div>

                {/* 3. Gender & Birth */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Genre / Sexe</label>
                    <select className="form-control" value={sexe} onChange={(e) => setSexe(e.target.value)}>
                      <option value="Masculin">Masculin</option>
                      <option value="Féminin">Féminin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Grade Académique</label>
                    <select className="form-control" value={grade} onChange={(e) => setGrade(e.target.value)}>
                      <option value="Licence">Licence (Nos Licences)</option>
                      <option value="Master">Master (Nos Masters)</option>
                      <option value="Ingénieur">Cycle Ingénieur</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Date de Naissance</label>
                    <input
                      type="date"
                      className="form-control"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Lieu de Naissance</label>
                    <input
                      type="text"
                      className="form-control"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 4. Domain & Mention */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Domaine d'Études</label>
                    <input
                      type="text"
                      className="form-control"
                      value={domaine}
                      onChange={(e) => setDomaine(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mention</label>
                    <input
                      type="text"
                      className="form-control"
                      value={mention}
                      onChange={(e) => setMention(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 5. Department & Dynamic Specialty */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Département</label>
                    <select className="form-control" value={deptId} onChange={(e) => handleDeptChange(e.target.value)}>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Filière / Spécialité</label>
                    <select className="form-control" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                      {departments.find(d => d.id === deptId)?.filières?.map(f => (
                        <option key={f} value={f}>{f}</option>
                      )) || <option value="">Aucune filière disponible</option>}
                    </select>
                  </div>
                </div>

                {/* 6. Cohort & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Promotion / Cohorte</label>
                    <select className="form-control" value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
                      {cohorts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut Compte</label>
                    <select className="form-control" value={stdStatus} onChange={(e) => setStdStatus(e.target.value)}>
                      <option value="active">Actif</option>
                      <option value="graduated">Diplômé</option>
                    </select>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowStudentModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Department Modal */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingDept ? 'Modifier Département' : 'Créer Département'}</h3>
              <button onClick={() => setShowDeptModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveDeptSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom du Département</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Département Génie-Informatique"
                    value={deptFormName}
                    onChange={(e) => setDeptFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Code du Département (Court)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: GI"
                    value={deptFormCode}
                    onChange={(e) => setDeptFormCode(e.target.value)}
                    maxLength={10}
                    required
                  />
                </div>

                {/* Filières Manager inside Department Form */}
                <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <label style={{ fontWeight: '700' }}>Gestion des Filières / Subdivisions</label>
                  
                  {/* Inline list of current filières */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
                    {deptFormFilières.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Aucune filière ajoutée pour le moment.</span>
                    ) : (
                      deptFormFilières.map((fil, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            backgroundColor: '#f8fafc', 
                            padding: '6px 12px', 
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.82rem'
                          }}
                        >
                          <span style={{ fontWeight: '500' }}>{fil}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFilièreFromForm(idx)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--status-rejected)', 
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              lineHeight: '1',
                              padding: '2px 6px'
                            }}
                            title="Supprimer la filière"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Filière input row */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ajouter une filière (Ex: Génie Logiciel)"
                      value={newFilièreName}
                      onChange={(e) => setNewFilièreName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFilièreToForm();
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddFilièreToForm} 
                      className="btn btn-secondary"
                      style={{ padding: '0 16px', height: '42px' }}
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowDeptModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Cohort Modal */}
      {showCohortModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCohort ? 'Modifier Cohorte' : 'Créer Cohorte'}</h3>
              <button onClick={() => setShowCohortModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveCohortSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Libellé de la Cohorte / Promotion</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Année académique 2024-2025"
                    value={cohortFormName}
                    onChange={(e) => setCohortFormName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCohortModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit User Account Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Modifier l\'Utilisateur' : 'Créer un Utilisateur'}</h3>
              <button onClick={() => setShowUserModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveUserSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom Complet</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Prof. Amadou Sow"
                    value={userFormName}
                    onChange={(e) => setUserFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-mail de connexion</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Ex: prof@isidk.com"
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={editingUser ? "Laisser vide pour ne pas modifier" : "Généré automatiquement"}
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    disabled={!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>Rôle et Accès</label>
                  <select 
                    className="form-control" 
                    value={userFormRole} 
                    onChange={(e) => setUserFormRole(e.target.value)}
                    disabled={editingUser?.role === 'etudiant'}
                  >
                    <option value="prof">Professeur</option>
                    <option value="agent">Secrétaire / Agent Administratif</option>
                    <option value="admin">Administrateur</option>
                    {editingUser?.role === 'etudiant' && <option value="etudiant">Étudiant (Géré dans Fiche Étudiant)</option>}
                  </select>
                  {editingUser?.role === 'etudiant' && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                      Les comptes étudiants doivent être administrés via l'onglet « Gestion Étudiants ».
                    </span>
                  )}
                </div>

                {userFormRole === 'prof' && (
                  <div style={{
                    marginTop: '20px',
                    borderTop: '1px dashed #e2e8f0',
                    paddingTop: '16px'
                  }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0e294b', marginBottom: '12px' }}>
                      Matières & Classes Habilitées
                    </h4>

                    {/* List of current assignments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {userFormMatieres.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-light)', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #edf2f7' }}>
                          Aucune matière/filière assignée pour ce professeur.
                        </div>
                      ) : (
                        userFormMatieres.map((m, idx) => (
                          <div 
                            key={idx} 
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.8rem'
                            }}
                          >
                            <div>
                              <strong style={{ color: '#0e294b' }}>{m.subject}</strong>
                              <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                                ({m.specialty})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUserFormMatieres(userFormMatieres.filter((_, i) => i !== idx));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--status-rejected)',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                padding: '2px 6px'
                              }}
                              title="Retirer cette habilitation"
                            >
                              &times;
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Assignment Controls */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        Ajouter une habilitation
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nom de la matière (Ex: Java, Algo)"
                          value={newMatiereSubject}
                          onChange={(e) => setNewMatiereSubject(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            className="form-control"
                            value={newMatiereSpecialty}
                            onChange={(e) => setNewMatiereSpecialty(e.target.value)}
                            style={{ flex: 1 }}
                          >
                            <option value="">-- Choisir la Filière --</option>
                            {departments.flatMap(d => d.filières || []).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              if (!newMatiereSubject.trim() || !newMatiereSpecialty) {
                                addToast('Veuillez saisir le nom de la matière et sélectionner sa filière.', 'error');
                                return;
                              }
                              if (userFormMatieres.some(m => m.subject.toLowerCase() === newMatiereSubject.trim().toLowerCase() && m.specialty === newMatiereSpecialty)) {
                                addToast('Ce professeur est déjà habilité pour cette matière dans cette filière.', 'error');
                                return;
                              }
                              setUserFormMatieres([
                                ...userFormMatieres,
                                { subject: newMatiereSubject.trim(), specialty: newMatiereSpecialty }
                              ]);
                              setNewMatiereSubject('');
                            }}
                            style={{ padding: '0 16px', height: '38px', fontSize: '0.8rem' }}
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Created Credentials Modal */}
      {createdCredentials && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', border: '2px solid #0e294b' }}>
            <div className="modal-header" style={{ backgroundColor: '#0e294b', color: '#fff', margin: '-20px -20px 20px -20px', padding: '15px 20px', borderRadius: '8px 8px 0 0' }}>
              <h3 className="modal-title" style={{ color: '#fff' }}>Compte Créé Avec Succès</h3>
            </div>
            <div className="modal-body">
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                  Un nouveau compte a été configuré pour <strong>{createdCredentials.name}</strong> ({createdCredentials.role === 'etudiant' ? 'Étudiant' : createdCredentials.role === 'prof' ? 'Professeur' : createdCredentials.role === 'agent' ? 'Secrétaire' : 'Admin'}).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Identifiant / Email</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0e294b' }}>{createdCredentials.email}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Mot de passe temporaire</span>
                    <strong style={{ fontSize: '1.1rem', color: '#2563eb', fontFamily: 'monospace', letterSpacing: '1px' }}>{createdCredentials.password}</strong>
                  </div>
                </div>
              </div>
              
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                backgroundColor: '#eff6ff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px', flexShrink: 0, color: '#2563eb' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>
                  <strong>Important :</strong> Copiez ces informations maintenant. Pour des raisons de sécurité, ce mot de passe ne sera plus jamais affiché. L'utilisateur devra le modifier à sa première connexion.
                </span>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nMot de passe: ${createdCredentials.password}`);
                  addToast('Identifiants copiés dans le presse-papiers !', 'success');
                }} 
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Copier les identifiants
              </button>
              <button 
                type="button" 
                onClick={() => setCreatedCredentials(null)} 
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Bulk Import Modal */}
      {showImportStudentsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Importation de Fiches Étudiants (CSV)</h3>
              <button 
                onClick={() => { setShowImportStudentsModal(false); setImportLog(''); }} 
                className="modal-close"
                disabled={importing}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Importez un fichier CSV contenant la liste des fiches étudiants à inscrire. L'adresse e-mail institutionnelle (sous la forme <code>prenom.nom@isidk.sn</code>) et le mot de passe par défaut (<code>passer123@</code>) seront <strong>générés automatiquement</strong> par le système.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={downloadStudentTemplate} 
                  className="btn btn-secondary btn-sm"
                  type="button"
                >
                  📥 Télécharger le modèle (CSV)
                </button>
              </div>

              <div className="form-group">
                <label>Sélectionner le fichier CSV</label>
                <input 
                  type="file" 
                  accept=".csv,text/csv" 
                  className="form-control"
                  disabled={importing}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportStudents(file);
                    }
                  }}
                />
              </div>

              {importLog && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Rapport d'analyse et importation :</label>
                  <textarea
                    className="form-control"
                    style={{ 
                      height: '220px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.78rem', 
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      lineHeight: '1.4'
                    }}
                    readOnly
                    value={importLog}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => { setShowImportStudentsModal(false); setImportLog(''); }} 
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={importing}
              >
                {importing ? 'Importation en cours...' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Accounts Bulk Import Modal */}
      {showImportUsersModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Importation de Comptes Utilisateurs (CSV)</h3>
              <button 
                onClick={() => { setShowImportUsersModal(false); setImportLog(''); }} 
                className="modal-close"
                disabled={importing}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Importez un fichier CSV contenant la liste des professeurs ou agents de scolarité à inscrire. Le mot de passe par défaut sera configuré à <code>passer123@</code>.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={downloadUserTemplate} 
                  className="btn btn-secondary btn-sm"
                  type="button"
                >
                  📥 Télécharger le modèle (CSV)
                </button>
              </div>

              <div className="form-group">
                <label>Sélectionner le fichier CSV</label>
                <input 
                  type="file" 
                  accept=".csv,text/csv" 
                  className="form-control"
                  disabled={importing}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportUsers(file);
                    }
                  }}
                />
              </div>

              {importLog && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Rapport d'analyse et importation :</label>
                  <textarea
                    className="form-control"
                    style={{ 
                      height: '220px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.78rem', 
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      lineHeight: '1.4'
                    }}
                    readOnly
                    value={importLog}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => { setShowImportUsersModal(false); setImportLog(''); }} 
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={importing}
              >
                {importing ? 'Importation en cours...' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline CSS styles
const quickStatsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '10px',
};

const quickStatsItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '8px',
  fontSize: '0.85rem',
};

const actionBtnStyles = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 10px',
  fontSize: '0.9rem',
  transition: 'var(--transition)',
  outline: 'none',
};
