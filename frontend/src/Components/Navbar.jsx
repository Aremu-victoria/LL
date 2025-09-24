import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
        <nav className="navbar navbar-expand-lg bg-body-tertiary ">
  <div className="container">
    <a className="navbar-brand" href="#">LearnLink</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse gap-5 navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav mx-auto  mb-2 mb-lg-0">
        <li className="nav-item">
          <a className="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#about" onClick={e => {e.preventDefault(); document.getElementById('about').scrollIntoView({ behavior: 'smooth' });}}>About</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#features" onClick={e => {e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' });}}>Features</a>
        </li>
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            E-Portal
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <Link className="dropdown-item" to="/student-login">
                Student Login
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/staff-login">
                Staff Login
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link className="dropdown-item" to="/Signup">Create Account</Link>
            </li>
          </ul>
        </li>
      </ul>
      <div className="d-flex" role="search">
        <button className="btn btn" type="submit" style={{backgroundColor: "#1A2A80", color: "white"}} >
          <Link to="/signUp" className="text-decoration-none text-white">SignUp</Link></button>
          
      </div>
    </div>
  </div>
</nav>
    </>
  )
}

export default Navbar