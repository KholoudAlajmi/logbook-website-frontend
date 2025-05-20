import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";

const AddFormPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [formData, setFormData] = useState({
        formName: '',
        score: '',
        scaleDescription: '',
        fieldTemplates: []
    });

    // Default scale description - same as the one in TemplateForms component
    const defaultScaleDescription = "The purpose of this scale is to evaluate\nthe trainee's ability to perform this\nprocedure safely and independently.\nWith that in mind please use the\nscale below to evaluate each item,\nirrespective of the resident's level of\ntraining in regards to this case.\nScale:\n1 - \"I had to do\" - Requires complete hands on guidance, did not do, or was not given the opportunity to do\n2 - \"I had to talk them through\" - Able to perform tasks but requires constant direction\n3 - \"I had to prompt them from time to time\" - Demonstrates some independence, but requires intermittent direction\n4 - \"I needed to be in the room just in case\" - Independence but unaware of risks and still requires supervision for safe practice\n5 - \"I did not need to be there\" - Complete independence, understands risks and performs safely, practice ready";
  
    const handleLogout = () => {
        navigate("/");
    };
  
    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setIsVisible(!isVisible);
    };

    // Add form mutation
    const addFormMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/formTemplates', formData);
            return response.data;
        },
        onSuccess: () => {
            alert('Form added successfully!');
            queryClient.invalidateQueries(['forms']);
            navigate('/form'); // Navigate back to forms page after successful creation
        },
        onError: (error) => {
            if (error.response?.data?.error === 'DUPLICATE_FORM_NAME') {
                alert('This form name already exists. Please choose a different name.');
            } else {
                alert('Failed to add form: ' + (error.response?.data?.message || error.message));
            }
        }
    });

    const handleSubmit = () => {
        if (!formData.formName) {
            alert('Form name is required');
            return;
        }
        if (!formData.fieldTemplates?.length) {
            alert('At least one field is required');
            return;
        }
        if (!formData.score) {
            alert('Score type is required');
            return;
        }
        if (formData.score === 'OTHER' && !formData.scaleDescription?.trim()) {
            alert('Scale Description is required for custom score type');
            return;
        }

        // Filter out empty/invalid fields
        const validFields = formData.fieldTemplates.filter(field => 
            field.name && field.type
        );

        if (validFields.length === 0) {
            alert('Please add at least one valid field');
            return;
        }

        // Update positions based on form layout
        const updatedFields = validFields.map((field, index) => ({
            ...field,
            order: index + 1
        }));

        // Use scale description if OTHER, otherwise use the default
        const finalData = {
            ...formData,
            fieldTemplates: updatedFields,
            scaleDescription: formData.score === 'OTHER' ? formData.scaleDescription : defaultScaleDescription
        };

        addFormMutation.mutate(finalData);
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

                    <div className="form-container">
                        <h2 className="page-title">Add New Form</h2>
                        <Form className="add-form">
                            <Form.Group className="mb-3">
                                <Form.Label>Form Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter form name"
                                    value={formData.formName}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        formName: e.target.value
                                    }))}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Score Type</Form.Label>
                                <Form.Select
                                    value={formData?.score || ''}
                                    onChange={(e) => {
                                        const newScore = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            score: newScore,
                                            scaleDescription: newScore === 'SCORE' ? defaultScaleDescription : ''
                                        }));
                                    }}
                                >
                                    <option value="">Select Score</option>
                                    <option value="SCORE">SCORE</option>
                                    <option value="OTHER">OTHER</option>
                                </Form.Select>
                            </Form.Group>

                            {formData?.score && (
                                <Form.Group className="mb-3 mt-2">
                                    <Form.Label>Scale Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter scale description"
                                        value={formData?.score === 'SCORE' ? defaultScaleDescription : (formData?.scaleDescription || '')}
                                        onChange={(e) => {
                                            if (formData?.score === 'OTHER') {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    scaleDescription: e.target.value
                                                }));
                                            }
                                        }}
                                        disabled={formData?.score === 'SCORE'}
                                    />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Form Fields</Form.Label>
                                <div className="fields-list">
                                    {formData.fieldTemplates.map((field, index) => (
                                        <div key={index} className="field-item">
                                            <div className="field-header">
                                                <h6>Field {index + 1}</h6>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="remove-field-btn"
                                                    onClick={() => {
                                                        const newFields = [...formData.fieldTemplates];
                                                        newFields.splice(index, 1);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            fieldTemplates: newFields
                                                        }));
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="field-content">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Field Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter field name"
                                                        value={field.name || ''}
                                                        onChange={(e) => {
                                                            const newFields = [...formData.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                name: e.target.value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        }}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-2">
                                                    <Form.Label>Type</Form.Label>
                                                    <Form.Select
                                                        value={field.type || ''}
                                                        onChange={(e) => {
                                                            const newFields = [...formData.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                type: e.target.value,
                                                                options: e.target.value === 'select' || e.target.value === 'checkbox' ? [] : undefined,
                                                                scaleOptions: e.target.value === 'scale' ? [] : undefined
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        }}
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="text">Text</option>
                                                        <option value="textArea">Text Area</option>
                                                        <option value="date">Date</option>
                                                        <option value="select">Select</option>
                                                        <option value="scale">Scale</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-2">
                                                    <Form.Label>Position</Form.Label>
                                                    <Form.Select
                                                        value={field.position || 'left'}
                                                        onChange={(e) => {
                                                            const newFields = [...formData.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                position: e.target.value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        }}
                                                    >
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>
                                                        <option value="full">Full Width</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-2">
                                                    <Form.Label>Response</Form.Label>
                                                    <Form.Select
                                                        value={field.response || ''}
                                                        onChange={(e) => {
                                                            const newFields = [...formData.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                response: e.target.value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        }}
                                                    >
                                                        <option value="">Select Response</option>
                                                        <option value="tutor">Tutor</option>
                                                        <option value="resident">Resident</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-2">
                                                    <Form.Label>Section</Form.Label>
                                                    <Form.Select
                                                        value={field.section || ''}
                                                        onChange={(e) => {
                                                            const newFields = [...formData.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                section: e.target.value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        }}
                                                    >
                                                        <option value="">Select Section</option>
                                                        {[...Array(10)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>
                                                                {i + 1}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>

                                                {(field.type === 'select' || field.type === 'checkbox' || field.type === 'scale') && (
                                                    <div className="field-full-width">
                                                        <Form.Group className="mb-2">
                                                            <Form.Label>
                                                                {field.type === 'select' ? 'Select Options' : 
                                                                field.type === 'scale' ? 'Scale Options' : 
                                                                'Checkbox Options'}
                                                            </Form.Label>
                                                            <div className="options-list">
                                                                {field.type === 'select' || field.type === 'checkbox' 
                                                                    ? (field.options || []).map((option, optIndex) => (
                                                                        <div key={optIndex} className="option-item">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder={`Option ${optIndex + 1}`}
                                                                                value={option}
                                                                                onChange={(e) => {
                                                                                    const newFields = [...formData.fieldTemplates];
                                                                                    newFields[index].options[optIndex] = e.target.value;
                                                                                    setFormData(prev => ({
                                                                                        ...prev,
                                                                                        fieldTemplates: newFields
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const newFields = [...formData.fieldTemplates];
                                                                                    newFields[index].options.splice(optIndex, 1);
                                                                                    setFormData(prev => ({
                                                                                        ...prev,
                                                                                        fieldTemplates: newFields
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                X
                                                                            </Button>
                                                                        </div>
                                                                    ))
                                                                    : (field.scaleOptions || []).map((option, optIndex) => (
                                                                        <div key={optIndex} className="option-item">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder={`Scale Option ${optIndex + 1}`}
                                                                                value={option}
                                                                                onChange={(e) => {
                                                                                    const newFields = [...formData.fieldTemplates];
                                                                                    newFields[index].scaleOptions[optIndex] = e.target.value;
                                                                                    setFormData(prev => ({
                                                                                        ...prev,
                                                                                        fieldTemplates: newFields
                                                                                    }));
                                                                                }}
                                                                            />
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const newFields = [...formData.fieldTemplates];
                                                                                    newFields[index].scaleOptions.splice(optIndex, 1);
                                                                                    setFormData(prev => ({
                                                                                        ...prev,
                                                                                        fieldTemplates: newFields
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                X
                                                                            </Button>
                                                                        </div>
                                                                    ))
                                                                }
                                                                <Button 
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newFields = [...formData.fieldTemplates];
                                                                        if (field.type === 'select' || field.type === 'checkbox') {
                                                                            newFields[index].options = [...(newFields[index].options || []), ''];
                                                                        } else if (field.type === 'scale') {
                                                                            newFields[index].scaleOptions = [...(newFields[index].scaleOptions || []), ''];
                                                                        }
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            fieldTemplates: newFields
                                                                        }));
                                                                    }}
                                                                >
                                                                    + Add {field.type === 'select' ? 'Option' : 
                                                                        field.type === 'scale' ? 'Scale Option' :
                                                                        'Checkbox Option'}
                                                                </Button>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="secondary" 
                                        className="add-field-btn"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                fieldTemplates: [
                                                    ...(prev.fieldTemplates || []),
                                                    { 
                                                        name: '', 
                                                        type: 'text',
                                                        position: 'left',
                                                        response: '', 
                                                        section: '',
                                                        hasDetails: false,
                                                        details: '',
                                                        scaleOptions: [],
                                                        options: []
                                                    }
                                                ]
                                            }));
                                        }}
                                    >
                                        + Add New Field
                                    </Button>
                                </div>
                            </Form.Group>

                            <div className="form-actions">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => navigate('/form')}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={addFormMutation.isPending}
                                    className="submit-btn"
                                >
                                    {addFormMutation.isPending ? 'Saving...' : 'Save Form'}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFormPage; 