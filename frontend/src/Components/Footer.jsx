import React from 'react'

const Footer = () => {
  return (
    <div>
    <footer className="bg-dark text-light pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row">
          {/* About Section */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">About Us</h5>
            <p className="small">
              Our platform empowers teachers and students by simplifying the way
              educational resources are shared, organized, and accessed.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#features" className="text-light text-decoration-none">
                  Features
                </a>
              </li>
              <li>
                <a href="#howItWorks" className="text-light text-decoration-none">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#contact" className="text-light text-decoration-none">
                  Contact
                </a>
              </li>
              <li>
                <a href="/login" className="text-light text-decoration-none">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Follow Us</h5>
            <div className="d-flex gap-3">
              <a
                href="https://facebook.com"
                className="text-light fs-4"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a
                href="https://twitter.com"
                className="text-light fs-4"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a
                href="https://instagram.com"
                className="text-light fs-4"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="https://linkedin.com"
                className="text-light fs-4"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-light" />

        <div className="text-center small">
          © {new Date().getFullYear()} EduPlatform. All Rights Reserved.
        </div>
      </div>
    </footer>
    </div>
  )
}

export default Footer