import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import logo from "../assets/logo.png";
//2
function Home() {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [residents, setResidents] = useState([]);
    const [forms, setForms] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAdd = (type) => {
        const setters = { tutor: setTutors, resident: setResidents, form: setForms, announcement: setAnnouncements };
        setters[type](prev => [...prev, { ...selectedItem, id: Date.now() }]);
        setShowModal({ type: '', action: '', show: false });
    };

    const handleDelete = (type, id) => {
        const setters = { tutor: setTutors, resident: setResidents, form: setForms, announcement: setAnnouncements };
        setters[type](prev => prev.filter(item => item.id !== id));
    };

    const handleUpdate = (type) => {
        const setters = { tutor: setTutors, resident: setResidents, form: setForms, announcement: setAnnouncements };
        setters[type](prev => prev.map(item => item.id === selectedItem.id ? selectedItem : item));
        setShowModal({ type: '', action: '', show: false });
    };

    const handleLogout = () => {
        navigate('/');
    };

    const isFormValid = () => {
        if (!selectedItem) return false;

        if (showModal.type === 'announcement') {
            return selectedItem.title?.trim() && selectedItem.description?.trim();
        } else {
            return selectedItem.name?.trim() && 
                   selectedItem.ID?.trim() && 
                   selectedItem.email?.trim();
        }
    };

    return (
        <div className="background">
            <img src={logo} alt="logo" className="logo" />
            <button 
                className="logout-button" 
                onClick={handleLogout}
            >
                Logout
            </button>

            <div className="main-container">
                <div className="container" style={{width:"100%", display:"flex", justifyContent:"center", gap:"20px"}}>
                    {/* Tutor Box */}
                    <div className="management-box">
                        <h2 className="box-title">Tutor</h2>
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Search tutors..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button 
                                className="add-button"
                                onClick={() => {
                                    setSelectedItem({ 
                                        name: '', 
                                        ID: '', 
                                        category: 'Tutor', 
                                        email: '' 
                                    });
                                    setShowModal({ type: 'tutor', action: 'add', show: true });
                                }}
                            >+</button>
                        </div>
                        <div className="items-list">
                            {tutors.filter(tutor => 
                                Object.values(tutor).some(val => 
                                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                                )
                            ).map(tutor => (
                                <div key={tutor.id} className="item-card">
                                    <div className="card-header">
                                        <h3>{tutor.name}</h3>
                                        {tutor.id && (
                                            <button 
                                                className="details-button"
                                                onClick={() => {
                                                    setSelectedItem(tutor);
                                                    setShowModal({ type: 'tutor-details', action: 'view', show: true });
                                                }}
                                            >
                                                Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resident Box */}
                    <div className="management-box">
                        <h2 className="box-title">Resident</h2>
                      
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Search Resident..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button 
                                className="add-button"
                                onClick={() => {
                                    setSelectedItem({ 
                                        name: '', 
                                        ID: '', 
                                        category: 'Resident', 
                                        email: '' 
                                    });
                                    setShowModal({ type: 'resident', action: 'add', show: true });
                                }}
                            >+</button>
                        </div>
                        <div className="items-list">
                            {residents.filter(resident => 
                                Object.values(resident).some(val => 
                                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                                )
                            ).map(resident => (
                                <div key={resident.id} className="item-card">
                                    <div className="card-header">
                                        <h3>{resident.name}</h3>
                                        {resident.id && (
                                            <button 
                                                className="details-button"
                                                onClick={() => {
                                                    setSelectedItem(resident);
                                                    setShowModal({ type: 'resident-details', action: 'view', show: true });
                                                }}
                                            >
                                                Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Form Box */}
                    <div className="management-box">
                        <h2 className="box-title">Form</h2>
                  
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Search forms..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Announcement Box */}
                    <div className="management-box">
                        <h2 className="box-title">Announcement</h2>
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Search announcements..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button 
                                className="add-button"
                                onClick={() => {
                                    setSelectedItem({ 
                                        title: '', 
                                        date: new Date().toISOString().split('T')[0], 
                                        description: '',
                                        file: null 
                                    });
                                    setShowModal({ type: 'announcement', action: 'add', show: true });
                                }}
                            >+</button>
                        </div>
                        <div className="items-list">
                            {announcements.filter(announcement => 
                                Object.values(announcement).some(val => 
                                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                                )
                            ).map(announcement => (
                                <div key={announcement.id} className="item-card announcement-card">
                                    <div className="card-header">
                                        <h3>{announcement.title}</h3>
                                        {announcement.id && (
                                            <button 
                                                className="details-button"
                                                onClick={() => {
                                                    setSelectedItem(announcement);
                                                    setShowModal({ type: 'announcement-details', action: 'view', show: true });
                                                }}
                                            >
                                                Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

          

                    {/* Main Modal for Add/Edit */}
                    <Modal 
                        show={showModal.type === 'tutor' || showModal.type === 'resident' || 
                              (showModal.type === 'announcement' && showModal.show)}
                        onHide={() => setShowModal({ type: '', action: '', show: false })}
                        centered
                    >
                        <Modal.Header>
                            <Modal.Title>
                                {showModal.action === 'add' ? 'Add New' : 'Edit'} {showModal.type}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedItem && (
                                <Form>
                                    {showModal.type === 'announcement' ? (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Title</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={selectedItem.title || ''}
                                                    onChange={(e) => setSelectedItem({
                                                        ...selectedItem,
                                                        title: e.target.value
                                                    })}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={selectedItem.date || ''}
                                                    readOnly
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    value={selectedItem.description || ''}
                                                    onChange={(e) => setSelectedItem({
                                                        ...selectedItem,
                                                        description: e.target.value
                                                    })}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Attachment</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            setSelectedItem({
                                                                ...selectedItem,
                                                                file: e.target.files[0]
                                                            });
                                                        }
                                                    }}
                                                />
                                            </Form.Group>
                                        </>
                                    ) : (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={selectedItem.name || ''}
                                                    onChange={(e) => setSelectedItem({
                                                        ...selectedItem,
                                                        name: e.target.value
                                                    })}
                                                    required
                                                    placeholder="Enter name"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={selectedItem.ID || ''}
                                                    onChange={(e) => setSelectedItem({
                                                        ...selectedItem,
                                                        ID: e.target.value
                                                    })}
                                                    required
                                                    placeholder="Enter ID"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Category</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={selectedItem.category || ''}
                                                    readOnly
                                                    style={{ backgroundColor: '#f8f8f8' }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={selectedItem.email || ''}
                                                    onChange={(e) => setSelectedItem({
                                                        ...selectedItem,
                                                        email: e.target.value
                                                    })}
                                                    required
                                                    placeholder="Enter email"
                                                />
                                            </Form.Group>
                                        </>
                                    )}
                                </Form>
                            )}
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
                                    if (showModal.action === 'add') {
                                        handleAdd(showModal.type);
                                    } else {
                                        handleUpdate(showModal.type);
                                    }
                                }}
                                disabled={!isFormValid()}
                            >
                                {showModal.action === 'add' ? 'Add' : 'Save Changes'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Details Modal */}
                    <Modal 
                        show={showModal.type === 'announcement-details'}
                        onHide={() => setShowModal({ type: '', action: '', show: false })}
                        centered
                    >
                        <Modal.Header>
                            <Modal.Title>
                                Announcement Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedItem && (
                                <div className="announcement-details">
                                    <h4>{selectedItem.title}</h4>
                                    <p className="date">Date: {selectedItem.date}</p>
                                    <div className="description-box">
                                        <label>Description:</label>
                                        <p>{selectedItem.description}</p>
                                    </div>
                                    {selectedItem.file && (
                                        <div className="file-attachment">
                                            <a 
                                                href={URL.createObjectURL(selectedItem.file)}
                                                download={selectedItem.file.name}
                                                className="download-link"
                                            >
                                                📎 {selectedItem.file.name}
                                            </a>
                                        </div>
                                    )}
                                    <div className="details-actions">
                                        <button 
                                            className="edit-button"
                                            onClick={() => {
                                                setShowModal({ 
                                                    type: 'announcement', 
                                                    action: 'edit', 
                                                    show: true 
                                                });
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-button"
                                            onClick={() => {
                                                handleDelete('announcement', selectedItem.id);
                                                setShowModal({ type: '', action: '', show: false });
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowModal({ type: '', action: '', show: false })}
                            >
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Tutor/Resident Details Modal */}
                    <Modal 
                        show={showModal.type === 'tutor-details' || showModal.type === 'resident-details'}
                        onHide={() => setShowModal({ type: '', action: '', show: false })}
                        centered
                    >
                        <Modal.Header>
                            <Modal.Title>
                                {showModal.type === 'tutor-details' ? 'Tutor' : 'Resident'} Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedItem && (
                                <div className="details-content">
                                    <h4>{selectedItem.name}</h4>
                                    <div className="details-field">
                                        <label>ID:</label>
                                        <p>{selectedItem.ID}</p>
                                    </div>
                                    <div className="details-field">
                                        <label>Category:</label>
                                        <p>{selectedItem.category}</p>
                                    </div>
                                    <div className="details-field">
                                        <label>Email:</label>
                                        <p>{selectedItem.email}</p>
                                    </div>
                                    <div className="details-actions">
                                        <button 
                                            className="edit-button"
                                            onClick={() => {
                                                setShowModal({ 
                                                    type: showModal.type === 'tutor-details' ? 'tutor' : 'resident', 
                                                    action: 'edit', 
                                                    show: true 
                                                });
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-button"
                                            onClick={() => {
                                                handleDelete(
                                                    showModal.type === 'tutor-details' ? 'tutor' : 'resident', 
                                                    selectedItem.id
                                                );
                                                setShowModal({ type: '', action: '', show: false });
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowModal({ type: '', action: '', show: false })}
                            >
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default Home;
