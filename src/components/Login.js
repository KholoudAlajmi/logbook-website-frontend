import React, { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      navigate("/home");
    }
  };

  const isFormValid = () => {
    return userInfo.name.trim() !== "" && userInfo.password.trim() !== "";
  };

  return (
    <div className="background">
      <div className="split-container">
        <div className="welcome-side">
          <h1 className="welcome-text">Welcome to</h1>
          <h1 className="welcome-text">KBOG</h1>
        </div>

        <div className="login-side">
          <div className="login-box">
            <div className="text">Login</div>
            <form onSubmit={handleFormSubmit}>
              <div className="input">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                />
              </div>
              <div className="input">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={userInfo.password}
                  onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="submit"
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
