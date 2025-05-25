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
                        gap: "15px",
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
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <p>Loading form data...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ 
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <h4 style={{ 
                                        color: '#2c3e50',
                                        marginBottom: '16px',
                                        fontWeight: '600'
                                    }}>Score Type: {formData?.score}</h4>
                                    {formData?.score && (
                                        <div style={{ 
                                            background: '#f8f9fa',
                                            padding: '16px',
                                            borderRadius: '6px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <h5 style={{ 
                                                color: '#2c3e50',
                                                marginBottom: '12px',
                                                fontWeight: '600'
                                            }}>Scale Description:</h5>
                                            <pre style={{ 
                                                whiteSpace: 'pre-wrap',
                                                fontFamily: 'inherit',
                                                margin: 0,
                                                color: '#495057'
                                            }}>{formData?.scaleDescription}</pre>
                                        </div>
                                    )}
                                </div>

                                <div style={{ 
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <h4 style={{ 
                                        color: '#2c3e50',
                                        marginBottom: '20px',
                                        fontWeight: '600'
                                    }}>Form Fields:</h4>
                                    {formData?.fieldTemplates?.map((field, index) => (
                                        <div key={index} style={{ 
                                            background: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '6px',
                                            marginBottom: '16px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <h5 style={{ 
                                                color: '#2c3e50',
                                                marginBottom: '16px',
                                                fontWeight: '600',
                                                borderBottom: '2px solid #e9ecef',
                                                paddingBottom: '8px'
                                            }}>Field {index + 1}: {field.name}</h5>
                                            <div style={{ 
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '16px'
                                            }}>
                                                <p style={{ margin: 0, color: '#495057' }}>
                                                    <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Type:</strong> {field.type}
                                                </p>
                                                <p style={{ margin: 0, color: '#495057' }}>
                                                    <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Position:</strong> {field.position}
                                                </p>
                                                <p style={{ margin: 0, color: '#495057' }}>
                                                    <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Response:</strong> {field.response}
                                                </p>
                                                <p style={{ margin: 0, color: '#495057' }}>
                                                    <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Section:</strong> {field.section}
                                                </p>
                                                {field.hasDetails && (
                                                    <p style={{ margin: 0, color: '#495057' }}>
                                                        <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Details:</strong> {field.details}
                                                    </p>
                                                )}
                                                {(field.type === 'select' || field.type === 'checkbox') && field.options && (
                                                    <div>
                                                        <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Options:</strong>
                                                        <ul style={{ 
                                                            margin: '8px 0',
                                                            paddingLeft: '20px',
                                                            color: '#495057'
                                                        }}>
                                                            {field.options.map((option, optIndex) => (
                                                                <li key={optIndex} style={{ margin: '4px 0' }}>{option}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {field.type === 'scale' && field.scaleOptions && (
                                                    <div>
                                                        <strong style={{ color: '#2c3e50', fontWeight: '600' }}>Scale Options:</strong>
                                                        <ul style={{ 
                                                            margin: '8px 0',
                                                            paddingLeft: '20px',
                                                            color: '#495057'
                                                        }}>
                                                            {field.scaleOptions.map((option, optIndex) => (
                                                                <li key={optIndex} style={{ margin: '4px 0' }}>{option}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ 
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '24px',
                                    paddingTop: '24px',
                                    borderTop: '1px solid #e9ecef'
                                }}>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => navigate('/form')}
                                        style={{ padding: '8px 24px', fontWeight: '500' }}
                                    >
                                        Back to Forms
                                    </Button>
                                    <Button 
                                        variant="primary"
                                        onClick={() => navigate(`/edit-form/${formId}`)}
                                        style={{ padding: '8px 24px', fontWeight: '500' }}
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