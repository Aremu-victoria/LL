import { Link } from "react-router-dom";
import "./HeroSection.css";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section
      className="w-full min-h-screen flex py-5 p-5 flex-col items-center justify-center text-center px-6 hero-section"
      style={{ backgroundColor: "#E8E9EB" }}
    >
      <div className="container mx-auto p-5">
      <motion.h1
        className="text-3xl md:text-5xl w-75 font-bold text-gray-900  fw-bold  leading-tight center mx-auto"
        id="hero-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{fontSize: '3.1rem'}}
      >
        <span style={{ color: "#222"}}>Empowering Schools With{" "}</span>
        <span style={{ color: "#1A2A80"}}>Seamless Material Uploading</span>
      </motion.h1>

      <motion.p
        className="mt-6 text-lg md:text-xl text-gray-700 max-w-2xl"
        id="hero-desc"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{ width: '60%', margin: '20px auto', fontSize: '1.2rem' }}
      >
        A unified, secure platform for teachers and students to upload, organize,
        and access educational resources—anytime, anywhere.
      </motion.p>
        <motion.div
  className="mt-8 flex sm:flex-row justify-center gap-4 flex-col hero-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        style={{ justifyContent: 'center'}}
      >
        <motion.button
          className="btn btn px-4 me-2 mt-2"
          style={{ backgroundColor: "#1A2A80", color: "#fff" }}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/Signup" className="text-decoration-none text-white">
            Explore
          </Link>
        </motion.button>
        <motion.button
          className="btn btn mt-2"
          style={{ backgroundColor: "transparent", color: "#000", border: '2px solid #000' }}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/Signup" className="text-decoration-none text-black">
            Learn more
          </Link>
        </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
