import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Signup = () => {
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      uniqueId: '',
      password: '',
      type: 'student',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().required('Phone is required'),
      uniqueId: Yup.string().required('Matric is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      type: Yup.string().oneOf(['student']).required(),
    }),
    onSubmit: async values => {
      setServerError('');
      setSuccessMsg('');
      setLoading(true); // Start loader
      try {
        const res = await axios.post('https://ll-2.onrender.com/api/signup', values);
        setSuccessMsg(res.data.message || 'Signup successful!');
        formik.resetForm();
        setTimeout(() => {
          navigate('/student-login');
        }, 1200);
      } catch (err) {
        if (err.response && err.response.data) {
          const data = err.response.data;
          if (data.errors && typeof data.errors === 'object') {
            formik.setErrors(data.errors);
            if (data.message) setServerError(data.message);
            setLoading(false);
            return;
          }
          if (data.error) { setServerError(data.error); setLoading(false); return; }
          if (data.message) { setServerError(data.message); setLoading(false); return; }
        }
        setServerError('An unexpected error occurred.');
      }
      setLoading(false); // Stop loader
    },
  });

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100 py-4 position-relative"
      style={{ backgroundColor: "#dbeafe" }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1,
        }}
      />
      <div className="card p-4 shadow rounded" style={{ width: '500px', zIndex: 2, position: 'relative' }}>
        <button
          type="button"
          className="btn btn-link signin-back-arrow position-absolute top-0 start-0 m-2 p-0"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <span aria-hidden="true" style={{ fontSize: '1.7rem', color: '#1A2A80' }}>&#8592;</span>
        </button>

        {serverError && <div className="alert alert-danger animate__animated animate__fadeOut">{serverError}</div>}
        {successMsg && <div className="alert alert-success animate__animated animate__heartBeat">{successMsg}</div>}

        <div className="text-center fw-bold fs-4 mb-3">Student Sign up</div>

        <form className="d-flex flex-column gap-3" onSubmit={formik.handleSubmit}>
          <div className="row mb-2">
            <div className="col">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                name="firstName"
                id="firstName"
                type="text"
                className={`form-control ${formik.touched.firstName && formik.errors.firstName ? 'is-invalid' : ''}`}
                placeholder="Enter your first name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="invalid-feedback d-block">{formik.errors.firstName}</div>
              )}
            </div>
            <div className="col">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                name="lastName"
                id="lastName"
                type="text"
                className={`form-control ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
                placeholder="Enter your last name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="invalid-feedback d-block">{formik.errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="email" className="form-label">Email</label>
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

          <div className="mb-2">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              name="phone"
              id="phone"
              type="text"
              className={`form-control ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
              placeholder="Enter your phone number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="invalid-feedback d-block">{formik.errors.phone}</div>
            )}
          </div>

          <div className="mb-2">
            <label htmlFor="uniqueId" className="form-label">Matric</label>
            <div className="input-group">
              <input
                name="uniqueId"
                id="uniqueId"
                type="text"
                className={`form-control ${formik.touched.uniqueId && formik.errors.uniqueId ? 'is-invalid' : ''}`}
                placeholder="e.g., STU-1A2B3C"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.uniqueId}
                style={{ fontFamily: 'monospace' }}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => {
                const hex = Array.from({ length: 6 }).map(() => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
                const candidate = `STU-${hex}`;
                formik.setFieldValue('uniqueId', candidate);
              }}>Generate</button>
            </div>
            {formik.touched.uniqueId && formik.errors.uniqueId && (
              <div className="invalid-feedback d-block">{formik.errors.uniqueId}</div>
            )}
          </div>

          <div className="mb-2">
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

          <input type="hidden" name="type" value="student" />

          <button
            type="submit"
            className="btn w-100 mt-2"
            style={{ backgroundColor: "#1A2A80", color: "white", position: "relative" }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2 " role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? "" : "Sign up"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?
          <Link className="text-primary ms-1" to="/student-login"> Sign in now</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
