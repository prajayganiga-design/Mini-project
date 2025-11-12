// API Base URL
const API_BASE = '/api';

// State
let currentEventId = null;
let events = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadEvents();
    setupEventForm();
    setupRegistrationForm();
    setupModals();
});

// Navigation
function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.dataset.page;
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active page
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`${pageId}-page`).classList.add('active');
            
            // Reload events if going to events page
            if (pageId === 'events') {
                loadEvents();
            } else if (pageId === 'admin') {
                loadAdminEvents();
            }
        });
    });
}

// Load events for events page
async function loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        const response = await fetch(`${API_BASE}/events`);
        if (!response.ok) throw new Error('Failed to load events');
        
        events = await response.json();
        
        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No events available</h3>
                    <p>Check back later for upcoming events!</p>
                </div>
            `;
            return;
        }

        // Load registration counts for all events
        const eventsWithRegCounts = await Promise.all(
            events.map(async (event) => {
                try {
                    const regResponse = await fetch(`${API_BASE}/events/${event.event_id}/registrations/count`);
                    const regData = await regResponse.json();
                    return { ...event, regCount: regData.count };
                } catch (error) {
                    return { ...event, regCount: 0 };
                }
            })
        );

        eventsGrid.innerHTML = eventsWithRegCounts.map(event => createEventCard(event)).join('');
        
        // Add event listeners to cards
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    const eventId = card.dataset.eventId;
                    showEventDetails(eventId);
                }
            });
        });

        // Add register button listeners
        document.querySelectorAll('.btn-register').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                openRegistrationModal(eventId);
            });
        });

    } catch (error) {
        showToast('Error loading events: ' + error.message, 'error');
        eventsGrid.innerHTML = `
            <div class="empty-state">
                <h3>Error loading events</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Create event card HTML
function createEventCard(event) {
    const startDate = formatDate(event.start_date);
    const endDate = formatDate(event.end_date);
    const startTime = formatTime(event.start_time);
    const endTime = formatTime(event.end_time);
    const dateDisplay = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    const regCount = event.regCount || 0;
    const isFull = event.max_participants && regCount >= event.max_participants;
    const spotsLeft = event.max_participants ? event.max_participants - regCount : null;
    
    return `
        <div class="event-card" data-event-id="${event.event_id}">
            <div class="event-card-header">
                <div class="event-id">${event.event_id}</div>
                ${isFull ? '<div class="event-badge full">Full</div>' : ''}
            </div>
            <h3 class="event-name">${event.event_name}</h3>
            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
            <div class="event-details">
                <div class="event-detail-item">
                    <span>📅 Date:</span> ${dateDisplay}
                </div>
                <div class="event-detail-item">
                    <span>🕐 Time:</span> ${startTime} - ${endTime}
                </div>
                ${event.venue ? `<div class="event-detail-item"><span>📍 Venue:</span> ${event.venue}</div>` : ''}
                <div class="event-detail-item">
                    <span>👥 Registered:</span> ${regCount}${event.max_participants ? ` / ${event.max_participants}` : ''}
                    ${spotsLeft !== null && !isFull ? ` (${spotsLeft} spots left)` : ''}
                </div>
            </div>
            <div class="event-footer">
                <div class="event-date">${startDate}</div>
                <button class="btn btn-primary btn-register" data-event-id="${event.event_id}" ${isFull ? 'disabled' : ''}>
                    ${isFull ? 'Full' : 'Register'}
                </button>
            </div>
        </div>
    `;
}

// Show event details modal
async function showEventDetails(eventId) {
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to load event details');
        
        const event = await response.json();
        const modal = document.getElementById('event-details-modal');
        const content = document.getElementById('event-details-content');
        
        const startDate = formatDate(event.start_date);
        const endDate = formatDate(event.end_date);
        const startTime = formatTime(event.start_time);
        const endTime = formatTime(event.end_time);
        
        // Get registration count
        const regResponse = await fetch(`${API_BASE}/events/${eventId}/registrations/count`);
        const regData = await regResponse.json();
        const regCount = regData.count;
        
        content.innerHTML = `
            <h2>${event.event_name}</h2>
            <div class="event-info">
                <p><strong>Event ID:</strong> ${event.event_id}</p>
                ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                <p><strong>Start Date:</strong> ${startDate} at ${startTime}</p>
                <p><strong>End Date:</strong> ${endDate} at ${endTime}</p>
                ${event.venue ? `<p><strong>Venue:</strong> ${event.venue}</p>` : ''}
                ${event.max_participants ? `<p><strong>Max Participants:</strong> ${event.max_participants}</p>` : ''}
                <p><strong>Registered:</strong> ${regCount} ${event.max_participants ? `of ${event.max_participants}` : ''}</p>
            </div>
            <button class="btn btn-primary" onclick="openRegistrationModal('${event.event_id}'); closeModal('event-details-modal');">Register Now</button>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        showToast('Error loading event details: ' + error.message, 'error');
    }
}

// Setup event form (admin)
function setupEventForm() {
    const form = document.getElementById('event-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const eventData = {
            event_id: formData.get('event_id'),
            event_name: formData.get('event_name'),
            description: formData.get('description'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            start_time: formData.get('start_time'),
            end_time: formData.get('end_time'),
            venue: formData.get('venue'),
            max_participants: formData.get('max_participants') || null
        };

        try {
            const response = await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create event');
            }

            showToast('Event created successfully!', 'success');
            form.reset();
            loadAdminEvents();
            loadEvents();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });
}

// Load events for admin page
async function loadAdminEvents() {
    const adminEventsList = document.getElementById('admin-events-list');
    adminEventsList.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        const response = await fetch(`${API_BASE}/events`);
        if (!response.ok) throw new Error('Failed to load events');
        
        const adminEvents = await response.json();
        
        if (adminEvents.length === 0) {
            adminEventsList.innerHTML = '<p>No events created yet. Create your first event above!</p>';
            return;
        }

        adminEventsList.innerHTML = adminEvents.map(event => `
            <div class="admin-event-item">
                <div class="admin-event-info">
                    <h4>${event.event_name}</h4>
                    <p>${event.event_id} | ${formatDate(event.start_date)} ${formatTime(event.start_time)}</p>
                </div>
                <div class="admin-event-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.event_id}')">Delete</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        showToast('Error loading events: ' + error.message, 'error');
    }
}

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete event');
        }

        showToast('Event deleted successfully!', 'success');
        loadAdminEvents();
        loadEvents();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Setup registration form
function setupRegistrationForm() {
    const form = document.getElementById('registration-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const registrationData = {
            user_name: formData.get('reg_name'),
            user_email: formData.get('reg_email'),
            user_phone: formData.get('reg_phone') || null
        };

        try {
            const response = await fetch(`${API_BASE}/events/${currentEventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register');
            }

            showToast('Registration successful!', 'success');
            closeModal('registration-modal');
            form.reset();
            // Reload events to update registration counts
            loadEvents();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });
}

// Setup modals
function setupModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            closeModal(modal.id);
        });
    });
}

// Open registration modal
function openRegistrationModal(eventId) {
    currentEventId = eventId;
    const modal = document.getElementById('registration-modal');
    modal.classList.add('active');
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Show toast notification
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Make functions globally available
window.openRegistrationModal = openRegistrationModal;
window.closeModal = closeModal;
window.deleteEvent = deleteEvent;

