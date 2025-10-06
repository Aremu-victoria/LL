import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import '../../App.css';

const SuperAdminSignin = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let timer;
    if (serverError || successMsg) {
      timer = setTimeout(() => { setServerError(''); setSuccessMsg(''); }, 4000);
    }
    return () => clearTimeout(timer);
  }, [serverError, successMsg]);

  const formik = useFormik({
    initialValues: { identifier: '', password: '' },
    validationSchema: Yup.object({
      identifier: Yup.string().required('Email or ID is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async values => {
      try {
        const res = await axios.post('https://ll-3.onrender.com/api/signin', { identifier: values.identifier, password: values.password });
        const role = res.data.user?.type;
        if (role !== 'superadmin') {
          setServerError('Only super admin can login here.');
          return;
        }
        setSuccessMsg(res.data.message || 'Login successful!');
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userRole', role);
        }
        setTimeout(() => navigate('/superadmin-dashboard'), 800);
      } catch (err) {
        setServerError(err.response?.data?.error || 'Login failed');
      }
    }
  });

  return (
    <div className="signin-bg d-flex justify-content-center align-items-center min-vh-100">
      <div className="signin-card d-flex flex-column flex-md-row shadow-lg rounded-4 overflow-hidden position-relative">
        {/* Left: Form */}
        <div className="signin-form-col bg-white p-4 d-flex flex-column justify-content-center align-items-center position-relative" style={{flex: 1, minWidth: 320, maxWidth: 420}}>
          {/* Back Arrow */}
          <button
            type="button"
            className="btn btn-link signin-back-arrow position-absolute top-0 start-0 m-2 p-0"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            <span aria-hidden="true" style={{fontSize: '1.7rem', color: '#1A2A80'}}>&#8592;</span>
          </button>
          <div className="w-100">
            <div className="text-center fw-bold fs-2 mb-1" style={{letterSpacing: '1px'}}>LOGIN</div>
            <div className="text-center mb-4" style={{color: '#2196f3', fontWeight: 600, fontSize: '1.2rem'}}>¡Bienvenido/a!</div>
            {serverError && <div className="alert alert-danger py-2">{serverError}</div>}
            {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}
            <form className="d-flex flex-column gap-3" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="identifier" className="form-label fw-semibold">Email or ID</label>
                <input
                  name="identifier"
                  id="identifier"
                  type="text"
                  className={`form-control signin-input ${formik.touched.identifier && formik.errors.identifier ? 'is-invalid' : ''}`}
                  placeholder="Tu usuario o correo"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.identifier}
                  style={{fontFamily: 'monospace'}}
                />
                {formik.touched.identifier && formik.errors.identifier ? (
                  <div className="invalid-feedback d-block">{formik.errors.identifier}</div>
                ) : null}
              </div>
              <div>
                <label htmlFor="password" className="form-label fw-semibold">password</label>
                <input
                  name="password"
                  id="password"
                  type="password"
                  className={`form-control signin-input ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                  placeholder="Tu contraseña"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="invalid-feedback d-block">{formik.errors.password}</div>
                ) : null}
              </div>
              <button type="submit" className="btn signin-btn w-100 mt-2">Login</button>
            </form>
            {/* <div className="text-center mt-3" style={{fontSize: '0.98rem'}}>
              ¿No tienes una cuenta?{' '}
              <a href="/signup" className="signin-link">Registrate</a>
            </div> */}
            <Link className="d-block text-end text-primary mt-2" to="/forgot-password">Forgot Password?</Link>
          </div>
        </div>
        {/* Right: Image/Branding */}
        <div className="signin-img-col d-none d-md-flex flex-column justify-content-center align-items-center position-relative" style={{flex: 1, background: '#23a6e0', minWidth: 340, minHeight: 420}}>
          <div className="signin-logo mb-3 mt-4">
            <span style={{fontWeight: 700, fontSize: '2rem', color: 'white', letterSpacing: '1px'}}>Fibertel</span>
            <span style={{fontSize: '0.9rem', color: 'white', marginLeft: 6}}>NETWORKS</span>
          </div>
          <div className="signin-img-circle position-relative d-flex align-items-center justify-content-center">
            <img src="/src/assets/hero.png" alt="Super Admin" className="signin-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSignin;
