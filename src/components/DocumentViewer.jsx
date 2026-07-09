import React, { useRef } from 'react';
import { calculateAcademicSummary } from '../db/storage';

export default function DocumentViewer({ request, student, onClose }) {
  if (!request || !student) return null;
  const printAreaRef = useRef(null);

  // Retrieve academic info
  const academic = calculateAcademicSummary(student.id);

  const translateDocType = (type) => {
    switch(type) {
      case 'enrollment_certificate': return 'Attestation d\'Inscription';
      case 'transcript': return 'Relevé de Notes';
      case 'internship_certificate': return 'Attestation de Stage';
      case 'report_card': return 'Bulletin de notes Semestre 5';
      default: return 'Document Officiel';
    }
  };

  const getAppreciation = (score) => {
    if (score >= 18) return 'Excellent';
    if (score >= 15) return 'Bien';
    if (score >= 12) return 'Assez bien';
    if (score >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const handlePrint = () => {
    const printContent = printAreaRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${translateDocType(request.documentType)} - ${student.firstName} ${student.lastName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #000;
              background-color: #fff;
              padding: 20px;
              margin: 0;
            }
            .document-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .grid-header {
              display: grid;
              grid-template-columns: 1fr 1fr;
              border: 1px solid #000;
              margin-bottom: 20px;
            }
            .header-left {
              border-right: 1px solid #000;
              padding: 15px;
            }
            .header-right {
              padding: 15px;
            }
            .logo-title-box {
              display: flex;
              flex-direction: column;
              border: 2px solid #000;
              padding: 10px;
              width: 140px;
              text-align: center;
              font-family: 'Inter', sans-serif;
              margin-bottom: 12px;
            }
            .logo-groupe {
              font-size: 0.95rem;
              font-weight: 800;
              letter-spacing: 0.1em;
              line-height: 1.1;
              color: #1e3a8a;
            }
            .logo-isi {
              font-size: 2.2rem;
              font-weight: 900;
              line-height: 1.0;
              border-top: 1.5px solid #000;
              margin-top: 3px;
              padding-top: 2px;
            }
            .header-meta-row {
              display: grid;
              grid-template-columns: 100px 1fr;
              font-size: 0.8rem;
              line-height: 1.4;
              margin-bottom: 4px;
            }
            .header-meta-label {
              font-weight: 600;
            }
            .header-meta-val {
              font-weight: 500;
            }
            .bulletin-heading-box {
              background-color: #334155;
              color: white;
              text-align: center;
              padding: 12px;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              font-family: 'Inter', sans-serif;
            }
            .bulletin-heading-title {
              font-size: 1.25rem;
              font-weight: 850;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .bulletin-heading-sub {
              font-size: 1.05rem;
              font-weight: 700;
              margin-top: 4px;
            }
            .academic-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 0.78rem;
            }
            .academic-table th, .academic-table td {
              border: 1px solid #000;
              padding: 5px 8px;
              vertical-align: middle;
            }
            .academic-table th {
              background-color: #f8fafc;
              font-weight: 700;
              text-align: left;
            }
            .ue-row-header {
              font-weight: bold;
              background-color: #f1f5f9;
            }
            .text-center {
              text-align: center;
            }
            .summary-card-grid {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
              font-size: 0.8rem;
            }
            .summary-box {
              border: 1px solid #000;
              padding: 12px;
            }
            .summary-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .recap-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 0.75rem;
              text-align: center;
            }
            .recap-table th, .recap-table td {
              border: 1px solid #000;
              padding: 6px;
            }
            .recap-table th {
              background-color: #f8fafc;
              font-weight: bold;
            }
            .validation-box {
              background-color: #000;
              color: #fff;
              font-weight: bold;
              padding: 2px 6px;
              display: inline-block;
              font-size: 0.7rem;
            }
            .doc-footer {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              font-size: 0.78rem;
            }
            .signature-block {
              text-align: right;
            }
            .signature-space {
              height: 45px;
            }
            .stamp-box {
              display: inline-block;
              border: 3px double #1e3a8a;
              color: #1e3a8a;
              font-weight: bold;
              padding: 5px 10px;
              border-radius: 4px;
              transform: rotate(-5deg);
              font-size: 0.7rem;
              margin-top: 5px;
              text-transform: uppercase;
            }
            .footer-info {
              border-top: 1px solid #000;
              padding-top: 8px;
              margin-top: 30px;
              font-size: 0.7rem;
              color: #475569;
              text-align: center;
              line-height: 1.4;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="document-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px', width: '95%' }}>
        <div className="modal-header">
          <h3 className="modal-title">Visualisation : {translateDocType(request.documentType)}</h3>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        {/* Paper Container wrapper */}
        <div style={docWrapperStyle}>
          <div ref={printAreaRef} style={docPaperStyle}>
            
            {/* Top Grid Header */}
            <div style={docHeaderGridStyle}>
              {/* Left Column */}
              <div style={headerLeftColStyle}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                  <svg width="150" height="52" viewBox="0 0 150 52" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="16" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="bold" fontSize="13" fill="#1b4468" textAnchor="middle" letterSpacing="3">GROUPE</text>
                    <text x="50%" y="48" fontFamily="'Georgia', 'Times New Roman', serif" fontWeight="900" fontSize="32" fill="#1b4468" textAnchor="middle" letterSpacing="1">ISI</text>
                  </svg>
                </div>
                <div style={metaListStyle}>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Domaine :</span> <span style={metaValueStyle}>{student.domaine || 'Sciences et Technologies'}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Mention :</span> <span style={metaValueStyle}>{student.mention || 'Informatique'}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Spécialité :</span> <span style={metaValueStyle}>{student.specialty || 'Informatique Appliquée à la Gestion'}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Grade :</span> <span style={metaValueStyle}>{student.grade || 'Licence'}</span></div>
                </div>
              </div>

              {/* Right Column */}
              <div style={headerRightColStyle}>
                {request.documentType === 'report_card' ? (
                  <div style={headerTitleBoxStyle}>
                    <div style={titleBoxHeadingStyle}>Bulletin de notes</div>
                    <div style={titleBoxSemesterStyle}>Semestre 5</div>
                  </div>
                ) : (
                  <div style={headerTitleBoxStyle}>
                    <div style={titleBoxHeadingStyle}>{translateDocType(request.documentType)}</div>
                    <div style={titleBoxSemesterStyle}>Service Scolarité</div>
                  </div>
                )}
                
                <div style={{ ...metaListStyle, marginTop: '12px' }}>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Année académique :</span> <span style={metaValueStyle}>{student.cohortName.replace('Année académique ', '')}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Matricule :</span> <span style={metaValueStyle}>{student.studentId}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Prénom et nom :</span> <span style={metaValueStyle}>{student.firstName} {student.lastName}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Sexe :</span> <span style={metaValueStyle}>{student.sexe || 'Masculin'}</span></div>
                  <div style={metaItemStyle}><span style={metaLabelStyle}>Né(e) le :</span> <span style={metaValueStyle}>{student.birthDate || '12/10/1998'} à {student.birthPlace || 'Golmy'}</span></div>
                </div>
              </div>
            </div>

            {/* Document body content */}
            <div style={{ marginTop: '20px' }}>
              {request.documentType === 'report_card' && academic && (
                <div>
                  <table style={academicTableStyles}>
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>UE / Eléments constitutifs</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>MCC 40%</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Examen 60%</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Moy EC</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Coef EC</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Moyenne Coef</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>Crédit UE</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Moyenne UE</th>
                        <th style={{ width: '12%', textAlign: 'center' }}>Appréciation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academic.ueList.map(ue => (
                        <React.Fragment key={ue.code}>
                          {/* UE Header row */}
                          <tr style={ueRowHeaderStyle}>
                            <td colSpan="6"><strong>{ue.code} {ue.name}</strong></td>
                            <td style={{ textAlign: 'center' }}><strong>{ue.credit.toFixed(2)}</strong></td>
                            <td style={{ textAlign: 'center' }}><strong>{ue.average.toFixed(2)}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={validationLabelStyle}>
                                {ue.validated ? 'Validée' : 'Ajournée'}
                              </span>
                            </td>
                          </tr>
                          
                          {/* EC Elements rows */}
                          {ue.grades.map(g => (
                            <tr key={g.id}>
                              <td style={{ paddingLeft: '20px' }}>{g.subject}</td>
                              <td style={{ textAlign: 'center' }}>{g.mcc.toFixed(2)}</td>
                              <td style={{ textAlign: 'center' }}>{g.exam.toFixed(2)}</td>
                              <td style={{ textAlign: 'center', fontWeight: '500' }}>{g.score.toFixed(2)}</td>
                              <td style={{ textAlign: 'center' }}>{g.coefficient.toFixed(2)}</td>
                              <td style={{ textAlign: 'center' }}>{(g.score * g.coefficient).toFixed(2)}</td>
                              <td colSpan="3" style={{ borderTop: 'none', borderBottom: 'none', backgroundColor: '#fff' }}></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Semestre summary footer metrics */}
                  <div style={summaryWrapperStyle}>
                    <div style={summaryLeftColStyle}>
                      <div style={summaryRowLineStyle}>
                        <span>Total crédits obtenus :</span>
                        <strong>{academic.totalCredits.toFixed(2)} / {academic.maxCredits ? academic.maxCredits.toFixed(2) : '30.00'}</strong>
                      </div>
                      <div style={summaryRowLineStyle}>
                        <span>Moyenne du semestre :</span>
                        <strong>{academic.annualAverage.toFixed(2)} / 20</strong>
                      </div>
                      <div style={summaryRowLineStyle}>
                        <span>Décision du jury :</span>
                        <strong>{academic.annualValidated ? 'Bon Travail' : 'Rattrapage'}</strong>
                      </div>
                    </div>
                    
                    {/* Visual QR Code verification block */}
                    <div style={docQrCodeBlockStyle}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>[ QR CODE ]</div>
                      <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '2px' }}>Verify @ groupeisi.com</div>
                    </div>
                  </div>

                  {/* Summary grid block (Récapitulatif des UEs) */}
                  <table style={recapTableStyles}>
                    <thead>
                      <tr>
                        <th style={{ width: '20%' }}>Récapitulatifs des unités</th>
                        {academic.ueList.map((ue, idx) => (
                          <th key={ue.code}>UE {idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Moyennes</td>
                        {academic.ueList.map(ue => (
                          <td key={ue.code} style={{ fontWeight: '600' }}>{ue.average.toFixed(2)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Validations</td>
                        {academic.ueList.map(ue => (
                          <td key={ue.code}>
                            <span style={ue.validated ? validatedCellBadge : rejectedCellBadge}>
                              {ue.validated ? 'Validée' : 'Rattrapage'}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Crédits obtenus</td>
                        {academic.ueList.map(ue => (
                          <td key={ue.code} style={{ fontWeight: '600' }}>{ue.creditsObtained.toFixed(2)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {request.documentType === 'enrollment_certificate' && (
                <div style={certBodyStyle}>
                  <h4 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '24px', fontSize: '1.1rem', letterSpacing: '0.05em' }}>ATTESTATION D'INSCRIPTION</h4>
                  <p>
                    La Directrice des Études du Groupe ISI (Institut Supérieur d'Informatique) certifie par la présente que l'étudiant(e) susmentionné(e) est régulièrement inscrit(e) au sein de notre établissement pour l'année universitaire en cours.
                  </p>
                  <p style={{ marginTop: '16px' }}>
                    L'étudiant(e) suit les enseignements de la licence en <strong>{student.specialty}</strong> (Domaine: {student.domaine}, Mention: {student.mention}).
                  </p>
                  <p style={{ marginTop: '24px' }}>
                    Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
                  </p>
                </div>
              )}

              {request.documentType === 'internship_certificate' && (
                <div style={certBodyStyle}>
                  <h4 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '24px', fontSize: '1.1rem', letterSpacing: '0.05em' }}>ATTESTATION DE VALIDATION DE STAGE</h4>
                  <p>
                    Le Département des Études Académiques du Groupe ISI certifie que l'étudiant(e) susmentionné(e) a validé l'ensemble des modules obligatoires ainsi que le stage pratique requis dans le cadre de sa formation de <strong>Licence en Informatique</strong>.
                  </p>
                  <p style={{ marginTop: '16px' }}>
                    Le stage industriel de fin de cycle a été soutenu avec succès devant le jury d'examen de l'établissement.
                  </p>
                  <p style={{ marginTop: '24px' }}>
                    Cette attestation lui est remise pour servir et valoir ce que de droit.
                  </p>
                </div>
              )}

              {request.documentType === 'transcript' && academic && (
                <div>
                  <h4 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '20px', fontSize: '1.1rem', letterSpacing: '0.05em' }}>RELEVÉ DE NOTES GLOBAL</h4>
                  <table style={academicTableStyles}>
                    <thead>
                      <tr>
                        <th>Code UE</th>
                        <th>Intitulé de l'Unité d'Enseignement</th>
                        <th style={{ textAlign: 'center', width: '100px' }}>Moyenne UE</th>
                        <th style={{ textAlign: 'center', width: '100px' }}>Crédits</th>
                        <th style={{ textAlign: 'center', width: '120px' }}>Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academic.ueList.map(ue => (
                        <tr key={ue.code}>
                          <td><strong>{ue.code}</strong></td>
                          <td>{ue.name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{ue.average.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>{ue.credit.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={ue.validated ? validatedCellBadge : rejectedCellBadge}>
                              {ue.validated ? 'ADMIS' : 'AJOURNÉ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={summaryWrapperStyle}>
                    <div style={summaryLeftColStyle}>
                      <div style={summaryRowLineStyle}>
                        <span>Moyenne générale annuelle :</span>
                        <strong>{academic.annualAverage.toFixed(2)} / 20</strong>
                      </div>
                      <div style={summaryRowLineStyle}>
                        <span>Crédits validés :</span>
                        <strong>{academic.totalCredits.toFixed(2)} / {academic.maxCredits ? academic.maxCredits.toFixed(2) : '30.00'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stamp and Signature Section */}
            <div style={docFooterStyle}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fait à Dakar, le {currentDate}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Document certifié conforme et signé numériquement.</span>
              </div>
              <div style={signatureBlockStyle}>
                <strong>La Directrice des Études</strong>
                <div style={signatureSpaceStyle}></div>
                <div style={stampBoxStyle}>GROUPE ISI DAKAR</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>Aissatou Diaby GASSAMA</div>
              </div>
            </div>

            {/* School bottom contact info banner */}
            <div style={footerInfoStyle}>
              Km1, avenue Cheikh Anta Diop, Dakar, Sénégal • Tél: +221 33 822 19 81 • E-mail: contact@groupeisi.sn<br />
              Web site: www.groupeisi.sn • ISI Secured Digital Academic Records
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Fermer</button>
          <button onClick={handlePrint} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Imprimer / Exporter PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Layout styling variables
const docWrapperStyle = {
  backgroundColor: '#f1f5f9',
  padding: '30px 10px',
  maxHeight: '65vh',
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
};

const docPaperStyle = {
  backgroundColor: 'white',
  width: '100%',
  maxWidth: '780px',
  padding: '30px',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid #000',
  color: '#000',
  fontFamily: "'Inter', sans-serif",
};

const docHeaderGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  border: '1.5px solid #000',
  marginBottom: '20px',
};

const headerLeftColStyle = {
  padding: '16px',
  borderRight: '1.5px solid #000',
};

const headerRightColStyle = {
  padding: '16px',
  backgroundColor: '#fafafa',
};

const logoBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  border: '2px solid #000',
  padding: '8px 12px',
  width: '110px',
  textAlign: 'center',
  marginBottom: '12px',
};

const logoGroupStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  letterSpacing: '0.05em',
  color: '#1e3a8a',
  lineHeight: '1',
};

const logoIsiStyle = {
  fontSize: '1.8rem',
  fontWeight: '900',
  lineHeight: '1',
  borderTop: '1.5px solid #000',
  marginTop: '2px',
  paddingTop: '2px',
};

const metaListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const metaItemStyle = {
  display: 'flex',
  fontSize: '0.75rem',
  lineHeight: '1.3',
};

const metaLabelStyle = {
  fontWeight: '700',
  width: '130px',
  flexShrink: 0,
};

const metaValueStyle = {
  fontWeight: '500',
};

const headerTitleBoxStyle = {
  backgroundColor: '#0f172a',
  color: 'white',
  textAlign: 'center',
  padding: '10px',
  borderRadius: '4px',
};

const titleBoxHeadingStyle = {
  fontSize: '1rem',
  fontWeight: '900',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const titleBoxSemesterStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  marginTop: '2px',
};

const academicTableStyles = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '16px',
  fontSize: '0.75rem',
};

const ueRowHeaderStyle = {
  backgroundColor: '#f1f5f9',
  fontWeight: 'bold',
};

const validationLabelStyle = {
  fontWeight: '700',
  textTransform: 'uppercase',
  fontSize: '0.7rem',
};

const summaryWrapperStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1.5px solid #000',
  padding: '12px 16px',
  marginBottom: '20px',
};

const summaryLeftColStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flexGrow: 1,
  fontSize: '0.8rem',
};

const summaryRowLineStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '380px',
};

const docQrCodeBlockStyle = {
  width: '90px',
  height: '90px',
  border: '1px solid #000',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: '0.5rem',
  color: '#64748b',
  marginLeft: '20px',
  gap: '2px',
};

const recapTableStyles = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.7rem',
  textAlign: 'center',
  marginBottom: '16px',
};

const validatedCellBadge = {
  backgroundColor: '#000',
  color: '#fff',
  fontWeight: 'bold',
  padding: '2px 6px',
  fontSize: '0.65rem',
  textTransform: 'uppercase',
};

const rejectedCellBadge = {
  backgroundColor: '#64748b',
  color: '#fff',
  fontWeight: 'bold',
  padding: '2px 6px',
  fontSize: '0.65rem',
  textTransform: 'uppercase',
};

const docFooterStyle = {
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const signatureBlockStyle = {
  textAlign: 'right',
  fontSize: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
};

const signatureSpaceStyle = {
  height: '35px',
};

const stampBoxStyle = {
  border: '2px double #1e3a8a',
  color: '#1e3a8a',
  fontWeight: '800',
  fontSize: '0.65rem',
  padding: '3px 6px',
  borderRadius: '4px',
  transform: 'rotate(-4deg)',
  display: 'inline-block',
  textTransform: 'uppercase',
};

const footerInfoStyle = {
  borderTop: '1px solid #000',
  paddingTop: '8px',
  marginTop: '24px',
  fontSize: '0.65rem',
  color: '#64748b',
  textAlign: 'center',
  lineHeight: '1.4',
};

const certBodyStyle = {
  padding: '30px 10px',
  lineHeight: '1.8',
  fontSize: '0.88rem',
  textAlign: 'justify',
};
