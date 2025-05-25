import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from "react-router-dom";
import api from '../api/axios';
import "../App.css";
import logo from "../assets/logo.png";

const EditForm = () => {
    // Get formId from URL and validate it
    const formId = window.location.pathname.split('/').pop();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [formData, setFormData] = useState(null);
    const [originalFormData, setOriginalFormData] = useState(null); // Store original form data
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const scaleDescription = "The purpose of this scale is to evaluate\nthe trainee's ability to perform this\nprocedure safely and independently.\nWith that in mind please use the\nscale below to evaluate each item,\nirrespective of the resident's level of\ntraining in regards to this case.\nScale:\n1 - \"I had to do\" - Requires complete hands on guidance, did not do, or was not given the opportunity to do\n2 - \"I had to talk them through\" - Able to perform tasks but requires constant direction\n3 - \"I had to prompt them from time to time\" - Demonstrates some independence, but requires intermittent direction\n4 - \"I needed to be in the room just in case\" - Independence but unaware of risks and still requires supervision for safe practice\n5 - \"I did not need to be there\" - Complete independence, understands risks and performs safely, practice ready"  

    // Function to validate MongoDB ObjectId
    //when i cancel changes, i want to restore the original form data
    const isValidObjectId = (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Fetch form data when component mounts
    useEffect(() => {
        console.log('Loading form with ID:', formId);
        
        const fetchFormData = async () => {
            try {
                // Validate formId before making the API call
                //when i cancel changes, i want to restore the original form data
                if (!isValidObjectId(formId)) {
                    console.error('Invalid form ID format');
                    navigate('/form');
                    return;
                }

                setLoading(true);
                const response = await api.get(`/formTemplates/${formId}`);
                console.log('Form data loaded:', response.data);
                setFormData(response.data);
                setOriginalFormData(response.data); // Store original data
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

    // Delete field handler
    const handleDeleteField = async (fieldId, index) => {
        try {
            if (fieldId) {
                // If field exists in database, delete it
                await api.delete(`/fieldTemplate/${fieldId}`);
            }
            
            // Update local state regardless of whether the API call was made
            const newFields = [...formData.fieldTemplates];
            newFields.splice(index, 1);
            setFormData(prev => ({
                ...prev,
                fieldTemplates: newFields
            }));
        } catch (error) {
            console.error('Failed to delete field:', error);
            alert('Error deleting field: ' + (error.response?.data?.message || error.message));
        }
    };

    // Save form changes
    const handleSaveForm = async () => {
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

        const updatedFormData = {
            formName: formData.formName,
            score: formData.score,
            // Set scaleDescription based on score type
            scaleDescription: formData.score === 'SCORE' ? scaleDescription : formData.scaleDescription,
            fieldTemplates: validFields.map(field => ({
                name: field.name,
                type: field.type || 'text',
                position: field.position || 'left',
                response: field.response || '',
                section: field.section || '',
                hasDetails: field.hasDetails || false,
                details: field.details || '',
                options: (field.type === 'select' || field.type === 'checkbox') ? (field.options || []) : [],
                scaleOptions: field.type === 'scale' ? (field.scaleOptions || []) : [],
                _id: field._id
            }))
        };

        try {
            setSaving(true);
            const response = await api.put(`/formTemplates/${formId}`, updatedFormData);
            console.log('Form updated:', response.data);
            alert('Form updated successfully!');
            // Navigate back to forms page after successful update
            navigate('/form');
        } catch (error) {
            console.error('Failed to update form:', error);
            alert('Error updating form: ' + (error.response?.data?.message || error.message));
            setSaving(false);
        }
    };

    // Add cancel handler
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All changes will be discarded.')) {
            setFormData(originalFormData); // Restore original data
            navigate('/form');
        }
    };

    // Custom styles
    const customStyles = `
        .action-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .save-button, .cancel-button {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            border: none;
            font-weight: 500;
        }
        
        .save-button {
            background-color:rgb(0, 0, 0);
            color: white;
        }
        
        .cancel-button {
            background-color: #9aa0a6;
            color: white;
        }
        
        .field-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #f8f9fa;
        }
        
        .field-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .field-content {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .field-full-width {
            width: 100%;
        }
        
        .remove-field-btn {
            background-color: #ea4335;
            color: white;
        }
        
        .add-field-btn {
            width: 100%;
            margin-top: 15px;
            padding: 10px;
        }
        
        .options-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
        }
        
        .option-item {
            display: flex;
            gap: 10px;
            align-items: center;
        }
    `;

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
                    <style>{customStyles}</style>

                    <div className="header-box" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2>Edit Form</h2>
                        <h2>{formData?.formName}</h2>
                    </div>
                    
                    <div className="management-box" style={{ width: '98%', padding: '20px' }}>
                        {loading ? (
                            <div className="loading-container" style={{ textAlign: 'center', padding: '20px' }}>
                                <p>Loading form data...</p>
                                <p>Form ID: {formId}</p>
                            </div>
                        ) : (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Form Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter form name"
                                        value={formData?.formName || ''}
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
                                            setFormData(prev => ({
                                                ...prev,
                                                score: e.target.value,
                                                scaleDescription: e.target.value === 'SCORE' ? scaleDescription : prev.scaleDescription
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
                                            value={formData?.score === 'SCORE' ? scaleDescription : (formData?.scaleDescription || '')}
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
                                    <div className="fields-list">
                                        {formData?.fieldTemplates?.map((field, index) => (
                                            <div key={index} className="field-item">
                                                <div className="field-header">
                                                    <h3>Field {index + 1}</h3>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        className="remove-field-btn"
                                                        onClick={() => handleDeleteField(field._id, index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>

                                                <div className="field-content">
                                                    {/* Name - Full width */}
                                                    <div className="field-full-width">
                                                        <Form.Group className="mb-2">
                                                            <Form.Label>Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
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
                                                    </div>

                                                    {/* Has Details - Full width */}
                                                    <div className="field-full-width">
                                                        <Form.Group className="mb-2">
                                                            <Form.Check
                                                                type="checkbox"
                                                                label="Has Details"
                                                                checked={field.hasDetails || false}
                                                                onChange={(e) => {
                                                                    const newFields = [...formData.fieldTemplates];
                                                                    newFields[index] = {
                                                                        ...newFields[index],
                                                                        hasDetails: e.target.checked,
                                                                        details: e.target.checked ? (newFields[index].details || '') : ''
                                                                    };
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        fieldTemplates: newFields
                                                                    }));
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>

                                                    {/* Details - Full width when visible */}
                                                    {field.hasDetails && (
                                                        <div className="field-full-width">
                                                            <Form.Group className="mb-2">
                                                                <Form.Label>Details</Form.Label>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={2}
                                                                    value={field.details || ''}
                                                                    onChange={(e) => {
                                                                        const newFields = [...formData.fieldTemplates];
                                                                        newFields[index] = {
                                                                            ...newFields[index],
                                                                            details: e.target.value
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            fieldTemplates: newFields
                                                                        }));
                                                                    }}
                                                                    placeholder="Enter details for this field"
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    )}

                                                    {/* Type - Half width */}
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
                                                            <option value="checkbox">Checkbox</option>
                                                        </Form.Select>
                                                    </Form.Group>

                                                    {/* Position - Half width */}
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Position</Form.Label>
                                                        <Form.Select
                                                            value={field.position || ''}
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
                                                            <option value="">Select Position</option>
                                                            <option value="left">Left</option>
                                                            <option value="right">Right</option>
                                                        </Form.Select>
                                                    </Form.Group>

                                                    {/* Response - Half width */}
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

                                                    {/* Section - Half width */}
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

                                                    {/* Options sections - Full width when visible */}
                                                    {(field.type === 'select' || field.type === 'scale' || field.type === 'checkbox') && (
                                                        <div className="field-full-width">
                                                            <Form.Group className="mb-2">
                                                                <Form.Label>
                                                                    {field.type === 'select' ? 'Options' : 
                                                                    field.type === 'scale' ? 'Scale Options' :
                                                                    'Checkbox Options'}
                                                                </Form.Label>
                                                                <div className="options-list">
                                                                    {field.type === 'select' && field.options && (
                                                                        field.options.map((option, optionIndex) => (
                                                                            <div key={optionIndex} className="option-item">
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={option}
                                                                                    onChange={(e) => {
                                                                                        const newFields = [...formData.fieldTemplates];
                                                                                        newFields[index].options[optionIndex] = e.target.value;
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            fieldTemplates: newFields
                                                                                        }));
                                                                                    }}
                                                                                    placeholder={`Option ${optionIndex + 1}`}
                                                                                />
                                                                                <Button 
                                                                                    variant="danger"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const newFields = [...formData.fieldTemplates];
                                                                                        newFields[index].options.splice(optionIndex, 1);
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            fieldTemplates: newFields
                                                                                        }));
                                                                                    }}
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                    {field.type === 'scale' && field.scaleOptions && (
                                                                        field.scaleOptions.map((option, optionIndex) => (
                                                                            <div key={optionIndex} className="option-item">
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={option}
                                                                                    onChange={(e) => {
                                                                                        const newFields = [...formData.fieldTemplates];
                                                                                        newFields[index].scaleOptions[optionIndex] = e.target.value;
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            fieldTemplates: newFields
                                                                                        }));
                                                                                    }}
                                                                                    placeholder={`Scale Option ${optionIndex + 1}`}
                                                                                />   
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                    {field.type === 'checkbox' && field.options && (
                                                                        field.options.map((option, optionIndex) => (
                                                                            <div key={optionIndex} className="option-item">
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={option}
                                                                                    onChange={(e) => {
                                                                                        const newFields = [...formData.fieldTemplates];
                                                                                        newFields[index].options[optionIndex] = e.target.value;
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            fieldTemplates: newFields
                                                                                        }));
                                                                                    }}
                                                                                    placeholder={`Checkbox Option ${optionIndex + 1}`}
                                                                                />
                                                                                <Button 
                                                                                    variant="danger"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        const newFields = [...formData.fieldTemplates];
                                                                                        newFields[index].options.splice(optionIndex, 1);
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            fieldTemplates: newFields
                                                                                        }));
                                                                                    }}
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </div>
                                                                        ))
                                                                    )}
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
                                                        ...(prev?.fieldTemplates || []),
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

                                <div className="action-buttons">
                                    <button 
                                        className="save-button" 
                                        onClick={handleSaveForm}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        className="cancel-button" 
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditForm; 