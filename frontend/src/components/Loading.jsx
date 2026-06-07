import React from 'react';

const Loading = ({ message = 'Loading details, please wait...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{message}</p>
    </div>
  );
};

export default Loading;
