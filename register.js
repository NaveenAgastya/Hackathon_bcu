// User Management System
const userDatabase = {
    // Sample users (in a real app, this would be a database)
    users: [
        {
            id: 1,
            name: "Food Donor",
            email: "donor@example.com",
            password: "donor123",
            role: "donor",
            phone: "+1234567890",
            location: "Downtown",
            notifications: []
        }
    ],
    
    // Find user by email
    findUserByEmail: function(email) {
        return this.users.find(user => user.email === email);
    },
    
    // Find user by ID
    findUserById: function(id) {
        return this.users.find(user => user.id === id);
    },
    
    // Get all users of a specific role
    getUsersByRole: function(role) {
        return this.users.filter(user => user.role === role);
    },
    
    // Add a new user
    addUser: function(user) {
        const newId = Math.max(...this.users.map(u => u.id)) + 1;
        user.id = newId;
        user.notifications = [];
        this.users.push(user);
        return user;
    },
    
    // Add a notification to a user
    addNotification: function(userId, notification) {
        const user = this.findUserById(userId);
        if (user) {
            const notificationId = Math.max(...user.notifications.map(n => n.id), 0) + 1;
            user.notifications.unshift({
                id: notificationId,
                ...notification,
                read: false,
                createdAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    },
    
    // Mark notification as read
    markNotificationAsRead: function(userId, notificationId) {
        const user = this.findUserById(userId);
        if (user) {
            const notification = user.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                return true;
            }
        }
        return false;
    }
};

// Food Request System
const foodRequestSystem = {
    requests: [],
    
    // Create a new food request
    createRequest: function(seekerId, details) {
        const requestId = Math.max(...this.requests.map(r => r.id), 0) + 1;
        const newRequest = {
            id: requestId,
            seekerId,
            ...details,
            status: "pending", // pending, accepted, fulfilled, cancelled
            donorId: null,
            volunteerId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.requests.push(newRequest);
        
        // Notify all donors about this new request
        this.notifyDonors(newRequest);
        
        return newRequest;
    },
    
    // Notify all donors about a new request
    notifyDonors: function(request) {
        const donors = userDatabase.getUsersByRole("donor");
        donors.forEach(donor => {
            userDatabase.addNotification(donor.id, {
                type: "potential_request",
                title: "Potential Food Request",
                message: `${request.seekerName} is inquiring about ${request.quantity} meals. Would you be able to help?`,
                requestId: request.id,
                action: {
                    communicate: "Discuss Details",
                    decline: "Not Available"
                },
                seekerId: request.seekerId
            });
        });
    },

    // New function to handle donor communication response
    handleDonorCommunication: function(donorId, requestId, response) {
        const request = this.requests.find(r => r.id === requestId);
        const donor = userDatabase.findUserById(donorId);
        const seeker = userDatabase.findUserById(request.seekerId);
        
        if (response === "communicate") {
            // Open communication channel between seeker and donor
            this.openCommunicationChannel(seeker.id, donor.id, requestId);
            
            // Notify seeker that donor is interested
            userDatabase.addNotification(seeker.id, {
                type: "donor_interested",
                title: "Donor Interested",
                message: `${donor.name} is interested in helping with your request. You can now discuss details.`,
                requestId: request.id,
                donorId: donor.id
            });
            
            return true;
        } else if (response === "decline") {
            // Simply mark as read (no action needed)
            return true;
        }
        
        return false;
    },

    // New function to create communication channel
    openCommunicationChannel: function(seekerId, donorId, requestId) {
        // In a real app, this would create a chat thread or similar
        console.log(`Opening communication between seeker ${seekerId} and donor ${donorId} for request ${requestId}`);
        
        // For our demo, we'll just track it in the request
        const request = this.requests.find(r => r.id === requestId);
        if (request) {
            request.communication = {
                seekerId,
                donorId,
                messages: []
            };
        }
    },

    // New function to send message between users
    sendMessage: function(senderId, receiverId, requestId, message) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request || !request.communication) return false;
        
        // Verify sender is part of this communication
        if (senderId !== request.communication.seekerId && senderId !== request.communication.donorId) {
            return false;
        }
        
        // Add message to communication log
        request.communication.messages.push({
            senderId,
            message,
            timestamp: new Date().toISOString()
        });
        
        // Notify the receiver
        userDatabase.addNotification(receiverId, {
            type: "new_message",
            title: "New Message",
            message: `You have a new message about request #${requestId}`,
            requestId: request.id,
            senderId
        });
        
        return true;
    },

    // Modified createRequest to include seeker name
    createRequest: function(seekerId, details) {
        const seeker = userDatabase.findUserById(seekerId);
        const requestId = Math.max(...this.requests.map(r => r.id), 0) + 1;
        const newRequest = {
            id: requestId,
            seekerId,
            seekerName: seeker.name,
            ...details,
            status: "inquiring", // inquiring, pending, accepted, fulfilled, cancelled
            donorId: null,
            volunteerId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.requests.push(newRequest);
        
        // Notify all donors about this new inquiry
        this.notifyDonors(newRequest);
        
        return newRequest;
    },

    // New function to formalize the request after communication
    formalizeRequest: function(requestId, donorId, details) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request || request.status !== "inquiring") return false;
        
        // Update request with formal details
        request.status = "pending";
        request.donorId = donorId;
        request.pickupLocation = details.pickupLocation;
        request.pickupTime = details.pickupTime;
        request.deliveryLocation = request.deliveryLocation || details.deliveryLocation;
        request.updatedAt = new Date().toISOString();
        
        // Notify the seeker that request is formalized
        const donor = userDatabase.findUserById(donorId);
        userDatabase.addNotification(request.seekerId, {
            type: "request_formalized",
            title: "Request Confirmed",
            message: `${donor.name} has confirmed your request for ${request.quantity} meals.`,
            requestId: request.id
        });
        
        // Notify volunteers about the delivery opportunity
        this.notifyVolunteers(request);
        
        return true;
    },

    // Enhanced notifyVolunteers with map preview
    notifyVolunteers: function(request) {
        const volunteers = userDatabase.getUsersByRole("volunteer");
        const donor = userDatabase.findUserById(request.donorId);
        const seeker = userDatabase.findUserById(request.seekerId);
        
        volunteers.forEach(volunteer => {
            userDatabase.addNotification(volunteer.id, {
                type: "delivery_opportunity",
                title: "Delivery Needed",
                message: `A food donation needs to be delivered from ${donor.name} to ${seeker.name}.`,
                requestId: request.id,
                mapPreview: this.generateMapPreview(request.pickupLocation, request.deliveryLocation),
                action: {
                    accept: "Accept Delivery",
                    reject: "Decline"
                }
            });
        });
    },

    // New function to generate map preview (simplified for demo)
    generateMapPreview: function(pickupLocation, deliveryLocation) {
        // In a real app, this would generate a map image using Google Maps API or similar
        return {
            pickup: pickupLocation,
            delivery: deliveryLocation,
            distance: "5.2 miles", // Calculated distance
            duration: "15-20 mins" // Estimated duration
        };
    },

    // Enhanced handleVolunteerResponse with map display
    handleVolunteerResponse: function(requestId, volunteerId, response) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request || request.status !== "pending") return false;
        
        if (response === "accept") {
            // Update request status and assign volunteer
            request.status = "assigned";
            request.volunteerId = volunteerId;
            request.updatedAt = new Date().toISOString();
            
            // Get user details for notifications
            const volunteer = userDatabase.findUserById(volunteerId);
            const donor = userDatabase.findUserById(request.donorId);
            const seeker = userDatabase.findUserById(request.seekerId);
            
            // Notify the seeker
            userDatabase.addNotification(request.seekerId, {
                type: "volunteer_assigned",
                title: "Volunteer Assigned",
                message: `${volunteer.name} has been assigned to deliver your food.`,
                requestId: request.id,
                mapLink: this.generateMapLink(request.pickupLocation, request.deliveryLocation)
            });
            
            // Notify the donor
            userDatabase.addNotification(request.donorId, {
                type: "volunteer_assigned",
                title: "Volunteer Assigned",
                message: `${volunteer.name} will pick up your donation.`,
                requestId: request.id,
                volunteerContact: volunteer.phone
            });
            
            // Notify other volunteers
            const otherVolunteers = userDatabase.getUsersByRole("volunteer").filter(v => v.id !== volunteerId);
            otherVolunteers.forEach(volunteer => {
                userDatabase.addNotification(volunteer.id, {
                    type: "delivery_assigned",
                    title: "Delivery Assigned",
                    message: `The delivery for request #${request.id} has been assigned.`,
                    requestId: request.id
                });
            });
            
            // Notify the volunteer with full map and details
            userDatabase.addNotification(volunteerId, {
                type: "delivery_details",
                title: "Delivery Instructions",
                message: `Please pick up from ${donor.name} at ${request.pickupLocation} and deliver to ${seeker.name} at ${request.deliveryLocation}.`,
                requestId: request.id,
                fullMap: this.generateMapLink(request.pickupLocation, request.deliveryLocation),
                donorContact: donor.phone,
                seekerContact: seeker.phone,
                pickupTime: request.pickupTime
            });
            
            return true;
        } else if (response === "reject") {
            // Simply mark as read (no action needed)
            return true;
        }
        
        return false;
    },

    // New function to generate map link
    generateMapLink: function(pickupLocation, deliveryLocation) {
        // In a real app, this would generate a Google Maps or similar link
        // For demo purposes, we'll use a placeholder
        return `https://maps.example.com/route?from=${encodeURIComponent(pickupLocation)}&to=${encodeURIComponent(deliveryLocation)}`;
    }
};

// Authentication System
const authSystem = {
    currentUser: null,
    
    // Login function
    login: function(email, password) {
        const user = userDatabase.findUserByEmail(email);
        if (user && user.password === password) {
            this.currentUser = user;
            return user;
        }
        return null;
    },
    
    // Register function
    register: function(userData) {
        // Check if email already exists
        if (userDatabase.findUserByEmail(userData.email)) {
            return { error: "Email already in use" };
        }
        
        // Validate password match
        if (userData.password !== userData.confirm) {
            return { error: "Passwords don't match" };
        }
        
        // Create new user
        const newUser = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            phone: userData.phone || "",
            location: userData.location || ""
        };
        
        const user = userDatabase.addUser(newUser);
        this.currentUser = user;
        return { user };
    },
    
    // Logout function
    logout: function() {
        this.currentUser = null;
    },
    
    // Check if user is authenticated
    isAuthenticated: function() {
        return this.currentUser !== null;
    },
    
    // Get current user
    getUser: function() {
        return this.currentUser;
    }
};

// DOM Elements
const loginPage = document.getElementById('login-page');
const appContainer = document.querySelector('.app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const usernameDisplay = document.querySelector('.username');
const userAvatar = document.querySelector('.user-avatar');

// Notification Elements
const notificationDropdown = document.createElement('div');
notificationDropdown.className = 'notification-dropdown';
notificationDropdown.innerHTML = `
    <div class="notification-header">
        <h4>Notifications</h4>
        <button id="mark-all-read"><i class="fas fa-check-double"></i> Mark all as read</button>
    </div>
    <div class="notification-list"></div>
    <div class="notification-footer">
        <a href="#" id="view-all-notifications">View all notifications</a>
    </div>
`;

// Add notification dropdown to user menu
const userMenu = document.querySelector('.user-menu');
userMenu.appendChild(notificationDropdown);

// Toggle between login and register forms
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginPage.classList.add('show-register');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginPage.classList.remove('show-register');
});

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = authSystem.login(email, password);
    if (user) {
        showToast(`Welcome back, ${user.name}!`, 'success');
        initializeAppForUser(user);
    } else {
        showToast('Invalid email or password', 'error');
    }
});

// Register Form Submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        confirm: document.getElementById('register-confirm').value,
        role: document.querySelector('input[name="role"]:checked').value,
        phone: "",
        location: ""
    };
    
    const result = authSystem.register(userData);
    if (result.error) {
        showToast(result.error, 'error');
    } else {
        showToast(`Account created successfully! Welcome, ${result.user.name}`, 'success');
        initializeAppForUser(result.user);
    }
});

// Initialize the app for a logged-in user
function initializeAppForUser(user) {
    // Hide login page and show app
    loginPage.style.display = 'none';
    appContainer.style.display = 'flex';
    
    // Update user display
    usernameDisplay.textContent = user.name;
    userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
    
    // Show appropriate tabs based on user role
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        const tabName = tab.dataset.tab;
        
        // Hide dashboard tab for seekers
        if (tabName === 'dashboard' && user.role === 'seeker') {
            tab.style.display = 'none';
        } else {
            tab.style.display = 'flex';
        }
    });
    
    // Load user-specific content
    loadUserContent(user);
    
    // Initialize notification system
    initializeNotifications(user);
}

// Load user-specific content
function loadUserContent(user) {
    // Update dashboard stats if on dashboard
    if (document.getElementById('dashboard')) {
        // Load user-specific dashboard data
        document.getElementById('user-donations-count').textContent = "12"; // Example data
        document.getElementById('user-meals-count').textContent = "84"; // Example data
        document.getElementById('user-deliveries-count').textContent = "7"; // Example data
        document.getElementById('people-helped-count').textContent = "150"; // Example data
    }
    
    // Customize request form for seekers
    if (user.role === 'seeker' && document.getElementById('request-form')) {
        const requestForm = document.getElementById('request-form');
        requestForm.elements['request-name'].value = user.name;
        // Could pre-fill other fields based on user profile
    }
}

// Initialize notification system
function initializeNotifications(user) {
    const notificationList = notificationDropdown.querySelector('.notification-list');
    
    // Function to update notification list
    function updateNotifications() {
        const notificationList = notificationDropdown.querySelector('.notification-list');
        const user = authSystem.getUser();
        
        notificationList.innerHTML = '';
        
        if (user.notifications.length === 0) {
            notificationList.innerHTML = '<div class="empty-notifications">No new notifications</div>';
            return;
        }
        
        user.notifications.slice(0, 5).forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            notificationItem.dataset.notificationId = notification.id;
            
            // Special handling for map previews
            let mapPreviewHTML = '';
            if (notification.mapPreview) {
                mapPreviewHTML = `
                    <div class="notification-map-preview">
                        <div class="map-placeholder">
                            <i class="fas fa-map-marked-alt"></i>
                            <span>Map Preview</span>
                        </div>
                        <div class="notification-map-stats">
                            <span><i class="fas fa-route"></i> ${notification.mapPreview.distance}</span>
                            <span><i class="fas fa-clock"></i> ${notification.mapPreview.duration}</span>
                        </div>
                    </div>
                `;
            }
            
            notificationItem.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    ${mapPreviewHTML}
                    <div class="notification-time">${formatRelativeTime(notification.createdAt)}</div>
                    ${notification.action ? `
                    <div class="notification-actions">
                        <button class="notification-action accept" data-action="accept">${notification.action.accept}</button>
                        <button class="notification-action reject" data-action="reject">${notification.action.reject}</button>
                    </div>` : ''}
                    ${notification.fullMap ? `
                    <div class="notification-actions">
                        <button class="notification-action view" data-action="view">View Map</button>
                    </div>` : ''}
                </div>
            `;
            
            notificationList.appendChild(notificationItem);
            
            // Add click handler to mark as read
            notificationItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('notification-action')) {
                    userDatabase.markNotificationAsRead(user.id, notification.id);
                    updateNotifications();
                    
                    // If it's a request notification, show the request details
                    if (notification.requestId) {
                        // In a real app, you would show the request details
                        console.log(`Showing details for request ${notification.requestId}`);
                    }
                }
            });
            
            // Add handlers for action buttons
            if (notification.action) {
                const acceptBtn = notificationItem.querySelector('.accept');
                const rejectBtn = notificationItem.querySelector('.reject');
                
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleNotificationAction(user, notification, 'accept');
                    });
                }
                
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleNotificationAction(user, notification, 'reject');
                    });
                }
            }
        });
    }
    
    // Mark all as read button
    notificationDropdown.querySelector('#mark-all-read').addEventListener('click', (e) => {
        e.stopPropagation();
        user.notifications.forEach(notification => {
            notification.read = true;
        });
        updateNotifications();
    });
    
    // View all notifications button
    notificationDropdown.querySelector('#view-all-notifications').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // In a full app, this would show all notifications in a modal or separate page
        showToast('Showing all notifications', 'info');
    });
    
    // Toggle notification dropdown
    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        notificationDropdown.style.display = 'none';
    });
    
    // Initial update
    updateNotifications();
    
    // Simulate real-time updates (in a real app, this would be WebSocket or polling)
    setInterval(() => {
        // Check for new notifications
        updateNotifications();
    }, 30000); // Check every 30 seconds
}

// Handle notification actions
function handleNotificationAction(user, notification, action) {
        if (notification.type === 'potential_request' && user.role === 'donor') {
            // Donor is responding to a potential request
            if (action === 'communicate') {
                // Open communication modal
                openCommunicationModal(notification.requestId, notification.seekerId, user.id);
                return true;
            } else if (action === 'decline') {
                // Simply mark as read
                userDatabase.markNotificationAsRead(user.id, notification.id);
                return true;
            }
        } 
        else if (notification.type === 'delivery_opportunity' && user.role === 'volunteer') {
            // Volunteer is responding to a delivery request
            if (action === 'accept') {
                // Show map modal before accepting
                openMapModal(notification.requestId, () => {
                    const success = foodRequestSystem.handleVolunteerResponse(
                        notification.requestId, 
                        user.id, 
                        action
                    );
                    
                    if (success) {
                        showToast(`Delivery accepted!`, 'success');
                        // Close the modal after accepting
                        closeMapModal();
                    } else {
                        showToast('Could not accept delivery', 'error');
                    }
                });
                return true;
            } else if (action === 'reject') {
                const success = foodRequestSystem.handleVolunteerResponse(
                    notification.requestId, 
                    user.id, 
                    action
                );
                
                if (success) {
                    showToast(`Delivery declined`, 'info');
                } else {
                    showToast('Could not process your response', 'error');
                }
                return true;
            }
        }
        else if (notification.type === 'delivery_details' && user.role === 'volunteer') {
            // Volunteer viewing delivery details - show map
            if (action === 'view') {
                openMapModal(notification.requestId);
                return true;
            }
        }
        
        // Default handling (from previous implementation)
        return defaultHandleNotificationAction(user, notification, action);
}

function openCommunicationModal(requestId, seekerId, donorId) {
    const modal = document.getElementById('communication-modal');
    const messageContainer = document.getElementById('message-container');
    const sendButton = document.getElementById('send-message');
    const formalizeButton = document.getElementById('formalize-request');
    
    // Load existing messages
    const request = foodRequestSystem.requests.find(r => r.id === requestId);
    if (!request || !request.communication) return;
    
    // Display messages
    messageContainer.innerHTML = '';
    request.communication.messages.forEach(msg => {
        const sender = userDatabase.findUserById(msg.senderId);
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.senderId === donorId ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <div class="message-sender">${sender.name}</div>
            <div class="message-text">${msg.message}</div>
            <div class="message-time">${formatRelativeTime(msg.timestamp)}</div>
        `;
        messageContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
    
    // Set up message sending
    sendButton.onclick = () => {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        if (message) {
            foodRequestSystem.sendMessage(donorId, seekerId, requestId, message);
            messageInput.value = '';
            
            // Refresh messages
            openCommunicationModal(requestId, seekerId, donorId);
        }
    };
    
    // Set up formalize request button
    formalizeButton.onclick = () => {
        // In a real app, you'd collect pickup details here
        const pickupDetails = {
            pickupLocation: "123 Donor Street", // Would come from a form
            pickupTime: "2025-04-05T15:00:00" // Would come from a form
        };
        
        const success = foodRequestSystem.formalizeRequest(requestId, donorId, pickupDetails);
        if (success) {
            showToast('Request formalized! Volunteers have been notified.', 'success');
            closeCommunicationModal();
        } else {
            showToast('Could not formalize request', 'error');
        }
    };
    
    // Show modal
    modal.style.display = 'flex';
    
    // Close modal when clicking X
    document.querySelector('#communication-modal .close-modal').onclick = closeCommunicationModal;
}

function closeCommunicationModal() {
    document.getElementById('communication-modal').style.display = 'none';
}

// Map Modal Functions
function openMapModal(requestId, onAcceptCallback = null) {
    const modal = document.getElementById('map-modal');
    const request = foodRequestSystem.requests.find(r => r.id === requestId);
    if (!request) return;
    
    const donor = userDatabase.findUserById(request.donorId);
    const seeker = userDatabase.findUserById(request.seekerId);
    
    // Update map details
    document.getElementById('pickup-location').textContent = request.pickupLocation || donor.location;
    document.getElementById('delivery-location').textContent = request.deliveryLocation || seeker.location;
    
    // In a real app, you would load an actual map here using Google Maps API or similar
    const mapPreview = foodRequestSystem.generateMapPreview(
        request.pickupLocation || donor.location, 
        request.deliveryLocation || seeker.location
    );
    
    document.getElementById('route-distance').textContent = mapPreview.distance;
    document.getElementById('route-duration').textContent = mapPreview.duration;
    
    // Set up open in maps button
    document.getElementById('open-in-maps').onclick = () => {
        const mapLink = foodRequestSystem.generateMapLink(
            request.pickupLocation || donor.location, 
            request.deliveryLocation || seeker.location
        );
        window.open(mapLink, '_blank');
    };
    
    // If this is for accepting a delivery, show the accept button
    if (onAcceptCallback) {
        const footer = modal.querySelector('.modal-footer');
        footer.innerHTML = `
            <button id="confirm-accept" class="btn-primary">
                <i class="fas fa-check"></i> Confirm Acceptance
            </button>
        `;
        document.getElementById('confirm-accept').onclick = onAcceptCallback;
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Close modal when clicking X
    document.querySelector('#map-modal .close-modal').onclick = closeMapModal;
}

function closeMapModal() {
    document.getElementById('map-modal').style.display = 'none';
}

// Helper function to get icon for notification type
function getNotificationIcon(type) {
    switch(type) {
        case 'new_request': return 'fa-hand-holding-heart';
        case 'request_accepted': return 'fa-check-circle';
        case 'request_fulfilled': return 'fa-info-circle';
        case 'delivery_opportunity': return 'fa-truck';
        case 'volunteer_assigned': return 'fa-people-carry';
        case 'request_completed': return 'fa-check-double';
        default: return 'fa-bell';
    }
}
foodRequestSystem
// Helper function to format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Hide main app until logged in
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Initialize message input to send on Enter
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('send-message').click();
            }
        });
    }
    
    // Check for remembered login (in a real app, you'd use localStorage or cookies)
    // For now, always show login page
    
    // Initialize other systems
    loadImpactStats();
    loadNearbyDonations();
    loadAvailableFood();
    loadAvailableDeliveries();
    
    // Initialize food request form if on request page
    if (document.getElementById('request-form')) {
        document.getElementById('request-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!authSystem.isAuthenticated()) {
                showToast('Please log in to request food', 'error');
                return;
            }
            
            const user = authSystem.getUser();
            if (user.role !== 'seeker') {
                showToast('Only food seekers can make requests', 'error');
                return;
            }
            
            const formData = {
                quantity: document.getElementById('request-people').value,
                dietaryRestrictions: document.getElementById('dietary-restrictions').value,
                deliveryLocation: document.getElementById('request-location').value,
                contactNumber: document.getElementById('request-contact').value,
                urgency: document.getElementById('request-urgency').value || 'normal',
                preferredTime: document.getElementById('request-time').value || 'anytime'
            };
            
            // Create an inquiry first (not a formal request yet)
            const request = foodRequestSystem.createRequest(user.id, formData);
            showToast('Your request has been sent to potential donors. You will be notified when someone responds.', 'success');
            
            // Reset form
            e.target.reset();
        });
    }
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.innerHTML = `
    .notification-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        width: 350px;
        background-color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-height: 500px;
        overflow-y: auto;
    }
    
    .notification-header {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--bg-dark);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .notification-header h4 {
        margin: 0;
        font-size: 1rem;
    }
    
    .notification-header button {
        background: none;
        border: none;
        color: var(--primary-color);
        font-size: 0.8rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }
    
    .notification-list {
        padding: var(--spacing-sm);
    }
    
    .notification-item {
        display: flex;
        padding: var(--spacing-md);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }
    
    .notification-item:hover {
        background-color: var(--bg-light);
    }
    
    .notification-item.unread {
        background-color: var(--primary-50);
    }
    
    .notification-icon {
        font-size: 1.2rem;
        color: var(--primary-color);
        margin-right: var(--spacing-md);
        padding-top: 2px;
    }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-title {
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
    }
    
    .notification-message {
        font-size: 0.9rem;
        color: var(--text-medium);
        margin-bottom: var(--spacing-xs);
    }
    
    .notification-time {
        font-size: 0.8rem;
        color: var(--text-light);
    }
    
    .notification-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }
    
    .notification-action {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        cursor: pointer;
        border: none;
    }
    
    .notification-action.accept {
        background-color: var(--primary-color);
        color: white;
    }
    
    .notification-action.reject {
        background-color: var(--bg-white);
        border: 1px solid var(--bg-dark);
    }
    
    .notification-footer {
        padding: var(--spacing-md);
        border-top: 1px solid var(--bg-dark);
        text-align: center;
    }
    
    .notification-footer a {
        color: var(--primary-color);
        font-size: 0.9rem;
    }
    
    .empty-notifications {
        padding: var(--spacing-md);
        text-align: center;
        color: var(--text-medium);
    }
`;

document.head.appendChild(notificationStyles);