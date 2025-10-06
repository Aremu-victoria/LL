import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Signin = () => {
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loginType, setLoginType] = useState('student'); // 'student' | 'staff' | 'admin'
  const [loading, setLoading] = useState(false); // Loader state

  useEffect(() => {
    let timer;
    if (serverError || successMsg) {
      timer = setTimeout(() => {
        setServerError('');
        setSuccessMsg('');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [serverError, successMsg]);

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      uniqueId: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: ['admin','staff'].includes(loginType) ? Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required') : Yup.string(),
      uniqueId: ['student','staff'].includes(loginType) ? Yup.string().required('Unique ID is required') : Yup.string(),
    }),
    onSubmit: async values => {
      setServerError('');
      setSuccessMsg('');
      setLoading(true); // Start loader

      try {
        let loginData;
        if (loginType === 'admin') {
          loginData = { email: values.email, password: values.password };
        } else if (loginType === 'staff') {
          loginData = { email: values.email, uniqueId: values.uniqueId, password: values.password };
        } else {
          loginData = { email: values.email, uniqueId: values.uniqueId };
        }

        const res = await axios.post('https://ll-3.onrender.com/api/signin', loginData);
        setSuccessMsg(res.data.message || 'Login successful!');

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          const userRole = res.data.user?.type || 'student';
          localStorage.setItem('userRole', userRole);
        }

        setTimeout(() => {
          const userRole = res.data.user?.type || 'student';
          if (userRole === 'superadmin' || userRole === 'teacher') {
            navigate('/teacher-dashboard');
          } else {
            navigate('/student-dashboard');
          }
        }, 1200);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setServerError(err.response.data.error);
        } else {
          setServerError('An unexpected error occurred.');
        }
      }
      setLoading(false); // Stop loader
    },
  });

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow rounded" style={{ width: '400px' }}>
        {serverError && <div className="alert alert-danger">{serverError}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="text-center fw-bold fs-4 mb-3">Welcome to EduHub!</div>

        {/* Login Type Toggle */}
        <div className="d-flex mb-4 gap-2">
          <button 
            type="button"
            className={`btn flex-fill ${loginType === 'student' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setLoginType('student')}
          >
            <i className="bi bi-person me-1"></i>
            Student
          </button>
          <button 
            type="button"
            className={`btn flex-fill ${loginType === 'staff' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setLoginType('staff')}
          >
            <i className="bi bi-briefcase me-1"></i>
            Staff
          </button>
          <button 
            type="button"
            className={`btn flex-fill ${loginType === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setLoginType('admin')}
          >
            <i className="bi bi-shield-lock me-1"></i>
            Super Admin
          </button>
        </div>

        <form className="d-flex flex-column gap-3" onSubmit={formik.handleSubmit}>
          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              name="email"
              id="email"
              type="email"
              className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback d-block">{formik.errors.email}</div>
            )}
          </div>

          {loginType !== 'admin' && (
            <div>
              <label htmlFor="uniqueId" className="form-label">Unique ID</label>
              <input
                name="uniqueId"
                id="uniqueId"
                type="text"
                className={`form-control ${formik.touched.uniqueId && formik.errors.uniqueId ? 'is-invalid' : ''}`}
                placeholder="Enter your unique ID"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.uniqueId}
                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
              />
              {formik.touched.uniqueId && formik.errors.uniqueId && (
                <div className="invalid-feedback d-block">{formik.errors.uniqueId}</div>
              )}
            </div>
          )}

          {loginType !== 'student' && (
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                name="password"
                id="password"
                type="password"
                className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback d-block">{formik.errors.password}</div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-lg w-100 mt-3" 
            style={{backgroundColor: "#1A2A80", color: "white", position: "relative"}}
            disabled={loading}
          >
            {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {loginType === 'admin' ? 'Sign In as Admin' : loginType === 'staff' ? 'Sign In as Staff' : 'Sign In as Student'}
          </button>
        </form>

        {loginType !== 'student' && (
          <a className="d-block text-end text-primary mt-2" href="/forgot-password">Forgot Password?</a>
        )}

        <div className="text-center mt-4">
          <small className="text-muted">
            {loginType === 'student' ? "Students: Use your email and issued ID." : loginType === 'staff' ? "Staff: Use email, ID and password." : "Super Admin access only"}
          </small>
        </div>
      </div>
    </div>
  );
}

export default Signin;
