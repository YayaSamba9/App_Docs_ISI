import React from 'react';

export default function StatsCard({ title, value, icon, description, statusType }) {
  // Map statusType to accent colors
  const getColorScheme = () => {
    switch (statusType) {
      case 'primary': return { border: '1px solid #dbeafe', bg: '#eff6ff', iconColor: '#2563eb' };
      case 'success': return { border: '1px solid #bfdbfe', bg: '#eff6ff', iconColor: '#0e294b' }; // Deep navy blue
      case 'warning': return { border: '1px solid #93c5fd', bg: '#dbeafe', iconColor: '#1d4ed8' }; // Strong blue
      case 'danger': return { border: '1px solid #cbd5e1', bg: '#f1f5f9', iconColor: '#64748b' };  // Slate gray
      case 'purple': return { border: '1px solid #bfdbfe', bg: '#eff6ff', iconColor: '#2563eb' };  // Brand blue
      default: return { border: '1px solid #f1f5f9', bg: '#f8fafc', iconColor: '#475569' };
    }
  };

  const scheme = getColorScheme();

  return (
    <div className="card" style={{ ...cardStyle, borderLeft: `4px solid ${scheme.iconColor}` }}>
      <div style={contentRowStyle}>
        <div style={textContainerStyle}>
          <div style={titleStyle}>{title}</div>
          <div style={valueStyle}>{value}</div>
          {description && <div style={descStyle}>{description}</div>}
        </div>
        <div style={{ ...iconContainerStyle, backgroundColor: scheme.bg, color: scheme.iconColor }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '20px',
  height: '110px',
};

const contentRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
};

const textContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const valueStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  lineHeight: '1',
};

const descStyle = {
  fontSize: '0.72rem',
  color: 'var(--text-light)',
  marginTop: '4px',
};

const iconContainerStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
