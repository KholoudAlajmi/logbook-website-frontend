
import { useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";
import Tutor from "./Tutor";
import Resident from "./Resident";
import Announcement from "./Announcement";
import TemplateForms from "./TemplateForms";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };
  return (
    <div className="background">
      <img src={logo} alt="logo" className="logo" />
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <div className="main-container">
        <div
          className="container"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <Tutor />
          <Resident />
          <Announcement />
          <TemplateForms/>
        </div>
      </div>
    </div>
  );
};

export default Home;
