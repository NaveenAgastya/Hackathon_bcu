document.addEventListener('DOMContentLoaded', function() {
    // Check if on volunteer dashboard
    if (document.getElementById('volunteer-dashboard')) {
        loadVolunteerNotifications();
        setupVolunteerEventListeners();
    }
    
    function loadVolunteerNotifications() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'volunteer') return;
        
        const notifications = JSON.parse(localStorage.getItem('volunteerNotifications')) || [];
        const volunteerNotifications = notifications.filter(n => 
            n.volunteerId === currentUser.id && n.status === 'unread'
        );
        
        const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
        
        const notificationsContainer = document.getElementById('volunteer-notifications');
        if (volunteerNotifications.length === 0) {
            notificationsContainer.innerHTML = '<p>No new notifications</p>';
            return;
        }
        
        notificationsContainer.innerHTML = volunteerNotifications.map(notification => {
            const request = requests.find(r => r.id === notification.requestId);
            if (!request || request.status !== 'accepted') return '';
            
            const donor = getUserById(request.donorId);
            
            return `
                <div class="notification-card" data-request-id="${request.id}">
                    <h4>${notification.message}</h4>
                    <p>Pickup from: ${donor?.name || 'Unknown donor'}</p>
                    <p>Deliver to: ${request.location}</p>
                    <div class="notification-actions">
                        <button class="accept-btn">Accept Delivery</button>
                        <button class="reject-btn">Reject</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function setupVolunteerEventListeners() {
        document.addEventListener('click', function(e) {
            // Handle accept button
            if (e.target.classList.contains('accept-btn')) {
                const notificationCard = e.target.closest('.notification-card');
                const requestId = notificationCard.dataset.requestId;
                acceptDelivery(requestId);
            }
            
            // Handle reject button
            if (e.target.classList.contains('reject-btn')) {
                const notificationCard = e.target.closest('.notification-card');
                const requestId = notificationCard.dataset.requestId;
                rejectDelivery(requestId);
            }
        });
    }
    
    function acceptDelivery(requestId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const requests = JSON.parse(localStorage.getItem('foodRequests'));
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
            // Update request
            request.status = 'in-progress';
            request.volunteerId = currentUser.id;
            request.updatedAt = new Date().toISOString();
            
            // Update all notifications for this request
            const notifications = JSON.parse(localStorage.getItem('volunteerNotifications'));
            notifications.forEach(n => {
                if (n.requestId === requestId) {
                    n.status = 'read';
                }
            });
            
            // Save changes
            localStorage.setItem('foodRequests', JSON.stringify(requests));
            localStorage.setItem('volunteerNotifications', JSON.stringify(notifications));
            
            // Show delivery map
            showDeliveryMap(request);
            
            // Refresh UI
            loadVolunteerNotifications();
        }
    }
    
    function rejectDelivery(requestId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const notifications = JSON.parse(localStorage.getItem('volunteerNotifications'));
        
        // Mark notification as read
        const notification = notifications.find(n => 
            n.requestId === requestId && n.volunteerId === currentUser.id
        );
        
        if (notification) {
            notification.status = 'read';
            localStorage.setItem('volunteerNotifications', JSON.stringify(notifications));
            loadVolunteerNotifications();
        }
    }
    
    function showDeliveryMap(request) {
        const donor = getUserById(request.donorId);
        const seekerLocation = request.location;
        
        // In a real app, you would integrate with Google Maps API here
        // For demo purposes, we'll just show the addresses
        
        const mapContainer = document.getElementById('delivery-map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <h3>Delivery Route</h3>
                <div class="route-info">
                    <div class="route-point">
                        <h4>Pickup Location</h4>
                        <p>${donor?.name || 'Donor'}'s location</p>
                    </div>
                    <div class="route-point">
                        <h4>Delivery Location</h4>
                        <p>${seekerLocation}</p>
                    </div>
                </div>
                <div class="map-placeholder">
                    <i class="fas fa-map-marked-alt"></i>
                    <p>Map integration would show here in production</p>
                </div>
                <button id="complete-delivery">Mark Delivery Complete</button>
            `;
            
            document.getElementById('complete-delivery')?.addEventListener('click', () => {
                completeDelivery(request.id);
            });
        }
    }
    
    function completeDelivery(requestId) {
        const requests = JSON.parse(localStorage.getItem('foodRequests'));
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
            request.status = 'completed';
            request.updatedAt = new Date().toISOString();
            localStorage.setItem('foodRequests', JSON.stringify(requests));
            
            alert('Delivery marked as complete! Thank you for your service.');
            document.getElementById('delivery-map-container').innerHTML = '';
        }
    }
    
    function getUserById(userId) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(user => user.id === userId);
    }
});