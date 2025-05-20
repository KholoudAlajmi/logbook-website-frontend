import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import "../App.css";
import api from '../api/axios';
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";

// Add custom styles for action buttons
const actionButtonStyles = `
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .edit-button, .delete-button {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    font-weight: 500;
  }
  
  .edit-button {
    background-color: #4285f4;
    color: white;
  }
  
  .delete-button {
    background-color: #ea4335;
    color: white;
  }
`;

const TemplateForms = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [formSearch, setFormSearch] = useState('');

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


    // Fetch forms
    const { data: forms, isLoading: formsLoading } = useQuery({
        queryKey: ['forms'],
        queryFn: async () => {
            try {
                const response = await api.get('/formTemplates');
                console.log('Fetched forms:', response.data); // Debug log
                return response.data;
            } catch (error) {
                console.error('Error fetching forms:', error);
                throw error;
            }
        }
    });

    // Filter forms
    const filterForms = (forms) => {
        if (!formSearch) return forms;
        return forms?.filter(form => 
            form.formName.toLowerCase().includes(formSearch.toLowerCase())
        );
    };


    const scaleDescription = "The purpose of this scale is to evaluate\nthe trainee's ability to perform this\nprocedure safely and independently.\nWith that in mind please use the\nscale below to evaluate each item,\nirrespective of the resident's level of\ntraining in regards to this case.\nScale:\n1 - \"I had to do\" - Requires complete hands on guidance, did not do, or was not given the opportunity to do\n2 - \"I had to talk them through\" - Able to perform tasks but requires constant direction\n3 - \"I had to prompt them from time to time\" - Demonstrates some independence, but requires intermittent direction\n4 - \"I needed to be in the room just in case\" - Independence but unaware of risks and still requires supervision for safe practice\n5 - \"I did not need to be there\" - Complete independence, understands risks and performs safely, practice ready"  

    // Add this mutation
    const addFormMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/formTemplates', formData);
            return response.data;
        },
        onSuccess: () => {
            alert('Form added successfully!');
            setShowModal({ type: '', action: '', show: false });
            setSelectedItem(null);
            queryClient.invalidateQueries(['forms']);
        },
        onError: (error) => {
            if (error.response?.data?.error === 'DUPLICATE_FORM_NAME') {
                alert('This form name already exists. Please choose a different name.');
            } else {
                alert('Failed to add form: ' + (error.response?.data?.message || error.message));
            }
        }
    });

    // Add delete mutation
    const deleteFormMutation = useMutation({
        mutationFn: async (formId) => {
            try {
                console.log('Deleting form with ID:', formId); // Debug log
                const response = await api.delete(`/formTemplates/${formId}`);
                return response.data;
            } catch (error) {
                console.error('Delete request error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['forms']);
            setShowModal({ type: '', action: '', show: false });
            alert('Form deleted successfully!');
        },
        onError: (error) => {
            console.error('Delete error:', error);
            alert('Failed to delete form: ' + (error.response?.data?.message || error.message));
        }
    });

    // Add update mutation
    const updateFormMutation = useMutation({
        mutationFn: async ({ formId, formData }) => {
            try {
                const response = await api.put(`/formTemplates/${formId}`, formData);
                return response.data;
            } catch (error) {
                console.error('Update request error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            alert('Form updated successfully!');
            setShowModal({ type: '', action: '', show: false });
            setSelectedItem(null);
            queryClient.invalidateQueries(['forms']);
        },
        onError: (error) => {
            console.error('Update error:', error);
            alert(error.response?.data?.message || 'Failed to update form');
        }
    });

    // Add deleteFieldMutation
    const deleteFieldMutation = useMutation({
        mutationFn: async (fieldId) => {
            if (!fieldId) {
                throw new Error('No field ID provided');
            }
            console.log('Deleting field:', fieldId); // Debug log
            try {
                const response = await api.delete(`/fieldTemplate/${fieldId}`);
                return response.data;
            } catch (error) {
                console.error('Delete request error:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('Field deleted successfully:', data); // Debug log
            queryClient.invalidateQueries(['forms']);
        },
        onError: (error) => {
            console.error('Delete field error:', error);
            alert('Failed to delete field: ' + (error.response?.data?.message || error.message));
        }
    });

    // Add handleDelete function
    const handleDelete = async (id) => {
        if (!id) {
            console.error('No form ID provided');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete this form? This action cannot be undone.`)) {
            try {
                await deleteFormMutation.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete form:', error);
                alert('Error deleting form: ' + (error.response?.data?.message || error.message));
            }
        }
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

        {/* Apply custom styles */}
        <style>{actionButtonStyles}</style>

        <div className="header-box">
            <div className="search-container">
                <div className="search-wrapper">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search forms..."
                            value={formSearch}
                            onChange={(e) => setFormSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        className="add-button-small"
                        onClick={() => {
                            navigate('/add-form');
                        }}
                    >
                        + Add Form
                    </button>
                </div>
            </div>
            </div>
            <div className="management-box">
            <div className="content">
                {formsLoading ? (
                    <p>Loading forms...</p>
                ) : (
                    filterForms(forms || []).map((form) => (
                        <div key={form._id} className="item">
                            <div className="form-preview" onClick={() => {
                                navigate(`/view-form/${form._id}`);
                            }}>
                                <span>{form.formName}</span>
                            </div>
                            <div className="action-buttons">
                                <button 
                                    className="edit-button"
                                    onClick={() => {
                                        navigate(`/edit-form/${form._id}`);
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDelete(form._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Form Modal */}
            <Modal 
                show={showModal.type === 'form' && showModal.action === 'view' && showModal.show}
                onHide={() => setShowModal({ type: '', action: '', show: false })}
                centered
                size="lg"
                className="view-form-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Form Template: {selectedItem?.formName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-details">
                        <div className="score-section">
                            <h4>Score Type: {selectedItem?.score}</h4>
                            {selectedItem?.score && (
                                <div className="scale-description">
                                    <h5>Scale Description:</h5>
                                    <pre>{selectedItem?.scaleDescription}</pre>
                                </div>
                            )}
                        </div>
                        <div className="fields-section">
                            <h4>Form Fields:</h4>
                            {selectedItem?.fieldTemplates?.map((field, index) => (
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
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowModal({ type: '', action: '', show: false })}
                    >
                        Close
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={() => {
                            window.location.href = `/edit-form/${selectedItem?._id}`;
                        }}
                    >
                        Edit Form
                    </Button>
                </Modal.Footer>
            </Modal>
            </div>
        </div>
        </div>
        </div>
    );
};

export default TemplateForms;
