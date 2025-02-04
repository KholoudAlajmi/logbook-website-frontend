import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import "../App.css";
import api from '../api/axios';

const TemplateForms = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [formSearch, setFormSearch] = useState('');

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
        
        if (window.confirm('Are you sure you want to delete this form?')) {
            try {
                await deleteFormMutation.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete form:', error);
            }
        }
    };

    return (
        <div className="management-box">
            <h2 className="box-title">Forms</h2>
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
                            setSelectedItem(null);
                            setShowModal({ 
                                type: 'form', 
                                action: 'add', 
                                show: true 
                            });
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="content">
                {formsLoading ? (
                    <p>Loading forms...</p>
                ) : (
                    filterForms(forms || []).map((form) => (
                        <div key={form._id} className="item">
                            <span>{form.formName}</span>
                            <button 
                                className="details-button"
                                onClick={() => {
                                    setSelectedItem(form);
                                    setShowModal({ 
                                        type: 'form-details', 
                                        action: 'view', 
                                        show: true 
                                    });
                                }}
                            >
                                Details
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            <Modal
                show={showModal.type === 'form-details' && showModal.show}
                onHide={() => {
                    setShowModal({ type: '', action: '', show: false });
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Form Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItem && (
                        <Form className="details-content">
                            <Form.Group className="details-field">
                                <Form.Label>Form Name</Form.Label>
                                <p>{selectedItem.formName}</p>
                            </Form.Group>

                            <Form.Group className="details-field">
                                <p>{selectedItem.score || 'Not specified'}</p>
                            </Form.Group>

                            <Form.Group className="details-field">
                                <Form.Label>Scale Description</Form.Label>
                                <p>{selectedItem.scaleDescription || 'Not specified'}</p>
                            </Form.Group>

                            <Form.Group className="details-field">
                                <div className="fields-list">
                                    {selectedItem.fieldTemplates?.map((field, index) => (
                                        <div key={field._id || index} className="field-item">
                                            <h3>Field {index + 1}</h3>
                                            <p><strong>Name:</strong> {field.name}</p>
                                            <p><strong>Details:</strong> {field.details || 'Not specified'}</p>
                                            <p><strong>Type:</strong> {field.type}</p>
                                            <p><strong>Position:</strong> {field.position || 'Not specified'}</p>
                                            <p><strong>Response:</strong> {field.response || 'Not specified'}</p>
                                            <p><strong>Section:</strong> {field.section || 'Not specified'}</p>
                                            
                                            {/* Show options for both select and checkbox types */}
                                            {(field.type === 'select' || field.type === 'checkbox') && field.options && field.options.length > 0 && (
                                                <>
                                                    <p><strong>{field.type === 'select' ? 'Select Options:' : 'Checkbox Options:'}</strong></p>
                                                    <ul>
                                                        {field.options.map((option, i) => (
                                                            <li key={i}>{option}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            {/* Show scale options if type is scale */}
                                            {field.type === 'scale' && field.scaleOptions && field.scaleOptions.length > 0 && (
                                                <>
                                                    <p><strong>Scale Options:</strong></p>
                                                    <ul>
                                                        {field.scaleOptions.map((option, i) => (
                                                            <li key={i}>{option}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="primary"
                        onClick={() => {
                            setShowModal({ 
                                type: 'form', 
                                action: 'edit', 
                                show: true 
                            });
                        }}
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={() => handleDelete(selectedItem._id)}
                    >
                        Delete
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowModal({ type: '', action: '', show: false })}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Form Modal */}
            <Modal 
                show={showModal.type === 'form' && showModal.show}
                onHide={() => setShowModal({ type: '', action: '', show: false })}
                centered
                size="lg"
                className="add-form-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showModal.action === 'edit' ? 'Edit Form' : 'Add New Form'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Form Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter form name"
                                value={selectedItem?.formName || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    formName: e.target.value,
                                    fieldTemplates: prev?.fieldTemplates || []
                                }))}
                            />
                        </Form.Group>

                        {/* Update the score selection handler */}
                        <Form.Group className="mb-3">
                            <Form.Label>Score Type</Form.Label>
                            <Form.Select
                                value={selectedItem?.score || ''}
                                onChange={(e) => {
                                    setSelectedItem(prev => ({
                                        ...prev,
                                        score: e.target.value,
                                        scaleDescription: e.target.value === 'SCORE' ? scaleDescription : '',
                                        fieldTemplates: prev?.fieldTemplates || [] // Ensure fieldTemplates exists
                                    }));
                                }}
                            >
                                <option value="">Select Score</option>
                                <option value="SCORE">SCORE</option>
                                <option value="OTHER">OTHER</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Show appropriate textarea based on score type */}
                        {selectedItem?.score && (  // Only show if score is selected
                            <Form.Group className="mb-3 mt-2">
                                <Form.Label>Scale Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter scale description"
                                    value={selectedItem?.score === 'SCORE' ? scaleDescription : (selectedItem?.scaleDescription || '')}
                                    onChange={(e) => {
                                        if (selectedItem?.score === 'OTHER') {
                                            setSelectedItem(prev => ({
                                                ...prev,
                                                scaleDescription: e.target.value
                                            }));
                                        }
                                    }}
                                    disabled={selectedItem?.score === 'SCORE'}
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <div className="fields-list">
                                {selectedItem?.fieldTemplates?.map((field, index) => (
                                    <div key={index} className="field-item">
                                        <div className="field-header">
                                            <h3>Field {index + 1}</h3>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                className="remove-field-btn"
                                                onClick={async () => {
                                                    try {
                                                        if (field._id) {
                                                            // If field exists in database, delete it
                                                            await deleteFieldMutation.mutateAsync(field._id);
                                                            // Only update local state after successful deletion
                                                            const newFields = [...selectedItem.fieldTemplates];
                                                            newFields.splice(index, 1);
                                                            setSelectedItem(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        } else {
                                                            // If field doesn't exist in DB, just update local state
                                                            const newFields = [...selectedItem.fieldTemplates];
                                                            newFields.splice(index, 1);
                                                            setSelectedItem(prev => ({
                                                                ...prev,
                                                                fieldTemplates: newFields
                                                            }));
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to delete field:', error);
                                                    }
                                                }}
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
                                                            const newFields = [...selectedItem.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                name: e.target.value
                                                            };
                                                            setSelectedItem(prev => ({
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
                                                            const newFields = [...selectedItem.fieldTemplates];
                                                            newFields[index] = {
                                                                ...newFields[index],
                                                                hasDetails: e.target.checked,
                                                                details: e.target.checked ? (newFields[index].details || '') : ''
                                                            };
                                                            setSelectedItem(prev => ({
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
                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                newFields[index] = {
                                                                    ...newFields[index],
                                                                    details: e.target.value
                                                                };
                                                                setSelectedItem(prev => ({
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
                                                        const newFields = [...selectedItem.fieldTemplates];
                                                        newFields[index] = {
                                                            ...newFields[index],
                                                            type: e.target.value,
                                                            options: e.target.value === 'select' || e.target.value === 'checkbox' ? [] : undefined,
                                                            scaleOptions: e.target.value === 'scale' ? [] : undefined
                                                        };
                                                        setSelectedItem(prev => ({
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
                                                        const newFields = [...selectedItem.fieldTemplates];
                                                        newFields[index] = {
                                                            ...newFields[index],
                                                            position: e.target.value
                                                        };
                                                        setSelectedItem(prev => ({
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
                                                        const newFields = [...selectedItem.fieldTemplates];
                                                        newFields[index] = {
                                                            ...newFields[index],
                                                            response: e.target.value
                                                        };
                                                        setSelectedItem(prev => ({
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
                                                        const newFields = [...selectedItem.fieldTemplates];
                                                        newFields[index] = {
                                                            ...newFields[index],
                                                            section: e.target.value
                                                        };
                                                        setSelectedItem(prev => ({
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
                                                            {field.type === 'select' && (
                                                                field.options?.map((option, optionIndex) => (
                                                                    <div key={optionIndex} className="option-item">
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={option}
                                                                            onChange={(e) => {
                                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                                newFields[index].options[optionIndex] = e.target.value;
                                                                                setSelectedItem(prev => ({
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
                                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                                newFields[index].options.splice(optionIndex, 1);
                                                                                setSelectedItem(prev => ({
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
                                                            {field.type === 'scale' && (
                                                                field.scaleOptions?.map((option, optionIndex) => (
                                                                    <div key={optionIndex} className="option-item">
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={option}
                                                                            onChange={(e) => {
                                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                                newFields[index].scaleOptions[optionIndex] = e.target.value;
                                                                                setSelectedItem(prev => ({
                                                                                    ...prev,
                                                                                    fieldTemplates: newFields
                                                                                }));
                                                                            }}
                                                                            placeholder={`Scale Option ${optionIndex + 1}`}
                                                                        />   
                                                                    </div>
                                                                ))
                                                            )}
                                                            {field.type === 'checkbox' && (
                                                                field.options?.map((option, optionIndex) => (
                                                                    <div key={optionIndex} className="option-item">
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={option}
                                                                            onChange={(e) => {
                                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                                newFields[index].options[optionIndex] = e.target.value;
                                                                                setSelectedItem(prev => ({
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
                                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                                newFields[index].options.splice(optionIndex, 1);
                                                                                setSelectedItem(prev => ({
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
                                                                    const newFields = [...selectedItem.fieldTemplates];
                                                                    if (field.type === 'select' || field.type === 'checkbox') {
                                                                        newFields[index].options = [...(newFields[index].options || []), ''];
                                                                    } else if (field.type === 'scale') {
                                                                        newFields[index].scaleOptions = [...(newFields[index].scaleOptions || []), ''];
                                                                    }
                                                                    setSelectedItem(prev => ({
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
                                        setSelectedItem(prev => ({
                                            ...prev,
                                            fieldTemplates: [
                                                ...(prev?.fieldTemplates || []),
                                                { 
                                                    name: '', 
                                                    type: 'text',
                                                    position: 'left',  // Set default position to 'left'
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowModal({ type: '', action: '', show: false })}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={async () => {
                            if (!selectedItem?.formName) {
                                alert('Form name is required');
                                return;
                            }
                            if (!selectedItem?.fieldTemplates?.length) {
                                alert('At least one field is required');
                                return;
                            }
                            if (!selectedItem?.score) {
                                alert('Score type is required');
                                return;
                            }
                            if (selectedItem.score === 'OTHER' && !selectedItem?.scaleDescription?.trim()) {
                                alert('Scale Description is required for custom score type');
                                return;
                            }

                            // Filter out empty/invalid fields
                            const validFields = selectedItem.fieldTemplates.filter(field => 
                                field.name && field.type
                            );

                            const formData = {
                                formName: selectedItem.formName,
                                score: selectedItem.score,
                                // Set scaleDescription based on score type
                                scaleDescription: selectedItem.score === 'SCORE' ? scaleDescription : selectedItem.scaleDescription,
                                fieldTemplates: validFields.map(field => ({
                                    name: field.name,
                                    type: field.type || 'text',
                                    position: field.position,
                                    response: field.response,
                                    section: field.section,
                                    hasDetails: field.hasDetails || false,
                                    details: field.details || '',
                                    options: (field.type === 'select' || field.type === 'checkbox') ? (field.options || []) : [],
                                    scaleOptions: field.type === 'scale' ? (field.scaleOptions || []) : [],
                                    _id: field._id
                                }))
                            };

                            try {
                                if (showModal.action === 'edit') {
                                    if (window.confirm('Are you sure you want to update this form?')) {
                                        await updateFormMutation.mutateAsync({ 
                                            formId: selectedItem._id, 
                                            formData 
                                        });
                                    }
                                } else {
                                    await addFormMutation.mutateAsync(formData);
                                }
                            } catch (error) {
                                console.error('Failed to save form:', error);
                            }
                        }}
                        disabled={addFormMutation.isPending || updateFormMutation.isPending}
                    >
                        {(addFormMutation.isPending || updateFormMutation.isPending) 
                            ? 'Saving...' 
                            : showModal.action === 'edit' ? 'Save Changes' : 'Add Form'
                        }
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TemplateForms;
