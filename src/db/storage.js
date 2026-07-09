// Local Database Simulator for ISI-Docs using LocalStorage

const STORAGE_KEYS = {
  USERS: 'isidocs_users',
  STUDENTS: 'isidocs_students',
  DEPARTMENTS: 'isidocs_departments',
  COHORTS: 'isidocs_cohorts',
  REQUESTS: 'isidocs_requests',
  GRADES: 'isidocs_grades',
  AUDIT_LOGS: 'isidocs_audit_logs'
};

// Initial Mock Data
// Initial Mock Data
const MOCK_DEPARTMENTS = [
  {
    id: 'dept-gi',
    name: 'Département Génie-Informatique',
    code: 'GI',
    filières: [
      'Génie Logiciel',
      'Informatique de Gestion',
      'Infographie et Multimédia',
      'Géomatique et Développement d\'Applications',
      'Marketing et Communication Digitale'
    ]
  },
  {
    id: 'dept-rs',
    name: 'Département Réseaux & Systèmes',
    code: 'RS',
    filières: [
      'Réseaux Informatiques',
      'Réseaux Télécoms',
      'Cybersécurité',
      'Systèmes embarqués et IOT'
    ]
  },
  {
    id: 'dept-iaid',
    name: 'Département Intelligence Artificielle et Ingénierie de données',
    code: 'IA-ID',
    filières: [
      'Bachelor en Data Science & Big Data'
    ]
  },
  {
    id: 'dept-gestion',
    name: 'Département Gestion',
    code: 'GESTION',
    filières: [
      'Licence en Gestion des Entreprises',
      'Licence en Comptabilité & Finance',
      'Master en Management de Projet'
    ]
  }
];

const MOCK_COHORTS = [
  { id: 'coh-2024', name: 'Année académique 2024-2025' },
  { id: 'coh-2025', name: 'Année académique 2025-2026' }
];

const MOCK_USERS = [
  {
    id: 'usr-admin-1',
    nom: 'Diallo',
    prenom: 'Papa',
    email: 'admin@groupeisi.sn',
    motDePasse: '201bce2458f00a54130c695ca8d1658319b32206d495adf175847b57bd4a4151', // Admin123@
    role: 'admin',
    isRootAdmin: true,
    dateCreation: 1719528000000,
    doitChangerMotDePasse: false,
    actif: true,
    name: 'Prof. Papa Diallo'
  },
  {
    id: 'usr-prof-1',
    nom: 'Sow',
    prenom: 'Amadou',
    email: 'prof@groupeisi.sn',
    motDePasse: '1a9a3696808cd965b1584e370d5a5ca78a2016231ca4e4542f165061d3caa360', // passer123@
    role: 'prof',
    matieres: [
      { subject: 'Java avancé', specialty: 'Génie Logiciel' },
      { subject: 'C Sharp', specialty: 'Génie Logiciel' }
    ],
    dateCreation: 1719528000000,
    doitChangerMotDePasse: true,
    actif: true,
    name: 'Prof. Amadou Sow'
  },
  {
    id: 'usr-prof-2',
    nom: 'Gaye',
    prenom: 'Ablaye',
    email: 'ablaye.gaye@groupeisi.sn',
    motDePasse: '1a9a3696808cd965b1584e370d5a5ca78a2016231ca4e4542f165061d3caa360', // passer123@
    role: 'prof',
    matieres: [
      { subject: 'Algorithme', specialty: 'Génie Logiciel' },
      { subject: 'Java', specialty: 'Informatique de Gestion' }
    ],
    dateCreation: 1719528000000,
    doitChangerMotDePasse: true,
    actif: true,
    name: 'Prof. Ablaye Gaye'
  },
  {
    id: 'usr-staff-1',
    nom: 'GASSAMA',
    prenom: 'Aissatou Diaby',
    email: 'agent@groupeisi.sn',
    motDePasse: '1a9a3696808cd965b1584e370d5a5ca78a2016231ca4e4542f165061d3caa360', // passer123@
    role: 'agent',
    dateCreation: 1719528000000,
    doitChangerMotDePasse: true,
    actif: true,
    name: 'Aissatou Diaby GASSAMA'
  },
  {
    id: 'usr-student-1',
    nom: 'COULIBALY',
    prenom: 'Yaya',
    email: 'etudiant@isidk.sn',
    motDePasse: '1a9a3696808cd965b1584e370d5a5ca78a2016231ca4e4542f165061d3caa360', // passer123@
    role: 'etudiant',
    filiere: 'Génie Logiciel',
    niveau: 'L3',
    dateCreation: 1719528000000,
    doitChangerMotDePasse: true,
    actif: true,
    name: 'Yaya COULIBALY'
  }
];

const MOCK_STUDENTS = [
  {
    id: 'std-1',
    userId: 'usr-student-1',
    studentId: '411-23-296/ISI',
    firstName: 'Yaya',
    lastName: 'COULIBALY',
    email: 'etudiant@isidk.sn',
    departmentId: 'dept-gi',
    cohortId: 'coh-2024',
    status: 'active',
    sexe: 'Masculin',
    birthDate: '12/10/1998',
    birthPlace: 'Golmy',
    domaine: 'Sciences et Technologies',
    mention: 'Informatique',
    specialty: 'Génie Logiciel',
    grade: 'Licence'
  }
];

const MOCK_GRADES = [
  // UE 1: DAP1501 Développement d'Applications
  { id: 'g1', studentId: 'std-1', ueCode: 'DAP1501', ueName: 'Développement d\'Applications', ueCredit: 8, subject: 'Java avancé', mcc: 15.00, exam: 15.00, score: 15.00, coefficient: 3, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g2', studentId: 'std-1', ueCode: 'DAP1501', ueName: 'Développement d\'Applications', ueCredit: 8, subject: 'C Sharp', mcc: 15.00, exam: 15.00, score: 15.00, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g3', studentId: 'std-1', ueCode: 'DAP1501', ueName: 'Développement d\'Applications', ueCredit: 8, subject: 'Design et Ergonomie des IHM', mcc: 18.00, exam: 18.00, score: 18.00, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  
  // UE 2: OGC1504 Outils de Gestion et de controle
  { id: 'g4', studentId: 'std-1', ueCode: 'OGC1504', ueName: 'Outils de Gestion et de controle', ueCredit: 6, subject: 'Management stratégique', mcc: 12.00, exam: 12.00, score: 12.00, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g5', studentId: 'std-1', ueCode: 'OGC1504', ueName: 'Outils de Gestion et de controle', ueCredit: 6, subject: 'Base de la sécurité des SI', mcc: 19.50, exam: 19.50, score: 19.50, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g6', studentId: 'std-1', ueCode: 'OGC1504', ueName: 'Outils de Gestion et de controle', ueCredit: 6, subject: 'Entreprenariat et Gestion de projet', mcc: 16.00, exam: 17.00, score: 16.60, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },

  // UE 3: OGF1505 Professionalisation
  { id: 'g7', studentId: 'std-1', ueCode: 'OGF1505', ueName: 'Professionalisation', ueCredit: 4, subject: 'Contrôle de gestion', mcc: 14.00, exam: 13.50, score: 13.70, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g8', studentId: 'std-1', ueCode: 'OGF1505', ueName: 'Professionalisation', ueCredit: 4, subject: 'Analyse Financière', mcc: 14.00, exam: 13.50, score: 13.70, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },

  // UE 4: RSY1502 Reseaux et systemes informatiques
  { id: 'g9', studentId: 'std-1', ueCode: 'RSY1502', ueName: 'Reseaux et systemes informatiques', ueCredit: 4, subject: 'Devops', mcc: 14.00, exam: 14.50, score: 14.30, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g10', studentId: 'std-1', ueCode: 'RSY1502', ueName: 'Reseaux et systemes informatiques', ueCredit: 4, subject: 'Services Cloud', mcc: 14.00, exam: 15.00, score: 14.60, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },

  // UE 5: SIBD1503 Système d'information et base de données
  { id: 'g11', studentId: 'std-1', ueCode: 'SIBD1503', ueName: 'Système d\'information et base de données', ueCredit: 8, subject: 'Big data et Analyse de données', mcc: 17.00, exam: 17.00, score: 17.00, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g12', studentId: 'std-1', ueCode: 'SIBD1503', ueName: 'Système d\'information et base de données', ueCredit: 8, subject: 'Développement Back end', mcc: 14.00, exam: 16.00, score: 15.20, coefficient: 2, semester: 'S5', dateEntered: '2025-02-15' },
  { id: 'g13', studentId: 'std-1', ueCode: 'SIBD1503', ueName: 'Système d\'information et base de données', ueCredit: 8, subject: 'Administration de base de données 1', mcc: 16.50, exam: 12.00, score: 13.80, coefficient: 3, semester: 'S5', dateEntered: '2025-02-15' }
];

const MOCK_REQUESTS = [
  {
    id: 'req-1',
    studentId: 'std-1',
    documentType: 'report_card',
    reason: 'Bulletin Officiel du Semestre 5',
    notes: 'Requis pour dossier Campus France.',
    status: 'delivered',
    createdAt: '2026-06-15T09:30:00Z',
    history: [
      { status: 'submitted', updatedBy: 'usr-student-1', name: 'Yaya COULIBALY', role: 'etudiant', timestamp: '2026-06-15T09:30:00Z', remarks: 'Demande soumise' },
      { status: 'in_progress', updatedBy: 'usr-staff-1', name: 'Aissatou Diaby GASSAMA', role: 'agent', timestamp: '2026-06-15T14:20:00Z', remarks: 'Validation des notes saisies' },
      { status: 'approved', updatedBy: 'usr-staff-1', name: 'Aissatou Diaby GASSAMA', role: 'agent', timestamp: '2026-06-16T10:00:00Z', remarks: 'Bulletin validé et signé électroniquement' },
      { status: 'delivered', updatedBy: 'usr-staff-1', name: 'Aissatou Diaby GASSAMA', role: 'agent', timestamp: '2026-06-16T11:15:00Z', remarks: 'Remis en main propre' }
    ]
  },
  {
    id: 'req-2',
    studentId: 'std-1',
    documentType: 'enrollment_certificate',
    reason: 'Inscription administrative.',
    notes: 'Attestation scolarité en cours.',
    status: 'approved',
    createdAt: '2026-06-22T08:45:00Z',
    history: [
      { status: 'submitted', updatedBy: 'usr-student-1', name: 'Yaya COULIBALY', role: 'etudiant', timestamp: '2026-06-22T08:45:00Z', remarks: 'Demande soumise' },
      { status: 'approved', updatedBy: 'usr-staff-1', name: 'Aissatou Diaby GASSAMA', role: 'agent', timestamp: '2026-06-23T09:30:00Z', remarks: 'Attestation prête' }
    ]
  }
];

const MOCK_AUDIT = [
  { id: 'aud-1', userId: 'usr-student-1', name: 'Yaya COULIBALY', role: 'etudiant', action: 'CREATE_REQUEST', details: 'Création d\'une demande de bulletin (req-1)', timestamp: '2026-06-15T09:30:00Z' },
  { id: 'aud-2', userId: 'usr-staff-1', name: 'Aissatou Diaby GASSAMA', role: 'agent', action: 'PROCESS_REQUEST', details: 'Traitement en cours req-1', timestamp: '2026-06-15T14:20:00Z' }
];

// Helper functions for reading/writing data
const loadData = (key, defaultData) => {
  let data = localStorage.getItem(key);
  // Migration checks: clear out data if it has old departments, old profiles or old credentials
  if (data && (
    data.includes('@isi.utm.tn') || 
    data.includes('dept-gl') || 
    data.includes('Youssef Trabelsi') || 
    data.includes('Tunisienne') ||
    data.includes('student@isidk.com') ||
    data.includes('@antygravity.com') ||
    (key === STORAGE_KEYS.USERS && !data.includes('1a9a3696808cd965b1584e370d5a5ca78a2016231ca4e4542f165061d3caa360'))
  )) {
    localStorage.removeItem(key);
    data = null;
  }
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
};

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Database Initialization
export const initDb = () => {
  const DB_VERSION = 'v1.0.6';
  if (localStorage.getItem('isidocs_db_version') !== DB_VERSION) {
    Object.values(STORAGE_KEYS).forEach(k => {
      localStorage.removeItem(k);
    });
    localStorage.setItem('isidocs_db_version', DB_VERSION);
  }

  loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  loadData(STORAGE_KEYS.DEPARTMENTS, MOCK_DEPARTMENTS);
  loadData(STORAGE_KEYS.COHORTS, MOCK_COHORTS);
  loadData(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS);
  loadData(STORAGE_KEYS.GRADES, MOCK_GRADES);
  loadData(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT);
};

// Core Database Access Methods

// Auth API
export const authenticateUser = async (email, password) => {
  const { hasherMotDePasse } = await import('../utils/security');
  const hashed = await hasherMotDePasse(password);
  
  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.motDePasse === hashed);
  if (!user) return null;

  // Log action
  logAuditAction(user.id, user.name || `${user.prenom} ${user.nom}`, user.role, 'LOGIN', 'Connexion réussie');
  
  if (user.role === 'etudiant') {
    const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
    const studentInfo = students.find(s => s.userId === user.id);
    return { ...user, studentInfo };
  }
  
  return user;
};

// Audit trail logger
export const logAuditAction = (userId, name, role, action, details) => {
  const logs = loadData(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT);
  const newLog = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    name,
    role,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  saveData(STORAGE_KEYS.AUDIT_LOGS, logs);
};

export const getAuditLogs = () => {
  return loadData(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT);
};

// Departments API
export const getDepartments = () => loadData(STORAGE_KEYS.DEPARTMENTS, MOCK_DEPARTMENTS);
export const saveDepartments = (depts) => saveData(STORAGE_KEYS.DEPARTMENTS, depts);

// Cohorts API
export const getCohorts = () => loadData(STORAGE_KEYS.COHORTS, MOCK_COHORTS);
export const saveCohorts = (cohorts) => saveData(STORAGE_KEYS.COHORTS, cohorts);

// Students API
export const getStudents = () => {
  const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  const departments = getDepartments();
  const cohorts = getCohorts();
  
  return students.map(s => ({
    ...s,
    departmentName: departments.find(d => d.id === s.departmentId)?.name || 'Inconnu',
    cohortName: cohorts.find(c => c.id === s.cohortId)?.name || 'Inconnu'
  }));
};

export const getStudentById = (id) => {
  const students = getStudents();
  return students.find(s => s.id === id);
};

export const saveStudent = async (studentData, adminUser) => {
  const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  
  if (studentData.id) {
    const idx = students.findIndex(s => s.id === studentData.id);
    if (idx !== -1) {
      const oldStudent = students[idx];
      students[idx] = { ...oldStudent, ...studentData };
      saveData(STORAGE_KEYS.STUDENTS, students);
      
      const userIdx = users.findIndex(u => u.id === oldStudent.userId);
      if (userIdx !== -1) {
        users[userIdx].name = `${studentData.firstName} ${studentData.lastName}`;
        users[userIdx].prenom = studentData.firstName;
        users[userIdx].nom = studentData.lastName;
        users[userIdx].email = studentData.email;
        if (studentData.password) {
          const { hasherMotDePasse } = await import('../utils/security');
          users[userIdx].motDePasse = await hasherMotDePasse(studentData.password);
          users[userIdx].doitChangerMotDePasse = true;
        }
        saveData(STORAGE_KEYS.USERS, users);
      }
      
      logAuditAction(
        adminUser.id,
        adminUser.name,
        adminUser.role,
        'UPDATE_STUDENT',
        `Mise à jour de l'étudiant ${studentData.firstName} ${studentData.lastName} (${studentData.studentId})`
      );
    }
  } else {
    const userId = `usr-std-${Date.now()}`;
    const studentId = `std-${Date.now()}`;
    
    const { hasherMotDePasse } = await import('../utils/security');
    const tempPassword = studentData.password || 'passer123@';
    const hashedPass = await hasherMotDePasse(tempPassword);

    const newUser = {
      id: userId,
      email: studentData.email,
      motDePasse: hashedPass,
      role: 'etudiant',
      nom: studentData.lastName,
      prenom: studentData.firstName,
      name: `${studentData.firstName} ${studentData.lastName}`,
      dateCreation: Date.now(),
      doitChangerMotDePasse: true,
      actif: true
    };
    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    
    const newStudent = {
      id: studentId,
      userId,
      studentId: studentData.studentId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      departmentId: studentData.departmentId,
      cohortId: studentData.cohortId,
      status: studentData.status || 'active',
      sexe: studentData.sexe || 'Masculin',
      birthDate: studentData.birthDate || '2000-01-01',
      birthPlace: studentData.birthPlace || 'Dakar',
      domaine: studentData.domaine || 'Sciences et Technologies',
      mention: studentData.mention || 'Informatique',
      specialty: studentData.specialty || 'Génie Logiciel',
      grade: studentData.grade || 'Licence'
    };
    students.push(newStudent);
    saveData(STORAGE_KEYS.STUDENTS, students);
    
    logAuditAction(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'CREATE_STUDENT',
      `Création de l'étudiant ${studentData.firstName} ${studentData.lastName} (${studentData.studentId})`
    );
  }
};

export const deleteStudent = (id, adminUser) => {
  const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  const student = students.find(s => s.id === id);
  if (!student) return;
  
  const filteredStudents = students.filter(s => s.id !== id);
  saveData(STORAGE_KEYS.STUDENTS, filteredStudents);
  
  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  const filteredUsers = users.filter(u => u.id !== student.userId);
  saveData(STORAGE_KEYS.USERS, filteredUsers);
  
  logAuditAction(
    adminUser.id,
    adminUser.name,
    adminUser.role,
    'DELETE_STUDENT',
    `Suppression de l'étudiant ${student.firstName} ${student.lastName} (${student.studentId})`
  );
};

// Requests API
export const getRequests = () => {
  const requests = loadData(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS);
  const students = getStudents();
  
  return requests.map(r => {
    const student = students.find(s => s.id === r.studentId);
    return {
      ...r,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Inconnu',
      studentCode: student ? student.studentId : 'N/A',
      departmentCode: student ? student.departmentCode : 'N/A',
      departmentName: student ? student.departmentName : 'N/A',
      cohortName: student ? student.cohortName : 'N/A'
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const submitRequest = (studentId, documentType, reason, notes, studentUser, justificatif) => {
  const requests = loadData(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS);
  const newRequest = {
    id: `req-${Date.now()}`,
    studentId,
    documentType,
    reason,
    notes,
    justificatif: justificatif || null,
    status: 'submitted',
    createdAt: new Date().toISOString(),
    history: [
      {
        status: 'submitted',
        updatedBy: studentUser.id,
        name: studentUser.name,
        role: 'etudiant',
        timestamp: new Date().toISOString(),
        remarks: 'Demande soumise en ligne.'
      }
    ]
  };
  requests.push(newRequest);
  saveData(STORAGE_KEYS.REQUESTS, requests);
  
  logAuditAction(
    studentUser.id,
    studentUser.name,
    studentUser.role,
    'CREATE_REQUEST',
    `Soumission d'une demande de document (${documentType})`
  );
  
  return newRequest;
};

export const updateRequestStatus = (requestId, status, remarks, staffUser) => {
  const requests = loadData(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS);
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx === -1) return null;
  
  const request = requests[idx];
  request.status = status;
  
  const historyEntry = {
    status,
    updatedBy: staffUser.id,
    name: staffUser.name,
    role: staffUser.role,
    timestamp: new Date().toISOString(),
    remarks: remarks || `Passage de la demande au statut : ${status}`
  };
  
  request.history.push(historyEntry);
  saveData(STORAGE_KEYS.REQUESTS, requests);
  
  logAuditAction(
    staffUser.id,
    staffUser.name,
    staffUser.role,
    'UPDATE_REQUEST_STATUS',
    `Mise à jour du statut de la demande ${requestId} à "${status}"`
  );
  
  return request;
};

// Grades API
export const getGradesByStudent = (studentId) => {
  const grades = loadData(STORAGE_KEYS.GRADES, MOCK_GRADES);
  return grades.filter(g => g.studentId === studentId);
};

export const addOrUpdateGrade = (gradeData, staffUser) => {
  const grades = loadData(STORAGE_KEYS.GRADES, MOCK_GRADES);
  const students = getStudents();
  const student = students.find(s => s.id === gradeData.studentId);
  
  const calculatedScore = parseFloat(gradeData.mcc) * 0.4 + parseFloat(gradeData.exam) * 0.6;

  if (gradeData.id) {
    const idx = grades.findIndex(g => g.id === gradeData.id);
    if (idx !== -1) {
      grades[idx] = {
        ...grades[idx],
        ueCode: gradeData.ueCode || 'UE0001',
        ueName: gradeData.ueName || 'Matières Générales',
        ueCredit: parseInt(gradeData.ueCredit) || 4,
        subject: gradeData.subject,
        mcc: parseFloat(gradeData.mcc),
        exam: parseFloat(gradeData.exam),
        score: parseFloat(calculatedScore.toFixed(2)),
        coefficient: parseInt(gradeData.coefficient),
        semester: gradeData.semester,
        dateEntered: new Date().toISOString().split('T')[0]
      };
      saveData(STORAGE_KEYS.GRADES, grades);
      
      logAuditAction(
        staffUser.id,
        staffUser.name,
        staffUser.role,
        'UPDATE_GRADE',
        `Modification de note pour ${student?.firstName} ${student?.lastName} : ${gradeData.subject}`
      );
    }
  } else {
    const newGrade = {
      id: `grd-${Date.now()}`,
      studentId: gradeData.studentId,
      ueCode: gradeData.ueCode || 'UE0001',
      ueName: gradeData.ueName || 'Matières Générales',
      ueCredit: parseInt(gradeData.ueCredit) || 4,
      subject: gradeData.subject,
      mcc: parseFloat(gradeData.mcc),
      exam: parseFloat(gradeData.exam),
      score: parseFloat(calculatedScore.toFixed(2)),
      coefficient: parseInt(gradeData.coefficient),
      semester: gradeData.semester,
      dateEntered: new Date().toISOString().split('T')[0]
    };
    grades.push(newGrade);
    saveData(STORAGE_KEYS.GRADES, grades);
    
    logAuditAction(
      staffUser.id,
      staffUser.name,
      staffUser.role,
      'CREATE_GRADE',
      `Saisie note pour ${student?.firstName} ${student?.lastName} : ${gradeData.subject} (Score: ${calculatedScore.toFixed(2)}/20)`
    );
  }
};

export const deleteGrade = (gradeId, staffUser) => {
  const grades = loadData(STORAGE_KEYS.GRADES, MOCK_GRADES);
  const grade = grades.find(g => g.id === gradeId);
  if (!grade) return;
  
  const filtered = grades.filter(g => g.id !== gradeId);
  saveData(STORAGE_KEYS.GRADES, filtered);
  
  const student = getStudentById(grade.studentId);
  logAuditAction(
    staffUser.id,
    staffUser.name,
    staffUser.role,
    'DELETE_GRADE',
    `Suppression note de ${grade.subject} pour l'étudiant ${student?.firstName} ${student?.lastName}`
  );
};

// Senegalese UE-based dynamic average calculations
export const calculateAcademicSummary = (studentId) => {
  const grades = getGradesByStudent(studentId);
  
  if (grades.length === 0) {
    return {
      ueList: [],
      annualAverage: 0,
      annualValidated: false,
      annualHonors: 'Aucun',
      totalCredits: 0
    };
  }

  // Group by UE code
  const uesMap = {};
  grades.forEach(g => {
    if (!uesMap[g.ueCode]) {
      uesMap[g.ueCode] = {
        code: g.ueCode,
        name: g.ueName,
        credit: g.ueCredit,
        grades: [],
        coefSum: 0,
        weightedSum: 0
      };
    }
    uesMap[g.ueCode].grades.push(g);
    uesMap[g.ueCode].coefSum += g.coefficient;
    uesMap[g.ueCode].weightedSum += (g.score * g.coefficient);
  });

  const ueList = Object.values(uesMap).map(ue => {
    const average = parseFloat((ue.weightedSum / ue.coefSum).toFixed(2));
    const validated = average >= 10.0;
    
    return {
      ...ue,
      average,
      validated,
      creditsObtained: validated ? ue.credit : 0
    };
  });

  // Calculate global average
  let totalUeAverageSum = 0;
  let totalCreditsObtained = 0;
  let totalMaxCredits = 0;
  
  ueList.forEach(ue => {
    totalUeAverageSum += ue.average;
    totalCreditsObtained += ue.creditsObtained;
    totalMaxCredits += ue.credit;
  });

  const annualAverage = parseFloat((totalUeAverageSum / ueList.length).toFixed(2));
  const annualValidated = annualAverage >= 10.0;
  
  let annualHonors = 'Passable';
  if (annualAverage >= 16.0) annualHonors = 'Très Bien';
  else if (annualAverage >= 14.0) annualHonors = 'Bien';
  else if (annualAverage >= 12.0) annualHonors = 'Assez Bien';
  else if (annualAverage < 10.0) annualHonors = 'Refusé';

  return {
    ueList,
    annualAverage,
    annualValidated,
    annualHonors,
    totalCredits: totalCreditsObtained,
    maxCredits: totalMaxCredits
  };
};

// System Analytics
export const getSystemAnalytics = () => {
  const requests = loadData(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS);
  const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  
  const totalRequests = requests.length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const deliveredCount = requests.filter(r => r.status === 'delivered').length;
  const pendingCount = requests.filter(r => r.status === 'submitted').length;
  
  const avgProcessingTime = '3.5 heures';
  
  const docCounts = {
    enrollment_certificate: requests.filter(r => r.documentType === 'enrollment_certificate').length,
    transcript: requests.filter(r => r.documentType === 'transcript').length,
    internship_certificate: requests.filter(r => r.documentType === 'internship_certificate').length,
    report_card: requests.filter(r => r.documentType === 'report_card').length
  };
  
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  
  return {
    totalRequests,
    inProgressCount,
    approvedCount,
    rejectedCount,
    deliveredCount,
    pendingCount,
    avgProcessingTime,
    docCounts,
    activeStudentsCount
  };
};

// Update User Password API
export const updateUserPassword = async (userId, oldPassword, newPassword) => {
  const { hasherMotDePasse } = await import('../utils/security');
  const hashedOld = await hasherMotDePasse(oldPassword);
  const hashedNew = await hasherMotDePasse(newPassword);

  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return { success: false, message: "Utilisateur non trouvé." };
  }
  
  if (users[idx].motDePasse !== hashedOld) {
    return { success: false, message: "Le mot de passe actuel est incorrect." };
  }
  
  users[idx].motDePasse = hashedNew;
  users[idx].doitChangerMotDePasse = false; // Le mot de passe a été réinitialisé
  saveData(STORAGE_KEYS.USERS, users);
  
  logAuditAction(
    userId,
    users[idx].name || `${users[idx].prenom} ${users[idx].nom}`,
    users[idx].role,
    'CHANGE_PASSWORD',
    "Modification du mot de passe de l'utilisateur"
  );
  
  return { success: true, message: "Votre mot de passe a été modifié avec succès." };
};

export const getUsers = () => {
  return loadData(STORAGE_KEYS.USERS, MOCK_USERS);
};

export const getUserById = (id) => {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  if (user.role === 'etudiant') {
    const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
    const studentInfo = students.find(s => s.userId === user.id);
    return { ...user, studentInfo };
  }
  return user;
};

export const saveUser = async (userData, adminUser) => {
  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  
  if (userData.id) {
    const idx = users.findIndex(u => u.id === userData.id);
    if (idx !== -1) {
      const nameParts = userData.name.trim().split(/\s+/);
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';
      
      const isRootAdmin = users[idx].isRootAdmin || false;
      const roleToSave = isRootAdmin ? 'admin' : userData.role;

      users[idx] = {
        ...users[idx],
        name: userData.name,
        prenom,
        nom,
        email: userData.email,
        role: roleToSave,
        matieres: userData.role === 'prof' ? (userData.matieres || []) : undefined,
        filiere: userData.role === 'etudiant' ? (userData.filiere || '') : undefined,
        niveau: userData.role === 'etudiant' ? (userData.niveau || '') : undefined
      };

      if (userData.password) {
        const { hasherMotDePasse } = await import('../utils/security');
        users[idx].motDePasse = await hasherMotDePasse(userData.password);
        users[idx].doitChangerMotDePasse = true;
      }
      saveData(STORAGE_KEYS.USERS, users);
      
      logAuditAction(
        adminUser.id,
        adminUser.name,
        adminUser.role,
        'UPDATE_USER',
        `Mise à jour de l'utilisateur ${userData.name} (${userData.email})`
      );
    }
  } else {
    const newUserId = `usr-${Date.now()}`;
    const nameParts = userData.name.trim().split(/\s+/);
    const prenom = nameParts[0] || '';
    const nom = nameParts.slice(1).join(' ') || '';

    const { hasherMotDePasse } = await import('../utils/security');
    const tempPassword = userData.password || 'passer123@';
    const hashedPass = await hasherMotDePasse(tempPassword);

    const newUser = {
      id: newUserId,
      name: userData.name,
      prenom,
      nom,
      email: userData.email,
      role: userData.role,
      motDePasse: hashedPass,
      dateCreation: Date.now(),
      doitChangerMotDePasse: true,
      actif: true,
      matieres: userData.role === 'prof' ? (userData.matieres || []) : undefined,
      filiere: userData.role === 'etudiant' ? (userData.filiere || '') : undefined,
      niveau: userData.role === 'etudiant' ? (userData.niveau || '') : undefined
    };
    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    
    logAuditAction(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'CREATE_USER',
      `Création de l'utilisateur ${userData.name} (${userData.email}, Rôle: ${userData.role})`
    );
  }
};

export const deleteUser = (userId, adminUser) => {
  const users = loadData(STORAGE_KEYS.USERS, MOCK_USERS);
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, message: "Utilisateur non trouvé." };
  
  if (user.isRootAdmin) {
    return { success: false, message: "Le compte administrateur principal ne peut pas être supprimé." };
  }

  const filteredUsers = users.filter(u => u.id !== userId);
  saveData(STORAGE_KEYS.USERS, filteredUsers);
  
  // If user was a student, delete student record too
  if (user.role === 'etudiant') {
    const students = loadData(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
    const filteredStudents = students.filter(s => s.userId !== userId);
    saveData(STORAGE_KEYS.STUDENTS, filteredStudents);
  }
  
  logAuditAction(
    adminUser.id,
    adminUser.name,
    adminUser.role,
    'DELETE_USER',
    `Suppression de l'utilisateur ${user.name} (${user.email})`
  );
  return { success: true };
};

