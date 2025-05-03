import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";
import Tutor from "./Tutor";
import Resident from "./Resident";
import Announcement from "./Announcement";
import TemplateForms from "./TemplateForms";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  const handleLogout = () => {
    navigate("/");
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="background">
      <div className="logo-container">
        <img src={logo} alt="logo" className="logo" />
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      
     
      
      {/* Sidebar with active highlighting */}
      <div className="sidebar" style={{ left: isVisible ? 0 : "-150px", transition: "left 0.3s ease" }}>
        <div className={`card ${location.pathname === '/home' ? 'active' : ''}`} onClick={() => navigate("/home")}>
          <h2>Home</h2>
        </div>
        <div className={`card ${location.pathname === '/tutor' ? 'active' : ''}`} onClick={() => navigate("/tutor")}>
          <h2>Tutor</h2>
        </div>
        <div className={`card ${location.pathname === '/resident' ? 'active' : ''}`} onClick={() => navigate("/resident")}>
          <h2>Resident</h2>
        </div>
        <div className={`card ${location.pathname === '/announcement' ? 'active' : ''}`} onClick={() => navigate("/announcement")}>
          <h2>Announcement</h2>
        </div>
        <div className={`card ${location.pathname === '/form' ? 'active' : ''}`} onClick={() => navigate("/form")}>
          <h2>Template Forms</h2>
        </div>
      </div>

      <div className="main-container" style={{ marginLeft: isVisible ? "160px" : "10px", width: isVisible ? "calc(100% - 160px)" : "calc(100% - 10px)", transition: "all 0.3s ease" }}>
        <div
          className="container"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }} 
        >
           {/* Toggle button for the sidebar */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          top: "100px",
          left: isVisible ? "120px" : "20px",
          background: "transparent",
          color: isVisible ? "white" : "black",
          border: isVisible ? "white solid 1px" : "black solid 1px",
          padding: "3px 6px",
          borderRadius: "4px",
          fontSize: "12px",
          cursor: "pointer",
          zIndex: 1500,
          transition: "left 0.3s ease"
        }}
      >
        {isVisible ? "<" : ">"}
      </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
