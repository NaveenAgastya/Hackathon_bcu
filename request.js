document.addEventListener('DOMContentLoaded', function() {
    const requestForm = document.getElementById('request-form');
    
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('request-name').value;
            const contact = document.getElementById('request-contact').value;
            const location = document.getElementById('request-location').value;
            const people = document.getElementById('request-people').value;
            const restrictions = document.getElementById('dietary-restrictions').value;
            
            // Create new request
            const newRequest = {
                id: Date.now().toString(),
                seekerName: name,
                seekerContact: contact,
                location: location,
                peopleCount: people,
                dietaryRestrictions: restrictions,
                status: 'pending', // pending -> accepted -> in-progress -> completed
                donorId: null,
                volunteerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save to localStorage
            const requests = JSON.parse(localStorage.getItem('foodRequests')) || [];
            requests.push(newRequest);
            localStorage.setItem('foodRequests', JSON.stringify(requests));
            
            // Notify donors
            notifyDonors(newRequest);
            
            alert('Your request has been submitted! Donors will be notified.');
            requestForm.reset();
        });
    }
    
    function notifyDonors(request) {
        // Get all donors
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const donors = users.filter(user => user.role === 'donor');
        
        // Create notifications
        const notifications = JSON.parse(localStorage.getItem('donorNotifications')) || [];
        
        donors.forEach(donor => {
            notifications.push({
                id: Date.now().toString() + donor.id,
                donorId: donor.id,
                requestId: request.id,
                message: `New food request from ${request.seekerName} for ${request.peopleCount} people`,
                status: 'unread',
                createdAt: new Date().toISOString()
            });
        });
        
        localStorage.setItem('donorNotifications', JSON.stringify(notifications));
    }
});