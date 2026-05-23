import React from 'react';
import { Outlet } from 'react-router-dom';

const PrincipalLayout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Outlet />
    </div>
  );
};

export default PrincipalLayout;
