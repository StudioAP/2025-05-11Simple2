// Placeholder for PageLoader
import React from 'react';

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>{message || 'Loading...'}</div>
    </div>
  );
};

export default PageLoader;
