import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Homepage from './Pages/Homepage'
import Signin from './Pages/Forms/Signin'
import StudentSignin from './Pages/Forms/StudentSignin'
import StaffSignin from './Pages/Forms/StaffSignin'
import Signup from './Pages/Forms/Signup'
import ForgotPassword from './Pages/Forms/ForgotPassword'
import ResetPassword from './Pages/Forms/ResetPassword'
import Main from './Components/MainSection'
import Dashboard from './Pages/Dashboard'
import TeacherDashboard from './Pages/TeacherDashboard'
import StudentDashboard from './Pages/StudentDashboard'
import SuperAdminDashboard from './Pages/SuperAdminDashboard'

// Basic auth utilities using localStorage
const getAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userDataRaw = localStorage.getItem('userData');
    const user = userDataRaw ? JSON.parse(userDataRaw) : null;
    const role = user?.type; // expected: 'student' | 'teacher' | 'superadmin'
    return { token, role };
  } catch {
    return { token: null, role: null };
  }
};

// Role-based guard
const RequireAuth = ({ children, allow = ['student','teacher','superadmin'] }) => {
  const { token, role } = getAuth();
  if (!token || !role) {
    // Not logged in: decide where to send them
    return <Navigate to="/student-login" replace />;
  }
  if (!allow.includes(role)) {
    // Wrong role -> send to appropriate login page
    if (role === 'student') return <Navigate to="/student-login" replace />;
    if (role === 'teacher' || role === 'superadmin') return <Navigate to="/staff-login" replace />;
    return <Navigate to="/student-login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        {/* <Route path='/Signin' element={<Signin/>}/> */}
        <Route path='/student-login' element={<StudentSignin/>}/>
        <Route path='/staff-login' element={<StaffSignin/>}/>
        <Route path='/Signup' element={<Signup/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password/:token' element={<ResetPassword/>}/>
        {/* Generic dashboard: any logged-in user */}
        <Route path='/dashboard' element={
          <RequireAuth>
            <Dashboard/>
          </RequireAuth>
        }/>
        {/* Teacher or Superadmin only */}
        <Route path='/teacher-dashboard' element={
          <RequireAuth allow={['teacher','superadmin']}>
            <TeacherDashboard/>
          </RequireAuth>
        }/>
        {/* Student only */}
        <Route path='/student-dashboard' element={
          <RequireAuth allow={['student']}>
            <StudentDashboard/>
          </RequireAuth>
        }/>
        {/* Superadmin only */}
        <Route path='/superadmin-dashboard' element={
          <RequireAuth allow={['superadmin']}>
            <SuperAdminDashboard/>
          </RequireAuth>
        }/>
      </Routes>
    </>
  )
}

export default App