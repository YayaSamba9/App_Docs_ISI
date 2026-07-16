import React, { useState, useEffect } from 'react';
import { 
  getStudents, 
  getGradesByStudent, 
  addOrUpdateGrade, 
  deleteGrade, 
  calculateAcademicSummary,
  getDepartments,
  getCohorts,
  updateUserPassword
} from '../db/storage';
import DocumentViewer from '../components/DocumentViewer';
import { validerMotDePasse, calculerForceMotDePasse } from '../utils/security';

export default function ProfessorDashboard({ user, currentTab, addToast }) {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  
  // Selection states for class bulletins
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  
  // Selection states for grade entry
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [academicSummary, setAcademicSummary] = useState(null);
  
  // Grade Form state
  const [gradeId, setGradeId] = useState('');
  const [ueCode, setUeCode] = useState('DAP1501');
  const [ueName, setUeName] = useState("Développement d'Applications");
  const [ueCredit, setUeCredit] = useState('8');
  const [subject, setSubject] = useState('');
  const [mcc, setMcc] = useState('');
  const [exam, setExam] = useState('');
  const [coeff, setCoeff] = useState(3);
  const [semester, setSemester] = useState('S5');
  
  // PDF Viewer State
  const [previewRequest, setPreviewRequest] = useState(null);

  const allowedSubjects = selectedStudent 
    ? (user.matieres || []).filter(m => m.specialty === selectedStudent.specialty)
    : [];

  // Password change states
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
      case 'fort': return '#004498';
      case 'moyen': return '#2563eb';
      default: return '#94a3b8';
    }
  };

  const PRESET_UES = [
    { code: 'DAP1501', name: "Développement d'Applications", credit: 8 },
    { code: 'OGC1504', name: "Outils de Gestion et de contrôle", credit: 6 },
    { code: 'OGF1505', name: "Professionalisation", credit: 4 },
    { code: 'RSY1502', name: "Reseaux et systemes informatiques", credit: 4 },
    { code: 'SIBD1503', name: "Système d'information et base de données", credit: 8 }
  ];

  const handleUeChange = (code) => {
    setUeCode(code);
    const found = PRESET_UES.find(u => u.code === code);
    if (found) {
      setUeName(found.name);
      setUeCredit(found.credit.toString());
    } else if (code === 'custom') {
      setUeName('');
      setUeCredit('');
    }
  };

  const loadDashboardData = () => {
    const stds = getStudents();
    const depts = getDepartments();
    const cohs = getCohorts();
    
    setStudents(stds);
    setDepartments(depts);
    setCohorts(cohs);
    
    if (depts.length > 0 && !selectedDeptId) {
      setSelectedDeptId(depts[0].id);
    }
    if (cohs.length > 0 && !selectedCohortId) {
      setSelectedCohortId(cohs[0].id);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentTab]);

  useEffect(() => {
    if (selectedStudent) {
      const grades = getGradesByStudent(selectedStudent.id);
      setStudentGrades(grades);
      setAcademicSummary(calculateAcademicSummary(selectedStudent.id));
      
      const allowed = (user.matieres || []).filter(m => m.specialty === selectedStudent.specialty);
      if (allowed.length > 0) {
        setSubject(allowed[0].subject);
      } else {
        setSubject('');
      }
    } else {
      setStudentGrades([]);
      setAcademicSummary(null);
      setSubject('');
    }
  }, [selectedStudent, user.matieres]);

  // Grade saving handler
  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      addToast('Veuillez spécifier le nom de la matière.', 'error');
      return;
    }
    const mccVal = parseFloat(mcc);
    const examVal = parseFloat(exam);
    if (isNaN(mccVal) || mccVal < 0 || mccVal > 20 || isNaN(examVal) || examVal < 0 || examVal > 20) {
      addToast('Les notes MCC et Examen doivent être comprises entre 0 et 20.', 'error');
      return;
    }

    addOrUpdateGrade({
      id: gradeId || undefined,
      studentId: selectedStudent.id,
      ueCode,
      ueName,
      ueCredit: parseInt(ueCredit),
      subject,
      mcc: mccVal,
      exam: examVal,
      coefficient: coeff,
      semester
    }, user);

    addToast(gradeId ? 'Note mise à jour avec succès.' : 'Note ajoutée au relevé.', 'success');
    
    // Clear grade form
    setGradeId('');
    setSubject('');
    setMcc('');
    setExam('');
    setCoeff(3);
    
    // Reload student grades
    const grades = getGradesByStudent(selectedStudent.id);
    setStudentGrades(grades);
    setAcademicSummary(calculateAcademicSummary(selectedStudent.id));
    
    // Force reload students list to refresh averages in other tabs
    setStudents(getStudents());
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

  const handleEditGradeClick = (g) => {
    setGradeId(g.id);
    setUeCode(g.ueCode);
    setUeName(g.ueName);
    setUeCredit(g.ueCredit.toString());
    setSubject(g.subject);
    setMcc(g.mcc.toString());
    setExam(g.exam.toString());
    setCoeff(g.coefficient);
    setSemester(g.semester);
  };

  const handleDeleteGradeClick = (gId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette note ?')) {
      deleteGrade(gId, user);
      addToast('Note supprimée.', 'success');
      
      const grades = getGradesByStudent(selectedStudent.id);
      setStudentGrades(grades);
      setAcademicSummary(calculateAcademicSummary(selectedStudent.id));
      setStudents(getStudents());
    }
  };

  // Get filtered class students for bulletins tab
  const classStudents = students.filter(s => s.departmentId === selectedDeptId && s.cohortId === selectedCohortId);

  // Pre-calculate summaries for the table view
  const classStudentsWithSummaries = classStudents.map(s => {
    const summary = calculateAcademicSummary(s.id);
    return { ...s, summary };
  });

  return (
    <div className="content-body fade-in">
      {/* 1. Grade Saisie & Correction Tab */}
      {currentTab === 'grades' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Left panel: student selection */}
          <div className="card">
            <h3 className="card-title">Sélectionner un Étudiant</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '65vh', overflowY: 'auto' }}>
              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>Aucun étudiant enregistré.</div>
              ) : (
                students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      ...studentCardSelectStyles,
                      borderColor: selectedStudent?.id === s.id ? 'var(--accent)' : '#e2e8f0',
                      backgroundColor: selectedStudent?.id === s.id ? '#eff6ff' : 'white',
                    }}
                  >
                    <strong style={{ fontSize: '0.85rem' }}>{s.firstName} {s.lastName}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      ID: {s.studentId} • {s.departmentName}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: grade management */}
          <div className="card">
            {selectedStudent ? (
              <div>
                <h3 className="card-title" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  Saisie & Correction de Notes : {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                {/* Grade Entry Form */}
                {allowedSubjects.length === 0 && (
                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1.5px solid #dbeafe',
                    color: '#0e294b',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    ⚠️ Vous n'êtes pas habilité à enseigner de matières pour la filière « {selectedStudent.specialty} » de cet étudiant.
                  </div>
                )}
                <form onSubmit={handleSaveGrade} style={gradeFormStyles}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Code UE</label>
                      <select className="form-control" value={ueCode} onChange={(e) => handleUeChange(e.target.value)}>
                        {PRESET_UES.map(u => (
                          <option key={u.code} value={u.code}>{u.code}</option>
                        ))}
                        <option value="custom">Autre / Saisie Libre</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Nom de l'UE</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Développement d'Applications"
                        value={ueName}
                        onChange={(e) => setUeName(e.target.value)}
                        disabled={ueCode !== 'custom'}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Crédits UE</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ex: 8"
                        value={ueCredit}
                        onChange={(e) => setUeCredit(e.target.value)}
                        disabled={ueCode !== 'custom'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Matière (EC)</label>
                      <select
                        className="form-control"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        disabled={allowedSubjects.length === 0}
                      >
                        {allowedSubjects.length === 0 ? (
                          <option value="">Aucune matière habilitée</option>
                        ) : (
                          allowedSubjects.map(m => (
                            <option key={m.subject} value={m.subject}>{m.subject}</option>
                          ))
                        )}
                        {subject && !allowedSubjects.some(m => m.subject === subject) && (
                          <option value={subject}>{subject}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>MCC (40%)</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="20"
                        className="form-control"
                        placeholder="MCC"
                        value={mcc}
                        onChange={(e) => setMcc(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Examen (60%)</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="20"
                        className="form-control"
                        placeholder="Exam"
                        value={exam}
                        onChange={(e) => setExam(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Coeff.</label>
                      <select className="form-control" value={coeff} onChange={(e) => setCoeff(parseInt(e.target.value))}>
                        <option value="1">1.0</option>
                        <option value="2">2.0</option>
                        <option value="3">3.0</option>
                        <option value="4">4.0</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Semestre</label>
                      <select className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="S5">S5</option>
                        <option value="S6">S6</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ height: '42px', width: '100%' }}
                        disabled={allowedSubjects.length === 0}
                      >
                        {gradeId ? 'Modifier' : 'Valider'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Grade Listing Table */}
                <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '600' }}>Éléments Constitutifs (EC) Saisis</h4>
                {studentGrades.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-light)', fontStyle: 'italic' }}>Aucune note enregistrée pour le moment.</div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>UE</th>
                          <th>Matière (EC)</th>
                          <th style={{ textAlign: 'center' }}>MCC (40%)</th>
                          <th style={{ textAlign: 'center' }}>Examen (60%)</th>
                          <th style={{ textAlign: 'center' }}>Moyenne EC</th>
                          <th style={{ textAlign: 'center' }}>Coeff.</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentGrades.filter(g => 
                          (user.matieres || []).some(m => m.subject === g.subject && m.specialty === selectedStudent.specialty)
                        ).map(g => (
                          <tr key={g.id}>
                            <td><span className="badge badge-in_progress">{g.ueCode}</span></td>
                            <td style={{ fontWeight: '500' }}>{g.subject}</td>
                            <td style={{ textAlign: 'center' }}>{g.mcc.toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}>{g.exam.toFixed(2)}</td>
                            <td style={{ textAlign: 'center', fontWeight: '700' }}>{g.score.toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}>{g.coefficient.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>
                              {(user.matieres || []).some(m => m.subject === g.subject && m.specialty === selectedStudent.specialty) ? (
                                <>
                                  <button onClick={() => handleEditGradeClick(g)} style={actionIconBtnStyles} title="Corriger la note">
                                    ✎
                                  </button>
                                  <button onClick={() => handleDeleteGradeClick(g.id)} style={{ ...actionIconBtnStyles, color: 'var(--status-rejected)' }} title="Supprimer la note">
                                    🗑
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontStyle: 'italic', paddingRight: '8px' }} title="Matière d'un autre enseignant">
                                  🔒 Lecture seule
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Sélectionnez un étudiant dans le panneau latéral de gauche pour saisir ou corriger des notes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Class Bulletins Consultation Tab */}
      {currentTab === 'bulletins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Class Filters Bar */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Département Académique</label>
                <select 
                  className="form-control" 
                  value={selectedDeptId} 
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Promotion / Cohorte</label>
                <select 
                  className="form-control" 
                  value={selectedCohortId} 
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                >
                  {cohorts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Class Students Table */}
          <div className="card">
            <h3 className="card-title">Liste des Étudiants de la Classe</h3>
            {classStudentsWithSummaries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Aucun étudiant enregistré pour cette combinaison département et cohorte.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom Complet</th>
                      <th>Spécialité / Filière</th>
                      <th>Statut d'Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudentsWithSummaries.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '750' }}>{s.studentId}</td>
                        <td style={{ fontWeight: '500' }}>{s.lastName} {s.firstName}</td>
                        <td>{s.specialty} ({s.grade})</td>
                        <td>
                          <span className={`badge ${s.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                            {s.status === 'active' ? 'Actif' : 'Diplômé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Settings & Security Tab */}
      {currentTab === 'settings' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card fade-in">
            <h3 className="card-title">
              <span>Paramètres de Sécurité</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Protégez votre compte en changeant régulièrement votre mot de passe. L'administrateur fournit un mot de passe par défaut que vous devez remplacer à votre première connexion.
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

      {/* Bulletin preview overlay modal */}
      {previewRequest && (
        <DocumentViewer
          request={previewRequest.request}
          student={previewRequest.student}
          onClose={() => setPreviewRequest(null)}
        />
      )}
    </div>
  );
}

// Compact Select Card Styles
const studentCardSelectStyles = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'var(--transition)',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const calcGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  marginBottom: '24px',
};

const calcCardStyles = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
};

const calcLabelStyles = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const calcValueStyles = {
  fontSize: '1.2rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const calcSubStyles = {
  fontSize: '0.65rem',
  color: 'var(--text-light)',
  marginTop: '2px',
};

const gradeFormStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#f8fafc',
  border: '1px dashed #cbd5e1',
  borderRadius: '8px',
};

const actionIconBtnStyles = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '4px 8px',
  transition: 'var(--transition)',
  outline: 'none',
};
