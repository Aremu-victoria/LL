import { StrictMode, useEffect } from 'react'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import 'animate.css';

function Main() {
  useEffect(() => {
    AOS.init();
  }, []);
  return (
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(
  <Main />
)
