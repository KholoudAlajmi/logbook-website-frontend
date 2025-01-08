import React, { useState } from "react";
import "../App.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import adminData from "../data/AdminData"; // Import admin data

const Login = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    password: "",
  });
  const [error, setError] = useState(""); // Add error state

  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Check if credentials match admin data
    const admin = adminData.find(
      admin => admin.name === userInfo.name && admin.password === userInfo.password
    );

    if (admin) {
      navigate("/home");
    } else {
      setError("Incorrect username or password");
      setUserInfo({ name: "", password: "" }); // Clear inputs on error
    }
  };

  return (
    <div className="background">
      <div className="split-container">
        <div className="welcome-side">
          <h1 className="welcome-text">Welcome to</h1>
          <img src={logo} alt="logo" style={{width:"200px", height:"150px", justifyContent:"center", alignItems:"center"}} />
        </div>

        <div className="login-side">
          <div className="login-box">
            <div className="text">Login</div>
            {error && <div className="error-message">{error}</div>} {/* Add error message display */}
            <form onSubmit={handleFormSubmit}>
              <div className="input">
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  required
                  value={userInfo.name}
                  onChange={(e) => {
                    setUserInfo({...userInfo, name: e.target.value});
                    setError(""); // Clear error when typing
                  }}
                />
              </div>
              <div className="input">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={userInfo.password}
                  onChange={(e) => {
                    setUserInfo({...userInfo, password: e.target.value});
                    setError(""); // Clear error when typing
                  }}
                />
              </div>
              <button 
                type="submit"
                className="submit"
                disabled={!userInfo.name || !userInfo.password}
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
