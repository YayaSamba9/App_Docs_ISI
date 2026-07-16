import React, { useState, useEffect } from 'react';
import { 
  getRequests, 
  updateRequestStatus, 
  getStudents, 
  getGradesByStudent, 
  addOrUpdateGrade, 
  deleteGrade, 
  calculateAcademicSummary,
  updateUserPassword
} from '../db/storage';
import DocumentViewer from '../components/DocumentViewer';
import { validerMotDePasse, calculerForceMotDePasse } from '../utils/security';

export default function StaffDashboard({ user, currentTab, addToast }) {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Filters
  const [filterDept, setFilterDept] = useState('');
  const [filterDoc, setFilterDoc] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Saisie de notes state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [academicSummary, setAcademicSummary] = useState(null);

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
      case 'fort': return '#0e294b';
      case 'moyen': return '#2563eb';
      default: return '#94a3b8';
    }
  };

  // Request processing state
  const [activeRequest, setActiveRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  
  // PDF Viewer State
  const [previewRequest, setPreviewRequest] = useState(null);

  // Load functions
  const loadData = () => {
    setRequests(getRequests());
    setStudents(getStudents());
  };

  useEffect(() => {
    loadData();
  }, [currentTab]);

  useEffect(() => {
    if (selectedStudent) {
      const grades = getGradesByStudent(selectedStudent.id);
      setStudentGrades(grades);
      setAcademicSummary(calculateAcademicSummary(selectedStudent.id));
    } else {
      setStudentGrades([]);
      setAcademicSummary(null);
    }
  }, [selectedStudent]);

  // Request status handlers
  const handleUpdateStatus = (reqId, status) => {
    if (status === 'rejected' && !remarks.trim()) {
      addToast('Un motif de rejet est obligatoire.', 'error');
      return;
    }

    const updated = updateRequestStatus(reqId, status, remarks, user);
    if (updated) {
      addToast(`Demande mise à jour au statut: ${translateStatus(status)}`, 'success');
      setActiveRequest(null);
      setRemarks('');
      loadData();
    } else {
      addToast('Erreur lors du traitement.', 'error');
    }
  };

  // Saisie de notes is handled by ProfessorDashboard now.

  // Translations
  const translateDocType = (type) => {
    switch (type) {
      case 'enrollment_certificate': return 'Attestation d\'inscription';
      case 'transcript': return 'Relevé de notes';
      case 'internship_certificate': return 'Attestation de stage';
      case 'report_card': return 'Bulletin des notes';
      case 'reclamation': return 'Réclamation de note';
      default: return type;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'submitted': return 'Soumise';
      case 'in_progress': return 'En cours';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'delivered': return 'Délivrée';
      default: return status;
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted': return <span className="badge badge-submitted">Soumise</span>;
      case 'in_progress': return <span className="badge badge-in_progress">En cours</span>;
      case 'approved': return <span className="badge badge-approved">Approuvée</span>;
      case 'rejected': return <span className="badge badge-rejected">Rejetée</span>;
      case 'delivered': return <span className="badge badge-delivered">Délivrée</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtering
  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? r.departmentName.includes(filterDept) : true;
    const matchesDoc = filterDoc ? r.documentType === filterDoc : true;
    const matchesStatus = filterStatus ? r.status === filterStatus : true;
    return matchesSearch && matchesDept && matchesDoc && matchesStatus;
  });

  return (
    <div className="content-body fade-in">
      {/* 1. Request Queue Tab */}
      {currentTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filters Bar */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={filterBarGridStyles}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Rechercher Étudiant / N° Carte</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Youssef..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Type de Document</label>
                <select className="form-control" value={filterDoc} onChange={(e) => setFilterDoc(e.target.value)}>
                  <option value="">Tous les documents</option>
                  <option value="enrollment_certificate">Attestation d'inscription</option>
                  <option value="transcript">Relevé de notes</option>
                  <option value="report_card">Bulletin des notes</option>
                  <option value="internship_certificate">Attestation de stage</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Statut</label>
                <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  <option value="submitted">Soumise</option>
                  <option value="in_progress">En cours</option>
                  <option value="approved">Approuvée</option>
                  <option value="rejected">Rejetée</option>
                  <option value="delivered">Délivrée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Queue Table */}
          <div className="card">
            <h3 className="card-title">File d'attente globale ({filteredRequests.length} demandes)</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Département & Cohorte</th>
                    <th>Document</th>
                    <th>Date demande</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <strong style={{ display: 'block', fontSize: '0.85rem' }}>{r.studentName}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>N° {r.studentCode}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500' }}>{r.departmentName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{r.cohortName}</span>
                      </td>
                      <td style={{ fontWeight: '600', fontSize: '0.82rem' }}>{translateDocType(r.documentType)}</td>
                      <td style={{ fontSize: '0.8rem' }}>{formatDateTime(r.createdAt)}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button onClick={() => setActiveRequest(r)} className="btn btn-secondary btn-sm" title="Traiter la demande">
                            Traiter
                          </button>
                          {(r.status === 'approved' || r.status === 'delivered') && r.documentType !== 'reclamation' && (
                            <button onClick={() => {
                              const std = students.find(s => s.id === r.studentId);
                              setPreviewRequest({ request: r, student: std });
                            }} className="btn btn-primary btn-sm" title="Télécharger">
                              Télécharger
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Dossiers Tab */}
      {currentTab === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Left panel: student search & list */}
          <div className="card">
            <h3 className="card-title">Dossiers Étudiants</h3>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher par nom ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '55vh', overflowY: 'auto' }}>
              {students
                .filter(s => 
                  `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(s => (
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
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {s.studentId} • {s.departmentName}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Right panel: Student Dossier details */}
          <div className="card">
            {selectedStudent ? (
              <div>
                <h3 className="card-title" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  Fiche Académique : {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Matricule</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.studentId}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Genre</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.sexe || 'Masculin'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Naissance</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.birthDate} ({selectedStudent.birthPlace})</strong>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Département</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.departmentName}</strong>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Filière / Spécialité</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.specialty}</strong>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Cohorte & Grade</span>
                    <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.cohortName} ({selectedStudent.grade})</strong>
                  </div>
                </div>

                {/* Summary metrics */}
                {academicSummary && (
                  <div style={calcGridStyles}>
                    <div style={calcCardStyles}>
                      <span style={calcLabelStyles}>Crédits validés</span>
                      <strong style={calcValueStyles}>
                        {academicSummary.totalCredits.toFixed(2)} / {academicSummary.maxCredits || '30.00'}
                      </strong>
                    </div>
                    <div style={calcCardStyles}>
                      <span style={calcLabelStyles}>Moyenne Globale</span>
                      <strong style={calcValueStyles}>
                        {academicSummary.annualAverage > 0 ? `${academicSummary.annualAverage.toFixed(2)}/20` : 'N/A'}
                      </strong>
                    </div>
                    <div style={calcCardStyles}>
                      <span style={calcLabelStyles}>Décision Jury</span>
                      <strong style={{ ...calcValueStyles, color: academicSummary.annualValidated ? 'var(--status-approved)' : 'var(--status-rejected)' }}>
                        {academicSummary.annualAverage > 0 ? (academicSummary.annualValidated ? 'ADMIS' : 'RATTRAPAGE') : 'En attente'}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Grade list (Read Only) */}
                <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '600' }}>Relevé de Notes (Lecture seule)</h4>
                {studentGrades.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontStyle: 'italic' }}>Aucune note enregistrée pour le moment.</div>
                ) : (
                  <div className="table-container">
                    <table style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th>UE</th>
                          <th>Matière (EC)</th>
                          <th style={{ textAlign: 'center' }}>MCC (40%)</th>
                          <th style={{ textAlign: 'center' }}>Examen (60%)</th>
                          <th style={{ textAlign: 'center' }}>Moyenne EC</th>
                          <th style={{ textAlign: 'center' }}>Coeff.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentGrades.map(g => (
                          <tr key={g.id}>
                            <td><span className="badge badge-in_progress">{g.ueCode}</span></td>
                            <td style={{ fontWeight: '500' }}>{g.subject}</td>
                            <td style={{ textAlign: 'center' }}>{g.mcc.toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}>{g.exam.toFixed(2)}</td>
                            <td style={{ textAlign: 'center', fontWeight: '700' }}>{g.score.toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}>{g.coefficient.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Print button if average exists */}
                {academicSummary && academicSummary.annualAverage > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button 
                      onClick={() => setPreviewRequest({
                        request: { documentType: 'report_card', reason: 'Génération Bulletin Secrétariat' },
                        student: selectedStudent
                      })}
                      className="btn btn-success"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                      </svg>
                      Générer le Bulletin PDF
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Sélectionnez un étudiant dans le panneau latéral de gauche pour consulter son dossier académique complet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render Request Processing Action Modal */}
      {activeRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Instruction de la demande N° {activeRequest.id.slice(-6).toUpperCase()}</h3>
              <button onClick={() => setActiveRequest(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div style={modalInfoGridStyles}>
                <div><strong>Demandeur:</strong> {activeRequest.studentName}</div>
                <div><strong>Document:</strong> {translateDocType(activeRequest.documentType)}</div>
                <div><strong>Motif:</strong> {activeRequest.reason}</div>
                {activeRequest.notes && <div><strong>Notes étudiant:</strong> {activeRequest.notes}</div>}
                {activeRequest.justificatif && (
                  <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                    <strong>Pièce justificative :</strong>{' '}
                    <a 
                      href={activeRequest.justificatif.data} 
                      download={activeRequest.justificatif.name}
                      style={{
                        color: 'var(--brand-primary)',
                        textDecoration: 'underline',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      📎 {activeRequest.justificatif.name} ({Math.round(activeRequest.justificatif.size / 1024)} KB)
                    </a>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Remarques de l'instruction / Motif de rejet (obligatoire en cas de rejet)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Indiquez des détails pour l'étudiant..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setActiveRequest(null)} className="btn btn-secondary">Annuler</button>
              
              {activeRequest.status === 'submitted' && (
                <button onClick={() => handleUpdateStatus(activeRequest.id, 'in_progress')} className="btn btn-primary">
                  Mettre en traitement
                </button>
              )}

              {(activeRequest.status === 'submitted' || activeRequest.status === 'in_progress') && (
                <>
                  <button onClick={() => handleUpdateStatus(activeRequest.id, 'rejected')} className="btn btn-danger">
                    Rejeter
                  </button>
                  <button onClick={() => handleUpdateStatus(activeRequest.id, 'approved')} className="btn btn-success">
                    Approuver et signer
                  </button>
                </>
              )}

              {activeRequest.status === 'approved' && (
                <button onClick={() => handleUpdateStatus(activeRequest.id, 'delivered')} className="btn btn-primary" style={{ backgroundColor: 'var(--status-delivered)' }}>
                  Marquer comme Délivrée
                </button>
              )}
            </div>
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

      {/* Render Document PDF Previewer */}
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

// Inline CSS styles
const filterBarGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
};

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
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const calcSubStyles = {
  fontSize: '0.65rem',
  color: 'var(--text-light)',
  marginTop: '2px',
};

const gradeFormStyles = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr',
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

const modalInfoGridStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '0.88rem',
  color: 'var(--text-secondary)',
  backgroundColor: '#f8fafc',
  padding: '14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};
