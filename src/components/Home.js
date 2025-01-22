import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";
import Tutor from "./Tutor";
import Resident from "./Resident";
import Announcement from "./Announcement";
import TemplateForms from "./TemplateForms";

const Home = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className={`background ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="logo-container">
        <img src={logo} alt="logo" className="logo" />
        <button 
          className="theme-toggle"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? '☾' : '☼'}
        </button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <div className={`main-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div
          className="container"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <Tutor isDarkMode={isDarkMode} />
          <Resident isDarkMode={isDarkMode} />
          <Announcement isDarkMode={isDarkMode} />
          <TemplateForms isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default Home;
