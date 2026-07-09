import React, { useState, useEffect } from 'react';
import { getRequests, submitRequest, getGradesByStudent, calculateAcademicSummary, updateUserPassword } from '../db/storage';
import StatsCard from '../components/StatsCard';
import DocumentViewer from '../components/DocumentViewer';
import { validerMotDePasse, calculerForceMotDePasse } from '../utils/security';

export default function StudentDashboard({ user, currentTab, setCurrentTab, addToast }) {
  const student = user.studentInfo;
  
  const [requests, setRequests] = useState([]);
  const [grades, setGrades] = useState([]);
  const [academicSummary, setAcademicSummary] = useState(null);
  
  // Form states
  const [docType, setDocType] = useState('enrollment_certificate');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  
  // Preview State
  const [previewRequest, setPreviewRequest] = useState(null);

  // Requests page states
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState(null);
  const [justificatif, setJustificatif] = useState(null);

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

  // Reload data
  const loadStudentData = () => {
    if (!student) return;
    const reqs = getRequests().filter(r => r.studentId === student.id);
    setRequests(reqs);
    
    const studentGrades = getGradesByStudent(student.id);
    setGrades(studentGrades);
    
    const summary = calculateAcademicSummary(student.id);
    setAcademicSummary(summary);
  };

  useEffect(() => {
    loadStudentData();
  }, [student]);

  if (!student) {
    return (
      <div className="content-body fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '440px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <h3 className="card-title" style={{ color: 'var(--status-rejected)', marginBottom: '12px' }}>Dossier Académique Introuvable</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Aucun dossier étudiant n'est associé à cette adresse e-mail. Veuillez contacter l'administration de l'établissement (Secrétariat / Agent administratif) pour régulariser votre fiche d'inscription.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast('Veuillez spécifier le motif de votre demande.', 'error');
      return;
    }
    
    // Check if justificatif is required
    const isJustificatifRequired = docType === 'transcript' || docType === 'report_card';
    if (isJustificatifRequired && !justificatif) {
      addToast('Une pièce justificative (PDF, PNG, JPG) est obligatoire pour cette demande.', 'error');
      return;
    }
    
    submitRequest(student.id, docType, reason, notes, user, justificatif);
    addToast('Demande soumise avec succès ! Elle est en cours de traitement.', 'success');
    
    // Clear form & close modal
    setReason('');
    setNotes('');
    setJustificatif(null);
    setShowNewRequestModal(false);
    
    // Reload requests and go to list tab
    loadStudentData();
    setCurrentTab('requests');
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
        
        // Reset form
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
      case 'enrollment_certificate': return 'Attestation d\'inscription';
      case 'transcript': return 'Relevé de notes';
      case 'internship_certificate': return 'Attestation de stage';
      case 'report_card': return 'Bulletin des notes';
      default: return type;
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper count cards
  const submittedCount = requests.filter(r => r.status === 'submitted').length;
  const processedCount = requests.filter(r => r.status === 'approved' || r.status === 'delivered').length;

  // Filtered requests based on search query
  const filteredRequests = requests.filter(r => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    
    const docTypeStr = translateDocType(r.documentType).toLowerCase();
    const dateStr = formatDateTime(r.createdAt).toLowerCase();
    const statusStr = r.status.toLowerCase();
    const reasonStr = r.reason.toLowerCase();
    const cohortStr = (student.cohortName || '2024-2025').toLowerCase();
    
    return docTypeStr.includes(term) || 
          dateStr.includes(term) || 
          statusStr.includes(term) || 
          reasonStr.includes(term) ||
          cohortStr.includes(term);
  });

  // Pagination calculations
  const totalCount = filteredRequests.length;
  const totalPages = Math.ceil(totalCount / entriesLimit);
  const startIndex = (currentPage - 1) * entriesLimit;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + entriesLimit);

  return (
    <div className="content-body fade-in">
      {/* 1. Overview Tab */}
      {currentTab === 'dashboard' && (
        <div>
          {/* Stats Bar */}
          <div className="stats-grid">
            <StatsCard
              title="Demandes Actives"
              value={requests.filter(r => r.status !== 'delivered' && r.status !== 'rejected').length}
              statusType="warning"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            />
            <StatsCard
              title="Moyenne Annuelle"
              value={academicSummary?.annualAverage > 0 ? `${academicSummary.annualAverage.toFixed(2)}/20` : 'N/A'}
              statusType="primary"
              description={academicSummary?.annualAverage >= 10 ? 'Semestre validé' : academicSummary?.annualAverage ? 'Rattrapage requis' : 'En attente de saisie'}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              }
            />
            <StatsCard
              title="Documents Délivrés"
              value={requests.filter(r => r.status === 'delivered').length}
              statusType="success"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            />
          </div>

          <div className="dashboard-layout">
            {/* Left section: Recent Requests */}
            <div className="card">
              <h3 className="card-title">
                <span>Demandes Récentes</span>
                <button onClick={() => setCurrentTab('requests')} className="btn btn-secondary btn-sm">Voir tout</button>
              </h3>
              
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Vous n'avez soumis aucune demande de document pour le moment.
                  <div style={{ marginTop: '16px' }}>
                    <button onClick={() => setCurrentTab('requests')} className="btn btn-primary btn-sm">Soumettre une demande</button>
                  </div>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Date Soumission</th>
                        <th>Statut</th>
                        <th>Dernière Remarque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 4).map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: '600' }}>{translateDocType(r.documentType)}</td>
                          <td>{formatDateTime(r.createdAt)}</td>
                          <td>{getStatusBadge(r.status)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {r.history[r.history.length - 1]?.remarks || 'En cours d\'analyse.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right section: Student Info summary */}
            <div className="card">
              <h3 className="card-title">Fiche Académique</h3>
              <div style={infoGridStyles}>
                <div style={infoItemStyles}>
                  <span style={infoLabelStyles}>Matricule</span>
                  <span style={infoValStyles}>{student.studentId}</span>
                </div>
                <div style={infoItemStyles}>
                  <span style={infoLabelStyles}>Département</span>
                  <span style={infoValStyles}>{student.departmentName}</span>
                </div>
                <div style={infoItemStyles}>
                  <span style={infoLabelStyles}>Cohorte</span>
                  <span style={infoValStyles}>{student.cohortName}</span>
                </div>
                <div style={infoItemStyles}>
                  <span style={infoLabelStyles}>Statut</span>
                  <span style={{ ...infoValStyles, color: student.status === 'active' ? 'var(--status-approved)' : 'var(--text-secondary)' }}>
                    {student.status === 'active' ? 'Actif' : 'Diplômé'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Requests Tab */}
      {currentTab === 'requests' && (
        <div>
          {/* Header & breadcrumb block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0e294b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MES DEMANDES
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: '#0e294b', fontWeight: '600' }}>Mes demandes</span>
            </div>
          </div>

          {/* Action button bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button 
              onClick={() => {
                setDocType('enrollment_certificate');
                setReason('');
                setNotes('');
                setJustificatif(null);
                setShowNewRequestModal(true);
              }} 
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              Nouvelle demande
            </button>
          </div>

          {/* Table Container Card */}
          <div className="card" style={{ padding: '24px' }}>
            {/* Table Search & Entries Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Afficher{' '}
                <select 
                  value={entriesLimit} 
                  onChange={(e) => { setEntriesLimit(parseInt(e.target.value)); setCurrentPage(1); }}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>{' '}
                entrées
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Rechercher:{' '}
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Rechercher..."
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '200px' }}
                />
              </div>
            </div>

            {/* Requests Data Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Année scolaire</th>
                    <th>Type de demande</th>
                    <th>Date</th>
                    <th>État</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        Aucune donnée disponible dans le tableau
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '500' }}>{student.cohortName || '2024-2025'}</td>
                        <td style={{ fontWeight: '600' }}>{translateDocType(r.documentType)}</td>
                        <td>{formatDateTime(r.createdAt)}</td>
                        <td>{getStatusBadge(r.status)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button 
                              onClick={() => setSelectedRequestForDetails(r)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            >
                              👁️ Détails
                            </button>
                            {(r.status === 'approved' || r.status === 'delivered') && (
                              <button 
                                onClick={() => setPreviewRequest(r)} 
                                className="btn btn-success btn-sm"
                                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                              >
                                📄 PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {totalCount === 0 
                  ? 'Affichage de 0 à 0 sur 0 entrées' 
                  : `Affichage de ${startIndex + 1} à ${Math.min(startIndex + entriesLimit, totalCount)} sur ${totalCount} entrées`
                }
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  Précédente
                </button>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  Suivante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Grades Tab */}
      {currentTab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Cards */}
          <div style={summaryRowStyles}>
            <div style={summaryCardStyles}>
              <span style={summaryLabelStyles}>Moyenne Semestre 5</span>
              <span style={{ ...summaryValStyles, color: academicSummary?.annualValidated ? 'var(--status-approved)' : 'var(--status-rejected)' }}>
                {academicSummary?.annualAverage > 0 ? academicSummary.annualAverage.toFixed(2) : 'N/A'}
              </span>
              <span style={summarySubStyles}>{academicSummary?.annualAverage > 0 ? `Mention: ${academicSummary.annualHonors}` : 'En cours'}</span>
            </div>
            
            <div style={summaryCardStyles}>
              <span style={summaryLabelStyles}>Crédits validés</span>
              <span style={{ ...summaryValStyles, color: 'var(--accent)' }}>
                {academicSummary?.totalCredits.toFixed(2)} / {academicSummary?.maxCredits ? academicSummary.maxCredits.toFixed(2) : '30.00'}
              </span>
              <span style={summarySubStyles}>Acquis pour validation</span>
            </div>

            <div style={summaryCardStyles}>
              <span style={summaryLabelStyles}>Décision du Jury</span>
              <span style={{ ...summaryValStyles, color: academicSummary?.annualValidated ? 'var(--status-approved)' : 'var(--status-rejected)' }}>
                {academicSummary?.annualAverage > 0 ? (academicSummary.annualValidated ? 'ADMIS' : 'REFUSÉ') : 'En attente'}
              </span>
              <span style={summarySubStyles}>{academicSummary?.annualAverage > 0 ? (academicSummary.annualValidated ? 'Bon Travail' : 'Rattrapage') : 'Calcul en cours'}</span>
            </div>
          </div>

          {/* UE Grouped Grades Table */}
          <div className="card">
            <h3 className="card-title">Détail des Unités d'Enseignement (UE) et Éléments Constitutifs (EC)</h3>
            {!academicSummary || academicSummary.ueList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Aucune note saisie pour ce semestre.
              </div>
            ) : (
              <div className="table-container">
                <table style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>UE / Éléments constitutifs</th>
                      <th style={{ textAlign: 'center' }}>MCC (40%)</th>
                      <th style={{ textAlign: 'center' }}>Examen (60%)</th>
                      <th style={{ textAlign: 'center' }}>Moyenne EC</th>
                      <th style={{ textAlign: 'center' }}>Coeff.</th>
                      <th style={{ textAlign: 'center' }}>Moyenne UE</th>
                      <th style={{ textAlign: 'center' }}>Crédits UE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicSummary.ueList.map(ue => (
                      <React.Fragment key={ue.code}>
                        {/* UE Header Row */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                          <td colSpan="5">[{ue.code}] {ue.name}</td>
                          <td style={{ textAlign: 'center' }}>{ue.average.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${ue.validated ? 'badge-approved' : 'badge-rejected'}`}>
                              {ue.validated ? `${ue.credit} Cr. (Validée)` : `0 Cr. (Ajournée)`}
                            </span>
                          </td>
                        </tr>
                        {/* EC rows */}
                        {ue.grades.map(g => (
                          <tr key={g.id}>
                            <td style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>{g.subject}</td>
                            <td style={{ textAlign: 'center' }}>{g.mcc.toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}>{g.exam.toFixed(2)}</td>
                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{g.score.toFixed(2)}</td>
                            <td style={{ textAlign: 'center' }}>{g.coefficient.toFixed(2)}</td>
                            <td colSpan="2" style={{ backgroundColor: '#fff' }}></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Settings & Security Tab */}
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

      {/* Render Document Viewer Modal */}
      {previewRequest && (
        <DocumentViewer
          request={previewRequest}
          student={student}
          onClose={() => setPreviewRequest(null)}
        />
      )}

      {/* Nouvelle Demande Modal */}
      {showNewRequestModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Nouvelle Demande de Document</h3>
              <button onClick={() => { setShowNewRequestModal(false); setJustificatif(null); }} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Type de Document</label>
                  <select 
                    className="form-control" 
                    value={docType} 
                    onChange={(e) => {
                      setDocType(e.target.value);
                    }}
                  >
                    <option value="enrollment_certificate">Attestation d'inscription</option>
                    <option value="transcript">Relevé de notes global</option>
                    <option value="report_card">Bulletin des notes semestriel</option>
                    <option value="internship_certificate">Attestation de validation de stage</option>
                  </select>
                </div>

                {/* Pièce justificative upload field */}
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Pièce justificative (PDF, PNG, JPG)</span>
                    {(docType === 'transcript' || docType === 'report_card') && (
                      <span style={{ color: 'var(--status-rejected)', fontSize: '0.72rem', fontWeight: 'bold' }}>* Requis</span>
                    )}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="application/pdf, image/png, image/jpeg, image/gif"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setJustificatif({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: reader.result
                          });
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setJustificatif(null);
                      }
                    }}
                    required={docType === 'transcript' || docType === 'report_card'}
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-light)', fontSize: '0.72rem' }}>
                    Requis obligatoirement pour la délivrance d'un bulletin semestriel ou d'un relevé de notes global.
                  </small>
                </div>

                <div className="form-group">
                  <label>Motif de la demande (Obligatoire)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Dossier Campus France, renouvellement visa, etc."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    maxLength={120}
                  />
                </div>

                <div className="form-group">
                  <label>Notes complémentaires (Optionnel)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Précisez un détail particulier à l'attention de l'agent..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => { setShowNewRequestModal(false); setJustificatif(null); }} 
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Soumettre au Secrétariat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historique & Détails de la demande Modal */}
      {selectedRequestForDetails && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Détails de la demande N° {selectedRequestForDetails.id.slice(-6).toUpperCase()}</h3>
              <button onClick={() => setSelectedRequestForDetails(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px',
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Type de Document</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0e294b' }}>{translateDocType(selectedRequestForDetails.documentType)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Date de soumission</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0e294b' }}>{formatDateTime(selectedRequestForDetails.createdAt)}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Motif indiqué</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{selectedRequestForDetails.reason}</span>
                </div>
                {selectedRequestForDetails.notes && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Notes complémentaires</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>{selectedRequestForDetails.notes}</span>
                  </div>
                )}
                {selectedRequestForDetails.justificatif && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Pièce justificative</span>
                    <a 
                      href={selectedRequestForDetails.justificatif.data} 
                      download={selectedRequestForDetails.justificatif.name}
                      style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                    >
                      📎 {selectedRequestForDetails.justificatif.name} ({Math.round(selectedRequestForDetails.justificatif.size / 1024)} KB)
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0e294b', marginBottom: '12px' }}>
                  Historique d'instruction
                </h4>
                <div className="timeline">
                  {selectedRequestForDetails.history.map((hist, index) => (
                    <div key={index} className="timeline-item">
                      <div className={`timeline-dot ${index === selectedRequestForDetails.history.length - 1 ? 'active' : ''}`} />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-title" style={{ fontWeight: '600' }}>
                            {hist.remarks}
                          </span>
                          <span className="timeline-time">{formatDateTime(hist.timestamp)}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                          Par {hist.name} ({hist.role === 'agent' ? 'Secrétariat' : 'Étudiant'})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedRequestForDetails(null)} className="btn btn-secondary" style={{ width: '100%' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline CSS styles
const infoGridStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const infoItemStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '8px',
};

const infoLabelStyles = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  fontWeight: '600',
};

const infoValStyles = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const requestItemStyles = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  backgroundColor: '#f8fafc',
};

const requestItemHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '10px',
};

const requestItemBodyStyles = {
  fontSize: '0.82rem',
  color: 'var(--text-secondary)',
};

// Summary stats
const summaryRowStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
};

const summaryCardStyles = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #e2e8f0',
};

const summaryLabelStyles = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const summaryValStyles = {
  fontSize: '1.75rem',
  fontWeight: '800',
  lineHeight: '1',
  marginBottom: '6px',
};

const summarySubStyles = {
  fontSize: '0.72rem',
  color: 'var(--text-light)',
};
