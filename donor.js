document.addEventListener('DOMContentLoaded', function() {
    // Check if on donor dashboard
    if (document.getElementById('donor-dashboard')) {
        loadDonorNotifications();
        setupDonorEventListeners();
    }
    
    function loadDonorNotifications() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'donor') return;
        
        const notifications = JSON.parse(localStorage.getItem('donorNotifications')) || [];
        const donorNotifications = notifications.filter(n => n.donorId === currentUser.id && n.status === 'unread');
        
        const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
        
        const notificationsContainer = document.getElementById('donor-notifications');
        if (donorNotifications.length === 0) {
            notificationsContainer.innerHTML = '<p>No new notifications</p>';
            return;
        }
        
        notificationsContainer.innerHTML = donorNotifications.map(notification => {
            const request = requests.find(r => r.id === notification.requestId);
            if (!request) return '';
            
            return `
                <div class="notification-card" data-request-id="${request.id}">
                    <h4>${notification.message}</h4>
                    <p>Location: ${request.location}</p>
                    <p>Dietary Restrictions: ${request.dietaryRestrictions || 'None'}</p>
                    <div class="notification-actions">
                        <button class="accept-btn">Accept</button>
                        <button class="reject-btn">Reject</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function setupDonorEventListeners() {
        document.addEventListener('click', function(e) {
            // Handle accept button
            if (e.target.classList.contains('accept-btn')) {
                const notificationCard = e.target.closest('.notification-card');
                const requestId = notificationCard.dataset.requestId;
                acceptRequest(requestId);
            }
            
            // Handle reject button
            if (e.target.classList.contains('reject-btn')) {
                const notificationCard = e.target.closest('.notification-card');
                const requestId = notificationCard.dataset.requestId;
                rejectRequest(requestId);
            }
        });
    }
    
    function acceptRequest(requestId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const requests = JSON.parse(localStorage.getItem('foodRequests'));
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
            // Update request
            request.status = 'accepted';
            request.donorId = currentUser.id;
            request.updatedAt = new Date().toISOString();
            
            // Update all notifications for this request
            const notifications = JSON.parse(localStorage.getItem('donorNotifications'));
            notifications.forEach(n => {
                if (n.requestId === requestId) {
                    n.status = 'read';
                }
            });
            
            // Save changes
            localStorage.setItem('foodRequests', JSON.stringify(requests));
            localStorage.setItem('donorNotifications', JSON.stringify(notifications));
            
            // Notify volunteers
            notifyVolunteers(request);
            
            // Refresh UI
            loadDonorNotifications();
            alert('You have accepted this request. Volunteers will be notified.');
        }
    }
    
    function rejectRequest(requestId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const notifications = JSON.parse(localStorage.getItem('donorNotifications'));
        
        // Mark notification as read
        const notification = notifications.find(n => 
            n.requestId === requestId && n.donorId === currentUser.id
        );
        
        if (notification) {
            notification.status = 'read';
            localStorage.setItem('donorNotifications', JSON.stringify(notifications));
            loadDonorNotifications();
        }
    }
    
    function notifyVolunteers(request) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const volunteers = users.filter(user => user.role === 'volunteer');
        
        const volunteerNotifications = JSON.parse(localStorage.getItem('volunteerNotifications')) || [];
        
        volunteers.forEach(volunteer => {
            volunteerNotifications.push({
                id: Date.now().toString() + volunteer.id,
                volunteerId: volunteer.id,
                requestId: request.id,
                message: `New delivery request for ${request.seekerName} (${request.peopleCount} people)`,
                status: 'unread',
                createdAt: new Date().toISOString()
            });
        });
        
        localStorage.setItem('volunteerNotifications', JSON.stringify(volunteerNotifications));
    }
});