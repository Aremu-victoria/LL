import React from 'react'
import { Route, Routes } from 'react-router-dom'
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
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/teacher-dashboard' element={<TeacherDashboard/>}/>
        <Route path='/student-dashboard' element={<StudentDashboard/>}/>
        <Route path='/superadmin-dashboard' element={<SuperAdminDashboard/>}/>
      </Routes>
    </>
  )
}

export default App