import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";

const Resident = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [residentSearch, setResidentSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);


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


    // Fetch residents
    const { data: residents, isLoading: residentsLoading } = useQuery({
        queryKey: ['residents'],
        queryFn: async () => {
            try {
                const response = await api.get('/users');
                // Only return residents
                const residentUsers = response.data.filter(user => user.roles.includes('resident'));
                return residentUsers;
            } catch (error) {
                console.error('Error fetching residents:', error);
                throw error;
            }
        }
    });

    // Filter residents
    const filterResidents = (residents) => {
        if (!residentSearch) return residents;
        return residents.filter(resident => 
            resident.username.toLowerCase().includes(residentSearch.toLowerCase()) ||
            resident.email?.toLowerCase().includes(residentSearch.toLowerCase())
        );
    };

    // Add resident mutation
    const addResidentMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await api.post('/users/signup', {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: 'resident'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['residents']);
            setSelectedItem(null);
            setShowModal({ type: '', action: '', show: false });
            alert('Resident added successfully!');
        }
    });

    // Update resident mutation
    const updateResidentMutation = useMutation({
        mutationFn: async (userData) => {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            const response = await api.put(`/users/${userData._id}`, 
                {
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone || '',
                    role: 'resident'
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
            queryClient.invalidateQueries(['residents']);
            setIsEditing(false);
            setShowModal({ type: '', action: '', show: false });
            alert('Resident updated successfully!');
        },
        onError: (error) => {
            console.error('Update error:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                // Redirect to login
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || 'Failed to update resident');
            }
        }
    });

    // Delete resident mutation
    const deleteResidentMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['residents']);
            setShowModal({ type: '', action: '', show: false });
            alert('Resident deleted successfully!');
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resident?')) {
            deleteResidentMutation.mutate(id);
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
                    justifyContent: "center",
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


        <div className="management-box">
            <h2 className="box-title">Resident</h2>
            <div className="search-container">
                <div className="search-wrapper">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search residents..."
                            value={residentSearch}
                            onChange={(e) => setResidentSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        className="add-button-small"
                        onClick={() => {
                            setSelectedItem(null);
                            setShowModal({ 
                                type: 'resident', 
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
                {residentsLoading ? (
                    <p>Loading residents...</p>
                ) : (
                    filterResidents(residents || []).map((resident) => (
                        <div key={resident._id} className="item">
                            <span>{resident.username}</span>
                            <button 
                                className="details-button"
                                onClick={() => {
                                    setSelectedItem(resident);
                                    setShowModal({ 
                                        type: 'resident-details', 
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
                show={showModal.type === 'resident' && showModal.show}
                onHide={() => setShowModal({ type: '', action: '', show: false })}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showModal.action === 'edit' ? 'Edit Resident' : 'Add New Resident'}
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
                            const residentData = {
                                username: selectedItem.username,
                                email: selectedItem.email,
                                password: selectedItem.password,
                                phone: selectedItem.phone,
                                role: 'resident'
                            };
                            addResidentMutation.mutate(residentData);
                        }}
                        disabled={!selectedItem?.username || !selectedItem?.email || !selectedItem?.password}
                    >
                        {addResidentMutation.isPending ? 'Adding...' : 'Add Resident'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal
                show={showModal.type === 'resident-details' && showModal.show}
                onHide={() => {
                    setShowModal({ type: '', action: '', show: false });
                    setIsEditing(false);
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Resident Details</Modal.Title>
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
                                        updateResidentMutation.mutate({
                                            _id: selectedItem._id,
                                            username: selectedItem.username,
                                            email: selectedItem.email,
                                            phone: selectedItem.phone || ''
                                        });
                                    } catch (error) {
                                        console.error('Update error:', error);
                                        alert('Failed to update resident');
                                    }
                                }}
                                disabled={updateResidentMutation.isPending}
                            >
                                {updateResidentMutation.isPending ? 'Saving...' : 'Save Changes'}
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
        </div>
        </div>
        </div>
    );
};

export default Resident;