import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";

//user.role.indexOf('tutor') > -1
const Tutor = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [tutorSearch, setTutorSearch] = useState('');
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
                        + Add Tutor
                    </button>
                </div>
            </div>
            </div>

        <div className="management-box">
            <div className="content">
                {tutorsLoading ? (
                    <p>Loading tutors...</p>
                ) : (
                    <div className="tutor-table">
                        <div className="tutor-header">
                            <div className="tutor-name">Tutor Name</div>
                            <div className="tutor-email">Tutor Email</div>
                            <div className="phone-number">Phone Number</div>
                            <div className="action">Action</div>
                        </div>
                        {filterTutors(tutors || []).map((tutor) => (
                            <div key={tutor._id} className="tutor-row">
                                <div className="tutor-name">{tutor.username}</div>
                                <div className="tutor-email">{tutor.email || '-'}</div>
                                <div className="phone-number">{tutor.phone || '-'}</div>
                                <div className="action">
                                    <button 
                                        className="edit-button"
                                        onClick={() => {
                                            setSelectedItem(tutor);
                                            setShowModal({ 
                                                type: 'tutor', 
                                                action: 'edit', 
                                                show: true 
                                            });
                                        }}
                                    >
                                        <span className="edit-icon">✎</span> Edit
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDelete(tutor._id)}
                                    >
                                        <span className="delete-icon">🗑</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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

                        {showModal.action !== 'edit' && (
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
                        )}
                        
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
                    {showModal.action === 'edit' ? (
                        <Button 
                            variant="primary"
                            onClick={() => {
                                updateTutorMutation.mutate({
                                    _id: selectedItem._id,
                                    username: selectedItem.username,
                                    email: selectedItem.email,
                                    phone: selectedItem.phone || ''
                                });
                            }}
                            disabled={!selectedItem?.username || !selectedItem?.email}
                        >
                            {updateTutorMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    ) : (
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
                    )}
                </Modal.Footer>
            </Modal>

            </div>
        </div>
        </div> 
        </div>
    );
};

export default Tutor;