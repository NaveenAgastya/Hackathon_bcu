
// Handle notifications and requests
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dummy data if none exists
    initDummyData();
    
    // Load donor requests if on donate page
    if (document.getElementById('donate')) {
        loadDonorRequests();
        setInterval(loadDonorRequests, 2000); // Refresh every 2 seconds
    }
    
    // Load volunteer requests if on volunteer page
    if (document.getElementById('volunteer')) {
        loadVolunteerRequests();
    }
    
    // Event delegation for action buttons
    document.addEventListener('click', handleButtonClicks);
});

function initDummyData() {
    if (!localStorage.getItem('foodRequests')) {
        const dummyRequests = [
            {
                id: "req1",
                seekerName: "Community Shelter",
                location: "123 Main St, Cityville",
                peopleCount: 15,
                dietaryRestrictions: "Vegetarian",
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "req2",
                seekerName: "Homeless Center",
                location: "456 Oak Ave, Townsville",
                peopleCount: 8,
                dietaryRestrictions: "None",
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('foodRequests', JSON.stringify(dummyRequests));
    }
}

function handleButtonClicks(e) {
    // Donor actions
    if (e.target.classList.contains('btn-accept-request')) {
        const requestId = e.target.closest('.request-card').dataset.requestId;
        acceptFoodRequest(requestId);
    }
    
    if (e.target.classList.contains('btn-reject-request')) {
        const requestId = e.target.closest('.request-card').dataset.requestId;
        rejectFoodRequest(requestId);
    }
    
    // Volunteer actions
    if (e.target.classList.contains('btn-accept-delivery')) {
        const requestId = e.target.closest('.request-card').dataset.requestId;
        acceptDeliveryRequest(requestId);
    }
    
    if (e.target.classList.contains('btn-reject-delivery')) {
        const requestId = e.target.closest('.request-card').dataset.requestId;
        rejectDeliveryRequest(requestId);
    }
    
    // Complete delivery
    if (e.target.id === 'complete-delivery') {
        const requestId = e.target.dataset.requestId;
        completeDelivery(requestId);
    }
}

function loadDonorRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'donor') return;
    
    const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const myAcceptedRequests = requests.filter(r => 
        r.donorId === currentUser.id && r.status === 'accepted'
    );
    const myCompletedRequests = requests.filter(r => 
        r.donorId === currentUser.id && r.status === 'completed'
    );
    
    const pendingContainer = document.getElementById('donor-pending-requests');
    const acceptedContainer = document.getElementById('donor-accepted-requests');
    const completedContainer = document.getElementById('donor-completed-requests');
    
    // Pending requests
    if (pendingRequests.length === 0) {
        pendingContainer.innerHTML = '<p>No pending food requests at this time.</p>';
    } else {
        pendingContainer.innerHTML = pendingRequests.map(request => `
            <div class="request-card pending" data-request-id="${request.id}">
                <h4>Food Request from ${request.seekerName}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${request.location}</p>
                <p><i class="fas fa-users"></i> ${request.peopleCount} people</p>
                ${request.dietaryRestrictions ? 
                    `<p><i class="fas fa-wheat-awn-circle-exclamation"></i> ${request.dietaryRestrictions}</p>` : ''}
                <div class="request-actions">
                    <button class="btn-accept btn-accept-request">Accept</button>
                    <button class="btn-reject btn-reject-request">Reject</button>
                </div>
            </div>
        `).join('');
    }
    
    // Accepted requests (waiting for volunteer)
    if (myAcceptedRequests.length === 0) {
        acceptedContainer.innerHTML = '<p>No accepted requests waiting for volunteers.</p>';
    } else {
        acceptedContainer.innerHTML = myAcceptedRequests.map(request => `
            <div class="request-card accepted" data-request-id="${request.id}">
                <h4>Request from ${request.seekerName}</h4>
                <p><i class="fas fa-user-clock"></i> Waiting for volunteer</p>
                <p><i class="fas fa-map-marker-alt"></i> ${request.location}</p>
                <p><i class="fas fa-users"></i> ${request.peopleCount} people</p>
            </div>
        `).join('');
    }
    
    // Completed requests
    if (myCompletedRequests.length === 0) {
        completedContainer.innerHTML = '<p>No completed requests yet.</p>';
    } else {
        completedContainer.innerHTML = myCompletedRequests.map(request => {
            const volunteer = getUserById(request.volunteerId);
            return `
                <div class="request-card completed" data-request-id="${request.id}">
                    <h4>Delivered to ${request.seekerName}</h4>
                    <p><i class="fas fa-check-circle"></i> Completed</p>
                    ${volunteer ? `<p><i class="fas fa-person-walking"></i> Delivered by ${volunteer.name}</p>` : ''}
                    <p><i class="fas fa-calendar-check"></i> ${new Date(request.updatedAt).toLocaleString()}</p>
                </div>
            `;
        }).join('');
    }
}

function loadVolunteerRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'volunteer') return;
    
    const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
    const availableRequests = requests.filter(r => r.status === 'accepted' && !r.volunteerId);
    const myActiveDeliveries = requests.filter(r => 
        r.volunteerId === currentUser.id && r.status === 'in-progress'
    );
    const myCompletedDeliveries = requests.filter(r => 
        r.volunteerId === currentUser.id && r.status === 'completed'
    );
    
    const availableContainer = document.getElementById('volunteer-available-requests');
    const activeContainer = document.getElementById('volunteer-active-deliveries');
    const completedContainer = document.getElementById('volunteer-completed-deliveries');
    
    // Available requests
    if (availableRequests.length === 0) {
        availableContainer.innerHTML = '<p>No delivery requests available at this time.</p>';
    } else {
        availableContainer.innerHTML = availableRequests.map(request => {
            const donor = getUserById(request.donorId);
            return `
                <div class="request-card" data-request-id="${request.id}">
                    <h4>Delivery for ${request.seekerName}</h4>
                    ${donor ? `<p><i class="fas fa-hand-holding-heart"></i> From ${donor.name}</p>` : ''}
                    <p><i class="fas fa-map-marker-alt"></i> ${request.location}</p>
                    <p><i class="fas fa-users"></i> ${request.peopleCount} people</p>
                    <div class="request-actions">
                        <button class="btn-accept btn-accept-delivery">Accept Delivery</button>
                        <button class="btn-reject btn-reject-delivery">Reject</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Active deliveries
    if (myActiveDeliveries.length === 0) {
        activeContainer.innerHTML = '<p>No active deliveries right now.</p>';
    } else {
        activeContainer.innerHTML = myActiveDeliveries.map(request => {
            const donor = getUserById(request.donorId);
            return `
                <div class="request-card in-progress" data-request-id="${request.id}">
                    <h4>Delivery to ${request.seekerName}</h4>
                    ${donor ? `<p><i class="fas fa-hand-holding-heart"></i> From ${donor.name}</p>` : ''}
                    <p><i class="fas fa-map-marker-alt"></i> ${request.location}</p>
                    <button class="btn-show-map" data-request-id="${request.id}">
                        <i class="fas fa-map-marked-alt"></i> Show Route
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Completed deliveries
    if (myCompletedDeliveries.length === 0) {
        completedContainer.innerHTML = '<p>No completed deliveries yet.</p>';
    } else {
        completedContainer.innerHTML = myCompletedDeliveries.map(request => {
            const donor = getUserById(request.donorId);
            return `
                <div class="request-card completed" data-request-id="${request.id}">
                    <h4>Delivered to ${request.seekerName}</h4>
                    ${donor ? `<p><i class="fas fa-hand-holding-heart"></i> From ${donor.name}</p>` : ''}
                    <p><i class="fas fa-check-circle"></i> Completed</p>
                    <p><i class="fas fa-calendar-check"></i> ${new Date(request.updatedAt).toLocaleString()}</p>
                </div>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load donor notifications if on donate page
    if (document.getElementById('donate')) {
        loadDonorRequests();
    }
    
    // Load volunteer notifications if on volunteer page
    if (document.getElementById('volunteer')) {
        loadVolunteerRequests();
    }
    
    // Event delegation for action buttons
    document.addEventListener('click', function(e) {
        // Donor actions
        if (e.target.classList.contains('btn-accept-request')) {
            const requestId = e.target.closest('.request-card').dataset.requestId;
            acceptFoodRequest(requestId);
        }
        
        if (e.target.classList.contains('btn-reject-request')) {
            const requestId = e.target.closest('.request-card').dataset.requestId;
            rejectFoodRequest(requestId);
        }
        
        // Volunteer actions
        if (e.target.classList.contains('btn-accept-delivery')) {
            const requestId = e.target.closest('.request-card').dataset.requestId;
            acceptDeliveryRequest(requestId);
        }
        
        if (e.target.classList.contains('btn-reject-delivery')) {
            const requestId = e.target.closest('.request-card').dataset.requestId;
            rejectDeliveryRequest(requestId);
        }
        
        // Complete delivery
        if (e.target.id === 'complete-delivery') {
            const requestId = e.target.dataset.requestId;
            completeDelivery(requestId);
        }
    });
});

function loadDonorRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'donor') return;
    
    const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
    const pendingRequests = requests.filter(r => r.status === 'pending');
    
    const container = document.getElementById('donor-requests');
    if (!container) return;
    
    if (pendingRequests.length === 0) {
        container.innerHTML = '<p>No pending food requests at this time.</p>';
        return;
    }
    
    container.innerHTML = pendingRequests.map(request => `
        <div class="request-card pending" data-request-id="${request.id}">
            <h4>Food Request from ${request.seekerName}</h4>
            <p><strong>Location:</strong> ${request.location}</p>
            <p><strong>People:</strong> ${request.peopleCount}</p>
            <p><strong>Dietary Restrictions:</strong> ${request.dietaryRestrictions || 'None'}</p>
            <div class="request-actions">
                <button class="btn-accept btn-accept-request">Accept</button>
                <button class="btn-reject btn-reject-request">Reject</button>
            </div>
        </div>
    `).join('');
}

function loadVolunteerRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'volunteer') return;
    
    const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
    const acceptedRequests = requests.filter(r => r.status === 'accepted' && !r.volunteerId);
    
    const container = document.getElementById('volunteer-requests');
    if (!container) return;
    
    if (acceptedRequests.length === 0) {
        container.innerHTML = '<p>No delivery requests at this time.</p>';
        return;
    }
    
    container.innerHTML = acceptedRequests.map(request => {
        const donor = getUserById(request.donorId);
        return `
            <div class="request-card" data-request-id="${request.id}">
                <h4>Delivery Request for ${request.seekerName}</h4>
                <p><strong>Pickup from:</strong> ${donor?.name || 'Donor'}</p>
                <p><strong>Deliver to:</strong> ${request.location}</p>
                <p><strong>People:</strong> ${request.peopleCount}</p>
                <div class="request-actions">
                    <button class="btn-accept btn-accept-delivery">Accept Delivery</button>
                    <button class="btn-reject btn-reject-delivery">Reject</button>
                </div>
            </div>
        `;
    }).join('');
}

function acceptFoodRequest(requestId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requests = JSON.parse(localStorage.getItem('foodRequests'));
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        request.status = 'accepted';
        request.donorId = currentUser.id;
        request.updatedAt = new Date().toISOString();
        
        localStorage.setItem('foodRequests', JSON.stringify(requests));
        loadDonorRequests();
        
        // Notify volunteers
        notifyVolunteers(request);
        
        showToast('Request accepted! Volunteers have been notified.', 'success');
    }
}

function rejectFoodRequest(requestId) {
    const requests = JSON.parse(localStorage.getItem('foodRequests'));
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        request.status = 'rejected';
        request.updatedAt = new Date().toISOString();
        
        localStorage.setItem('foodRequests', JSON.stringify(requests));
        loadDonorRequests();
        
        showToast('Request has been rejected.', 'info');
    }
}

function acceptDeliveryRequest(requestId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requests = JSON.parse(localStorage.getItem('foodRequests'));
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        request.status = 'in-progress';
        request.volunteerId = currentUser.id;
        request.updatedAt = new Date().toISOString();
        
        localStorage.setItem('foodRequests', JSON.stringify(requests));
        loadVolunteerRequests();
        
        // Show delivery map
        showDeliveryMap(request);
        
        showToast('Delivery accepted! Please complete the delivery.', 'success');
    }
}

function showDeliveryMap(request) {
    const donor = getUserById(request.donorId);
    const container = document.getElementById('delivery-map-container');
    
    if (container) {
        container.innerHTML = `
            <div class="route-info">
                <div class="route-point">
                    <h4>Pickup Location</h4>
                    <p>${donor?.name || 'Donor'}'s location</p>
                </div>
                <div class="route-point">
                    <h4>Delivery Location</h4>
                    <p>${request.location}</p>
                </div>
            </div>
            <div class="map-placeholder">
                <i class="fas fa-map-marked-alt"></i>
                <p>Map integration would show here in production</p>
            </div>
            <button id="complete-delivery" data-request-id="${request.id}">Mark Delivery Complete</button>
        `;
    }
}

function completeDelivery(requestId) {
    const requests = JSON.parse(localStorage.getItem('foodRequests'));
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        request.status = 'completed';
        request.updatedAt = new Date().toISOString();
        
        localStorage.setItem('foodRequests', JSON.stringify(requests));
        
        document.getElementById('delivery-map-container').innerHTML = 
            '<p class="success-message">Delivery completed successfully!</p>';
        
        showToast('Delivery marked as complete. Thank you!', 'success');
    }
}

function notifyVolunteers(request) {
    const volunteers = JSON.parse(localStorage.getItem('users'))
        .filter(user => user.role === 'volunteer');
    
    // In a real app, you might want to store these notifications
    showToast(`Volunteers have been notified about the new delivery request.`, 'success');
}

function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.id === userId);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         'fa-info-circle'}></i>
        <span>${message}</span>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}