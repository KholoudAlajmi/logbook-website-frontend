import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios';

//user.role.indexOf('tutor') > -1
const Tutor = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [tutorSearch, setTutorSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Fetch tutors
    const { data: tutors, isLoading: tutorsLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data.filter(user => user.roles.includes('tutor') );
        }
    });
console.log("tutors", tutors)
    // Filter tutors
    const filterTutors = (tutors) => {
        if (!tutorSearch) return tutors;
        return tutors.filter(tutor => 
            tutor.username.toLowerCase().includes(tutorSearch.toLowerCase()) ||
            tutor.email?.toLowerCase().includes(tutorSearch.toLowerCase())
        );
    };

    // Add tutor mutation
    const addTutorMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await api.post('/users/signup', {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: 'tutor'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setSelectedItem(null);
            setShowModal({ type: '', action: '', show: false });
            alert('Tutor added successfully!');
        }
    });

    // Update tutor mutation
    const updateTutorMutation = useMutation({
        mutationFn: async (userData) => {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            const response = await api.put(`/users/${userData._id}`, 
                {
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone || '',
                    role: 'tutor'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsEditing(false);
            setShowModal({ type: '', action: '', show: false });
            alert('Tutor updated successfully!');
        },
        onError: (error) => {
            console.error('Update error:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                // Redirect to login
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || 'Failed to update tutor');
            }
        }
    });

    // Delete tutor mutation
    const deleteTutorMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setShowModal({ type: '', action: '', show: false });
            alert('Tutor deleted successfully!');
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tutor?')) {
            deleteTutorMutation.mutate(id);
        }
    };

    return (
        <div className="management-box">
            <h2 className="box-title">Tutor</h2>
            <div className="search-container">
                <div className="search-wrapper">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search tutors..."
                            value={tutorSearch}
                            onChange={(e) => setTutorSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        className="add-button-small"
                        onClick={() => {
                            setSelectedItem(null);
                            setShowModal({ 
                                type: 'tutor', 
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
                {tutorsLoading ? (
                    <p>Loading tutors...</p>
                ) : (
                    filterTutors(tutors || []).map((tutor) => (
                        <div key={tutor._id} className="item">
                            <span>{tutor.username}</span>
                            <button 
                                className="details-button"
                                onClick={() => {
                                    setSelectedItem(tutor);
                                    setShowModal({ 
                                        type: 'tutor-details', 
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

            {/* Add/Edit Modal */}
            <Modal 
                show={showModal.type === 'tutor' && showModal.show}
                onHide={() => setShowModal({ type: '', action: '', show: false })}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showModal.action === 'edit' ? 'Edit Tutor' : 'Add New Tutor'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={selectedItem?.username || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    username: e.target.value
                                }))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={selectedItem?.email || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    password: e.target.value
                                }))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter phone number"
                                value={selectedItem?.phone || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    phone: e.target.value
                                }))}
                            />
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
                        onClick={() => {
                            const tutorData = {
                                username: selectedItem.username,
                                email: selectedItem.email,
                                password: selectedItem.password,
                                phone: selectedItem.phone,
                                role: 'tutor'
                            };
                            addTutorMutation.mutate(tutorData);
                        }}
                        disabled={!selectedItem?.username || !selectedItem?.email || !selectedItem?.password}
                    >
                        {addTutorMutation.isPending ? 'Adding...' : 'Add Tutor'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal
                show={showModal.type === 'tutor-details' && showModal.show}
                onHide={() => {
                    setShowModal({ type: '', action: '', show: false });
                    setIsEditing(false);
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Tutor Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItem && (
                        <Form className="details-content">
                            <Form.Group className="details-field">
                                <Form.Label>Username</Form.Label>
                                {isEditing ? (
                                    <Form.Control
                                        type="text"
                                        value={selectedItem.username || ''}
                                        onChange={(e) => setSelectedItem(prev => ({
                                            ...prev,
                                            username: e.target.value
                                        }))}
                                    />
                                ) : (
                                    <p>{selectedItem.username}</p>
                                )}
                            </Form.Group>
                            <Form.Group className="details-field">
                                <Form.Label>Email</Form.Label>
                                {isEditing ? (
                                    <Form.Control
                                        type="email"
                                        value={selectedItem.email || ''}
                                        onChange={(e) => setSelectedItem(prev => ({
                                            ...prev,
                                            email: e.target.value
                                        }))}
                                    />
                                ) : (
                                    <p>{selectedItem.email}</p>
                                )}
                            </Form.Group>
                            <Form.Group className="details-field">
                                <Form.Label>Phone</Form.Label>
                                {isEditing ? (
                                    <Form.Control
                                        type="tel"
                                        value={selectedItem.phone || ''}
                                        onChange={(e) => setSelectedItem(prev => ({
                                            ...prev,
                                            phone: e.target.value
                                        }))}
                                    />
                                ) : (
                                    <p>{selectedItem.phone || 'Not provided'}</p>
                                )}
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {isEditing ? (
                        <>
                            <Button
                                variant="success"
                                onClick={() => {
                                    if (!selectedItem.username || !selectedItem.email) {
                                        alert('Username and email are required');
                                        return;
                                    }
                                    try {
                                        updateTutorMutation.mutate({
                                            _id: selectedItem._id,
                                            username: selectedItem.username,
                                            email: selectedItem.email,
                                            phone: selectedItem.phone || ''
                                        });
                                    } catch (error) {
                                        console.error('Update error:', error);
                                        alert('Failed to update tutor');
                                    }
                                }}
                                disabled={updateTutorMutation.isPending}
                            >
                                {updateTutorMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                onClick={() => setIsEditing(true)}
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
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Tutor;