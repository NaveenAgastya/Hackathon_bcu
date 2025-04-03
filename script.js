// DOM Elements
const tabElements = document.querySelectorAll('.tab');
const pageContainers = document.querySelectorAll('.page-container');
const donateButton = document.getElementById('donate-food-btn');
const requestButton = document.getElementById('request-food-btn');
const volunteerBtn = document.getElementById('volunteer-btn');
const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const toastContainer = document.getElementById('toast-container');

// Forms
const donateForm = document.getElementById('donate-form');
const requestForm = document.getElementById('request-form');
const volunteerForm = document.getElementById('volunteer-form');

// Sample Data for demonstration
const sampleImpactData = {
    mealsSaved: 5843,
    totalDonors: 362,
    totalVolunteers: 189
};

const sampleDonations = [
    {
        id: 1,
        type: 'Fresh Vegetables',
        quantity: '8kg',
        location: 'Downtown Community Center',
        time: '3:00 PM - 5:00 PM',
        date: '2025-04-03',
        status: 'Pending'
    },
    {
        id: 2,
        type: 'Baked Goods',
        quantity: '24 items',
        location: 'Riverside Bakery',
        time: '6:00 PM - 7:00 PM',
        date: '2025-04-03',
        status: 'Completed'
    },
    {
        id: 3,
        type: 'Canned Foods',
        quantity: '15 items',
        location: 'North End Grocery',
        time: '1:00 PM - 3:00 PM',
        date: '2025-04-04',
        status: 'Pending'
    }
];

const sampleAvailableFood = [
    {
        id: 1,
        type: 'Fresh Produce',
        quantity: '12kg',
        location: 'Central Community Garden',
        distance: '0.8 miles away',
        time: 'Available until 6:00 PM'
    },
    {
        id: 2,
        type: 'Prepared Meals',
        quantity: '18 portions',
        location: 'Hope Kitchen',
        distance: '1.5 miles away',
        time: 'Available until 8:00 PM'
    },
    {
        id: 3,
        type: 'Dairy Products',
        quantity: '10 items',
        location: 'Green Valley Farm',
        distance: '2.3 miles away',
        time: 'Available until 7:00 PM'
    }
];

const sampleDeliveries = [
    {
        id: 1,
        from: 'Downtown Farm Market',
        to: 'Lakeview Community Center',
        items: 'Fresh Produce (15kg)',
        time: '2:00 PM - 3:00 PM',
        date: '2025-04-04',
        status: 'Ready for pickup'
    },
    {
        id: 2,
        from: 'Sunrise Bakery',
        to: 'Hope Street Shelter',
        items: 'Bread and Pastries (30 items)',
        time: '5:00 PM - 6:00 PM',
        date: '2025-04-04',
        status: 'In transit'
    }
];

const sampleUserData = {
    donations: 12,
    mealsProvided: 84,
    deliveriesMade: 7,
    peopleHelped: 150,
    recentActivities: [
        {
            type: 'donation',
            title: 'Food Donated',
            description: 'You donated Fresh Vegetables (5kg)',
            time: '2 hours ago'
        },
        {
            type: 'delivery',
            title: 'Delivery Completed',
            description: 'You delivered meals to Riverside Community Center',
            time: '1 day ago'
        },
        {
            type: 'volunteer',
            title: 'Kitchen Help',
            description: 'You volunteered at Downtown Community Kitchen',
            time: '3 days ago'
        }
    ]
};

// Navigation functions
function switchTab(tabName) {
    // Update active tab
    tabElements.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Show corresponding page
    pageContainers.forEach(page => {
        if (page.id === tabName) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

function switchDashboardSection(sectionName) {
    // Update active navigation item
    dashboardNavItems.forEach(item => {
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Show corresponding section
    dashboardSections.forEach(section => {
        if (section.id === `dashboard-${sectionName}`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

// Helper Functions
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'info') icon = 'fa-circle-info';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 4000);
}

// Data loading functions
function loadImpactStats() {
    // Animated counter effect
    function animateCounter(element, target, duration = 2000) {
        const startTime = performance.now();
        const startValue = 0;
        
        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function for smoother animation
            const easeOutQuad = progress * (2 - progress);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuad);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Update and animate stats
    const mealsSavedElement = document.getElementById('meals-saved');
    const totalDonorsElement = document.getElementById('total-donors');
    const totalVolunteersElement = document.getElementById('total-volunteers');
    
    animateCounter(mealsSavedElement, sampleImpactData.mealsSaved);
    animateCounter(totalDonorsElement, sampleImpactData.totalDonors);
    animateCounter(totalVolunteersElement, sampleImpactData.totalVolunteers);
}

function loadNearbyDonations() {
    const nearbyDonationsContainer = document.getElementById('nearby-donations');
    
    // Clear loading spinner
    nearbyDonationsContainer.innerHTML = '';
    
    if (sampleDonations.length === 0) {
        nearbyDonationsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-seedling"></i>
                <p>No nearby donations available at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Create donation items
    sampleDonations.forEach(donation => {
        const donationItem = document.createElement('div');
        donationItem.className = 'donation-item';
        
        const statusClass = donation.status === 'Completed' ? 'status-completed' : 'status-pending';
        
        donationItem.innerHTML = `
            <div class="donation-icon">
                <i class="fas fa-box-open"></i>
            </div>
            <div class="donation-details">
                <div class="donation-title">${donation.type}</div>
                <div class="donation-info">${donation.quantity} · ${donation.location}</div>
                <div class="donation-time">${donation.time} · ${formatDate(donation.date)}</div>
                <div class="donation-status ${statusClass}">${donation.status}</div>
            </div>
        `;
        
        nearbyDonationsContainer.appendChild(donationItem);
    });
}

function loadAvailableFood() {
    const availableFoodContainer = document.getElementById('available-food');
    
    // Clear loading spinner
    availableFoodContainer.innerHTML = '';
    
    if (sampleAvailableFood.length === 0) {
        availableFoodContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bowl-food"></i>
                <p>No food is currently available in your area.</p>
            </div>
        `;
        return;
    }
    
    // Create food items
    sampleAvailableFood.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        
        foodItem.innerHTML = `
            <div class="food-icon">
                <i class="fas fa-apple-whole"></i>
            </div>
            <div class="food-details">
                <div class="food-title">${food.type}</div>
                <div class="food-info">${food.quantity} · ${food.location}</div>
                <div class="food-distance">${food.distance} · ${food.time}</div>
                <button class="small-action-btn request-item-btn" data-id="${food.id}">
                    <i class="fas fa-hand-holding-hand"></i> Request
                </button>
            </div>
        `;
        
        availableFoodContainer.appendChild(foodItem);
    });
    
    // Add event listeners for request buttons
    const requestItemButtons = document.querySelectorAll('.request-item-btn');
    requestItemButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const foodId = e.target.closest('.request-item-btn').dataset.id;
            const foodItem = sampleAvailableFood.find(item => item.id === parseInt(foodId));
            
            if (foodItem) {
                showToast(`Request submitted for ${foodItem.type}`, 'success');
                // Here you would normally send the request to the server
            }
        });
    });
}

function loadAvailableDeliveries() {
    const availableDeliveriesContainer = document.getElementById('available-deliveries');
    
    // Clear loading spinner
    availableDeliveriesContainer.innerHTML = '';
    
    if (sampleDeliveries.length === 0) {
        availableDeliveriesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-truck"></i>
                <p>No deliveries are currently available.</p>
            </div>
        `;
        return;
    }
    
    // Create delivery items
    sampleDeliveries.forEach(delivery => {
        const deliveryItem = document.createElement('div');
        deliveryItem.className = 'delivery-item';
        
        deliveryItem.innerHTML = `
            <div class="delivery-icon">
                <i class="fas fa-route"></i>
            </div>
            <div class="delivery-details">
                <div class="delivery-title">${delivery.items}</div>
                <div class="delivery-route">From: ${delivery.from} · To: ${delivery.to}</div>
                <div class="delivery-time">${delivery.time} · ${formatDate(delivery.date)}</div>
                <div class="delivery-status">${delivery.status}</div>
                <button class="small-action-btn volunteer-delivery-btn" data-id="${delivery.id}">
                    <i class="fas fa-hand-holding-hand"></i> Volunteer
                </button>
            </div>
        `;
        
        availableDeliveriesContainer.appendChild(deliveryItem);
    });
    
    // Add event listeners for volunteer buttons
    const volunteerDeliveryButtons = document.querySelectorAll('.volunteer-delivery-btn');
    volunteerDeliveryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const deliveryId = e.target.closest('.volunteer-delivery-btn').dataset.id;
            const deliveryItem = sampleDeliveries.find(item => item.id === parseInt(deliveryId));
            
            if (deliveryItem) {
                showToast(`You volunteered for delivery: ${deliveryItem.items}`, 'success');
                // Here you would normally send the volunteer request to the server
            }
        });
    });
}

function loadDashboardData() {
    // Update dashboard stats
    document.getElementById('user-donations-count').textContent = sampleUserData.donations;
    document.getElementById('user-meals-count').textContent = sampleUserData.mealsProvided;
    document.getElementById('user-deliveries-count').textContent = sampleUserData.deliveriesMade;
    document.getElementById('people-helped-count').textContent = sampleUserData.peopleHelped;
    
    // Load recent activities
    const recentActivitiesContainer = document.getElementById('recent-activities');
    recentActivitiesContainer.innerHTML = '';
    
    sampleUserData.recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let icon = 'fa-hand-holding-heart';
        if (activity.type === 'delivery') icon = 'fa-truck';
        if (activity.type === 'volunteer') icon = 'fa-people-carry-box';
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        
        recentActivitiesContainer.appendChild(activityItem);
    });
    
    // Load user donations history
    const userDonationsContainer = document.getElementById('user-donations');
    userDonationsContainer.innerHTML = '';
    
    if (sampleDonations.length === 0) {
        userDonationsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>You haven't made any donations yet.</p>
            </div>
        `;
    } else {
        sampleDonations.forEach(donation => {
            const donationItem = document.createElement('div');
            donationItem.className = 'history-item';
            
            const statusClass = donation.status === 'Completed' ? 'status-completed' : 'status-pending';
            
            donationItem.innerHTML = `
                <div class="history-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <div class="history-details">
                    <div class="history-title">${donation.type} (${donation.quantity})</div>
                    <div class="history-location">${donation.location}</div>
                    <div class="history-time">${donation.time} · ${formatDate(donation.date)}</div>
                    <div class="history-status ${statusClass}">${donation.status}</div>
                </div>
            `;
            
            userDonationsContainer.appendChild(donationItem);
        });
    }
    
    // Similar functions would be implemented for requests and deliveries sections
    const userRequestsContainer = document.getElementById('user-requests');
    const userDeliveriesContainer = document.getElementById('user-deliveries');
    
    userRequestsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-hand-holding"></i>
            <p>You haven't made any food requests yet.</p>
        </div>
    `;
    
    userDeliveriesContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-truck"></i>
            <p>You haven't made any deliveries yet.</p>
        </div>
    `;
}

// Form handling
function handleDonateFormSubmit(event) {
    event.preventDefault();
    
    // Normally, you would collect form data and send it to the server
    const foodType = document.getElementById('food-type').value;
    const quantity = document.getElementById('quantity').value;
    
    // Show success message
    showToast(`Thank you for donating ${quantity} of ${foodType}!`, 'success');
    
    // Reset form
    event.target.reset();
}

function handleRequestFormSubmit(event) {
    event.preventDefault();
    
    // Normally, you would collect form data and send it to the server
    const name = document.getElementById('request-name').value;
    const numPeople = document.getElementById('request-people').value;
    
    // Show success message
    showToast(`Food request for ${numPeople} people submitted successfully!`, 'success');
    
    // Reset form
    event.target.reset();
}

function handleVolunteerFormSubmit(event) {
    event.preventDefault();
    
    // Normally, you would collect form data and send it to the server
    const name = document.getElementById('volunteer-name').value;
    const role = document.getElementById('volunteer-role').value;
    
    let roleText = "volunteering";
    if (role === 'driver') roleText = "as a Food Delivery Driver";
    if (role === 'kitchen') roleText = "as a Kitchen Helper";
    if (role === 'coordinator') roleText = "as a Donation Coordinator";
    
    // Show success message
    showToast(`Thank you ${name} for ${roleText}!`, 'success');
    
    // Reset form
    event.target.reset();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page 
    loadImpactStats();
    loadNearbyDonations();
    loadAvailableFood();
    loadAvailableDeliveries();
    loadDashboardData();
    
    // Tab navigation
    tabElements.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Dashboard navigation
    dashboardNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.dataset.section;
            switchDashboardSection(sectionName);
        });
    });
    
    // Quick navigation buttons
    donateButton.addEventListener('click', () => {
        switchTab('donate');
    });
    
    requestButton.addEventListener('click', () => {
        switchTab('request');
    });
    
    if (volunteerBtn) {
        volunteerBtn.addEventListener('click', () => {
            switchTab('volunteer');
        });
    }
    
    // Form submissions
    if (donateForm) {
        donateForm.addEventListener('submit', handleDonateFormSubmit);
    }
    
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestFormSubmit);
    }
    
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerFormSubmit);
    }
});

// Add CSS class for empty states
const style = document.createElement('style');
style.innerHTML = `
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl);
        color: var(--text-medium);
        text-align: center;
    }
    
    .empty-state i {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-md);
        color: var(--text-light);
    }
    
    .status-completed {
        color: var(--success-color);
        font-weight: 500;
    }
    
    .status-pending {
        color: var(--warning-color);
        font-weight: 500;
    }
    
    .donation-item, .food-item, .delivery-item, .history-item {
        display: flex;
        background-color: var(--bg-white);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        border: 1px solid var(--bg-dark);
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    
    .donation-item:hover, .food-item:hover, .delivery-item:hover, .history-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .donation-icon, .food-icon, .delivery-icon, .history-icon {
        font-size: 1.5rem;
        color: var(--primary-color);
        margin-right: var(--spacing-md);
        padding-top: var(--spacing-xs);
    }
    
    .donation-title, .food-title, .delivery-title, .history-title {
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
    }
    
    .donation-info, .food-info, .delivery-route, .history-location {
        color: var(--text-medium);
        margin-bottom: var(--spacing-xs);
    }
    
    .donation-time, .food-distance, .delivery-time, .history-time {
        color: var(--text-light);
        font-size: 0.9rem;
        margin-bottom: var(--spacing-xs);
    }
    
    .small-action-btn {
        display: inline-flex;
        align-items: center;
        margin-top: var(--spacing-sm);
        padding: var(--spacing-xs) var(--spacing-md);
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        font-weight: 600;
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }
    
    .small-action-btn i {
        margin-right: var(--spacing-xs);
    }
    
    .small-action-btn:hover {
        background-color: var(--primary-dark);
    }
`;

document.head.appendChild(style);

// Interactive Animations (optional)
function addInteractiveAnimations() {
    // Add subtle hover animations to cards
    const cards = document.querySelectorAll('.card, .stat-card, .step-card, .dashboard-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = 'var(--shadow-lg)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
}

addInteractiveAnimations();