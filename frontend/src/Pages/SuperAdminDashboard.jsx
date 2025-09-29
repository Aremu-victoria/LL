import React from 'react';
import TeacherDashboard from './TeacherDashboard';

// Super admins should have access to the same capabilities as teachers.
// Reuse the TeacherDashboard component so we don't duplicate logic.
// Note: TeacherDashboard already shows an extra "Create Staff Account"
// section when localStorage.userRole === 'superadmin'.
const SuperAdminDashboard = () => {
  return <TeacherDashboard />;
};

export default SuperAdminDashboard;

