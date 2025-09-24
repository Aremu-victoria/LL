import { Link } from "react-router-dom";

const MainSection = () => {
  return (
    <div className="container py-5">
      {/* Features Section */}
      <section id="features" className="mb-5" style={{ marginTop: "50px" }}>
        <h2 className="fw-bold text-center mb-4">Key Features</h2>
        <div className="row g-4 md:px-5 md:mx-5 ">
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 text-center p-4">
              <div className="mb-3">
                <span
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px", fontSize: "2rem" }}
                >
                  <i className="bi bi-cloud-upload"></i>
                </span>
              </div>
              <h5 className="card-title">Seamless Upload</h5>
              <p className="card-text">
                Upload notes, assignments, and multimedia with drag-and-drop,
                instant previews, and real-time progress.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 text-center p-4">
              <div className="mb-3">
                <span
                  className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px", fontSize: "2rem" }}
                >
                  <i className="bi bi-layers"></i>
                </span>
              </div>
              <h5 className="card-title">Smart Organization</h5>
              <p className="card-text">
                Automatically categorize by subject, class, or semester with
                advanced search, filters, and tags.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 text-center p-4">
              <div className="mb-3">
                <span
                  className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px", fontSize: "2rem" }}
                >
                  <i className="bi bi-lock"></i>
                </span>
              </div>
              <h5 className="card-title">Secure & Private</h5>
              <p className="card-text">
                Data is encrypted, access-controlled, and backed up to ensure
                privacy and protection at all times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Accordion) */}
      <section className="mb-5" style={{ marginTop: "100px" }}>
        <h2 className="fw-bold text-center mb-4">How It Works</h2>
        <div className="accordion" id="howItWorksAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="stepOne">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                1. Sign Up
              </button>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse show"
              aria-labelledby="stepOne"
              data-bs-parent="#howItWorksAccordion"
            >
              <div className="accordion-body">
                Register as a teacher or student to start using the platform.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="stepTwo">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                2. Login
              </button>
            </h2>
            <div
              id="collapseTwo"
              className="accordion-collapse collapse"
              aria-labelledby="stepTwo"
              data-bs-parent="#howItWorksAccordion"
            >
              <div className="accordion-body">
                Securely log in and access your personalized dashboard.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="stepThree">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree"
              >
                3. Upload & Access
              </button>
            </h2>
            <div
              id="collapseThree"
              className="accordion-collapse collapse"
              aria-labelledby="stepThree"
              data-bs-parent="#howItWorksAccordion"
            >
              <div className="accordion-body">
                Upload materials or access shared resources with ease.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="stepFour">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFour"
                aria-expanded="false"
                aria-controls="collapseFour"
              >
                4. Organize & Download
              </button>
            </h2>
            <div
              id="collapseFour"
              className="accordion-collapse collapse"
              aria-labelledby="stepFour"
              data-bs-parent="#howItWorksAccordion"
            >
              <div className="accordion-body">
                Search, organize, and download resources quickly and easily.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainSection;
