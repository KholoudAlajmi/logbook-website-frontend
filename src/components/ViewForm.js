import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from '../api/axios';
import "../App.css";
import logo from "../assets/logo.png";

const ViewForm = () => {
    // Get formId from URL params
    const { formId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch form data when component mounts
    useEffect(() => {
        console.log('Loading form with ID:', formId);
        
        const fetchFormData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/formTemplates/${formId}`);
                console.log('Form data loaded:', response.data);
                setFormData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error loading form:', error);
                alert('Failed to load form: ' + (error.response?.data?.message || error.message));
                setLoading(false);
                // Navigate back to forms page on error
                navigate('/form');
            }
        };

        if (formId) {
            fetchFormData();
        } else {
            alert('No form ID provided');
            navigate('/form');
        }
    }, [formId, navigate]);

    const handleLogout = () => {
        navigate("/");
    };

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
                        flexDirection: "column",
                        alignItems: "center",
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

                    <div className="header-box">
                        <h2>Form Template: {formData?.formName}</h2>
                    </div>
                    
                    <div className="management-box" style={{ width: '90%', padding: '20px' }}>
                        {loading ? (
                            <div className="loading-container" style={{ textAlign: 'center', padding: '20px' }}>
                                <p>Loading form data...</p>
                            </div>
                        ) : (
                            <div className="form-details">
                                <div className="score-section">
                                    <h4>Score Type: {formData?.score}</h4>
                                    {formData?.score && (
                                        <div className="scale-description">
                                            <h5>Scale Description:</h5>
                                            <pre>{formData?.scaleDescription}</pre>
                                        </div>
                                    )}
                                </div>
                                <div className="fields-section">
                                    <h4>Form Fields:</h4>
                                    {formData?.fieldTemplates?.map((field, index) => (
                                        <div key={index} className="field-preview">
                                            <h5>Field {index + 1}: {field.name}</h5>
                                            <div className="field-details">
                                                <p><strong>Type:</strong> {field.type}</p>
                                                <p><strong>Position:</strong> {field.position}</p>
                                                <p><strong>Response:</strong> {field.response}</p>
                                                <p><strong>Section:</strong> {field.section}</p>
                                                {field.hasDetails && (
                                                    <p><strong>Details:</strong> {field.details}</p>
                                                )}
                                                {(field.type === 'select' || field.type === 'checkbox') && field.options && (
                                                    <div>
                                                        <strong>Options:</strong>
                                                        <ul>
                                                            {field.options.map((option, optIndex) => (
                                                                <li key={optIndex}>{option}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {field.type === 'scale' && field.scaleOptions && (
                                                    <div>
                                                        <strong>Scale Options:</strong>
                                                        <ul>
                                                            {field.scaleOptions.map((option, optIndex) => (
                                                                <li key={optIndex}>{option}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="action-buttons" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate('/form')}
                                    >
                                        Back to Forms
                                    </Button>
                                    <Button 
                                        variant="primary"
                                        onClick={() => navigate(`/edit-form/${formId}`)}
                                    >
                                        Edit Form
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewForm; 