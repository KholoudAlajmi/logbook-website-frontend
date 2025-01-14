import React, { useState } from "react";
import "../App.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(""); // Add error state

  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', {
        username: userInfo.username,
        password: userInfo.password
      });

      // Store token
      localStorage.setItem('token', response.data.token);
      console.log('Token stored:', response.data.token); // Debug log

      // Navigate to home page
      navigate("/home");
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Login failed");
      setUserInfo({ username: "", password: "" });
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
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleFormSubmit}>
              <div className="input">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  required
                  value={userInfo.username}
                  onChange={(e) => {
                    setUserInfo({...userInfo, username: e.target.value});
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
                disabled={!userInfo.username || !userInfo.password}
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
