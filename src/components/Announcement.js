import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const Announcement = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState({ type: '', action: '', show: false });
    const [selectedItem, setSelectedItem] = useState(null);
    const [announcementSearch, setAnnouncementSearch] = useState('');

    // Fetch announcements
    const { data: announcements, isLoading: announcementsLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            try {
                const response = await api.get('/announcements');
                return response.data;
            } catch (error) {
                console.error('Error fetching announcements:', error);
                throw error;
            }
        }
    });

    // Add announcement mutation
    const addAnnouncementMutation = useMutation({
        mutationFn: async (announcementData) => {
            console.log('Sending announcement data:', announcementData); // Debug log
            try {
                const response = await api.post('/announcements', announcementData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('API Error:', error.response?.data || error); // Log full error
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
            setShowModal({ type: '', action: '', show: false });
            setSelectedItem(null);
            alert('Announcement added successfully!');
        },
        onError: (error) => {
            console.error('Mutation Error:', error); // Log mutation error
            alert(`Failed to add announcement: ${error.response?.data?.message || error.message}`);
        }
    });

    // Delete announcement mutation
    const deleteAnnouncementMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/announcements/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
            setShowModal({ type: '', action: '', show: false });
            alert('Announcement deleted successfully!');
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            deleteAnnouncementMutation.mutate(id);
        }
    };

    // Add this filter function
    const filterAnnouncements = (announcements) => {
        if (!announcementSearch) return announcements;
        return announcements?.filter(announcement => 
            announcement.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
            announcement.body.toLowerCase().includes(announcementSearch.toLowerCase())
        );
    };

    // Update the submit handler
    const handleSubmit = () => {
        if (!selectedItem?.title || !selectedItem?.body) {
            alert('Title and body are required');
            return;
        }

        const announcementData = {
            title: selectedItem.title.trim(),
            body: selectedItem.body.trim(),
            date: new Date().toISOString()
        };

        console.log('Submitting announcement:', announcementData); // Debug log
        addAnnouncementMutation.mutate(announcementData);
    };

    return (
        <div className="management-box">
            <h2 className="box-title">Announcements</h2>
            <div className="search-container">
                <div className="search-wrapper">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={announcementSearch}
                            onChange={(e) => setAnnouncementSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        className="add-button-small"
                        onClick={() => {
                            setSelectedItem(null);
                            setShowModal({ 
                                type: 'announcement', 
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
                {announcementsLoading ? (
                    <p>Loading announcements...</p>
                ) : (
                    filterAnnouncements(announcements || []).map((announcement) => (
                        <div key={announcement._id} className="item">
                            <span>{announcement.title}</span>
                            <button 
                                className="details-button"
                                onClick={() => {
                                    setSelectedItem(announcement);
                                    setShowModal({ 
                                        type: 'announcement-details', 
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

            {/* Add Modal */}
            <Modal 
                show={showModal.type === 'announcement' && showModal.show}
                onHide={() => setShowModal({ type: '', action: '', show: false })}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add New Announcement
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={selectedItem?.title || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Body</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter body text"
                                value={selectedItem?.body || ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    body: e.target.value
                                }))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>File Attachment</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 10000000) { // 10MB limit
                                            alert('File size should be less than 10MB');
                                            return;
                                        }
                                        setSelectedItem(prev => ({
                                            ...prev,
                                            file: file
                                        }));
                                    }
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={selectedItem?.date ? new Date(selectedItem.date).toISOString().split('T')[0] : ''}
                                onChange={(e) => setSelectedItem(prev => ({
                                    ...prev,
                                    date: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
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
                        onClick={handleSubmit}
                        disabled={!selectedItem?.title || !selectedItem?.body || addAnnouncementMutation.isPending}
                    >
                        {addAnnouncementMutation.isPending ? 'Adding...' : 'Add Announcement'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal
                show={showModal.type === 'announcement-details' && showModal.show}
                onHide={() => {
                    setShowModal({ type: '', action: '', show: false });
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Announcement Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItem && (
                        <Form className="details-content">
                            <Form.Group className="details-field">
                                <Form.Label>Title</Form.Label>
                                <p>{selectedItem.title}</p>
                            </Form.Group>
                            <Form.Group className="details-field">
                                <Form.Label>Body</Form.Label>
                                <p>{selectedItem.body}</p>
                            </Form.Group>
                            <Form.Group className="details-field">
                                <Form.Label>Date</Form.Label>
                                <p>{new Date(selectedItem.date).toLocaleDateString()}</p>
                            </Form.Group>
                            {selectedItem.file && (
                                <Form.Group className="details-field">
                                    <Form.Label>Attachment</Form.Label>
                                    <div>
                                        <a 
                                            href={typeof selectedItem.file === 'string' ? selectedItem.file : URL.createObjectURL(selectedItem.file)} 
                                            download
                                            className="download-link"
                                        >
                                            Download File
                                        </a>
                                    </div>
                                </Form.Group>
                            )}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
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
        </div>
    );
};

export default Announcement;