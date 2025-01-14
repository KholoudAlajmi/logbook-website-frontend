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
            form.name.toLowerCase().includes(formSearch.toLowerCase())
        );
    };

    // Add this mutation
    const addFormMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/formTemplates', formData);
            return response.data;
        },
        onSuccess: () => {
            alert('Form added successfully!');
            // Close modal first
            setShowModal({ type: '', action: '', show: false });
            // Then reset form and refresh data
            setSelectedItem(null);
            queryClient.invalidateQueries(['forms']);
        },
        onError: (error) => {
            console.error('Add error:', error);
            alert(error.response?.data?.message || 'Failed to add form');
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
                            <span>{form.name}</span>
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
                                <p>{selectedItem.name}</p>
                            </Form.Group>

                            {/* Add Scale Description if form is SCORE */}
                            {selectedItem.name === 'SCORE' && selectedItem.scaleDescription && (
                                <Form.Group className="details-field">
                                    <Form.Label>Scale Description</Form.Label>
                                    <p>{selectedItem.scaleDescription}</p>
                                </Form.Group>
                            )}

                            <Form.Group className="details-field">
                                <Form.Label>Fields</Form.Label>
                                <div className="fields-list">
                                    {selectedItem.fieldTemplates?.map((field, index) => (
                                        <div key={field._id || index} className="field-item">
                                            <h3>Field {index + 1}</h3>
                                            <p><strong>Name:</strong> {field.name}</p>
                                            
                                            {/* Move Details right after Name */}
                                            {field.hasDetails && (
                                                <p><strong>Details:</strong> {field.details}</p>
                                            )}
                                            
                                            <p><strong>Type:</strong> {field.type}</p>
                                            <p><strong>Position:</strong> {field.position || 'Not specified'}</p>
                                            <p><strong>Response:</strong> {field.response || 'Not specified'}</p>
                                            <p><strong>Section:</strong> {field.section || 'Not specified'}</p>
                                            
                                            {field.type === 'select' && field.options && field.options.length > 0 && (
                                                <>
                                                    <p><strong>Select Options:</strong></p>
                                                    <ul>
                                                        {field.options.map((option, i) => (
                                                            <li key={i}>{option}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
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
                                value={selectedItem?.name || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    name: e.target.value,
                                    fieldTemplates: prev?.fieldTemplates || []
                                }))}
                            />
                        </Form.Group>

                        {/* Add Scale Description if form name is SCORE */}
                        {selectedItem?.name === 'SCORE' && (
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Scale Description <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter scale description"
                                    value={selectedItem?.scaleDescription || ''}
                                    onChange={(e) => setSelectedItem(prev => ({
                                        ...prev,
                                        scaleDescription: e.target.value
                                    }))}
                                    required
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Fields</Form.Label>
                            <div className="fields-list">
                                {selectedItem?.fieldTemplates?.map((field, index) => (
                                    <div key={index} className="field-item">
                                        <div className="field-header">
                                            <h3>Field {index + 1}</h3>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                className="remove-field-btn"
                                                onClick={() => {
                                                    const newFields = [...selectedItem.fieldTemplates];
                                                    newFields.splice(index, 1);
                                                    setSelectedItem(prev => ({
                                                        ...prev,
                                                        fieldTemplates: newFields
                                                    }));
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
                                                            options: e.target.value === 'select' ? [] : undefined,
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
                                            {(field.type === 'select' || field.type === 'scale') && (
                                                <div className="field-full-width">
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>{field.type === 'select' ? 'Options' : 'Scale Options'}</Form.Label>
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
                                                                        <Button 
                                                                            variant="danger"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const newFields = [...selectedItem.fieldTemplates];
                                                                                newFields[index].scaleOptions.splice(optionIndex, 1);
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
                                                                    if (field.type === 'select') {
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
                                                                + Add {field.type === 'select' ? 'Option' : 'Scale Option'}
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
                                                    type: 'text',  // Always set a default type
                                                    position: '', 
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
                            if (!selectedItem?.name) {
                                alert('Form name is required');
                                return;
                            }
                            if (!selectedItem?.fieldTemplates?.length) {
                                alert('At least one field is required');
                                return;
                            }

                            // Add validation for SCORE form
                            if (selectedItem.name === 'SCORE' && !selectedItem.scaleDescription) {
                                alert('Scale description is required for SCORE form');
                                return;
                            }

                            const formData = {
                                name: selectedItem.name,
                                scaleDescription: selectedItem.name === 'SCORE' ? selectedItem.scaleDescription : '', // Include scaleDescription
                                fieldTemplates: selectedItem.fieldTemplates.map(field => ({
                                    name: field.name,
                                    type: field.type || 'text',
                                    position: field.position,
                                    response: field.response,
                                    section: field.section,
                                    hasDetails: field.hasDetails || false,
                                    details: field.details || '',
                                    options: field.type === 'select' ? (field.options || []) : [],
                                    scaleOptions: field.type === 'scale' ? (field.scaleOptions || []) : []
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
