// Community Kitchen Dashboard - Enhanced Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only run if on dashboard page
    if (!document.getElementById('dashboard')) return;

    // DOM Elements
    const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    const toastContainer = document.getElementById('toast-container');
    
    // Dashboard Data
    const dashboardData = {
        user: {
            name: 'Alex Johnson',
            stats: {
                donations: 12,
                meals: 84,
                deliveries: 7,
                peopleHelped: 150
            },
            impact: {
                foodWastePrevented: 42, // kg
                waterSaved: 120, // liters
                co2Reduced: 84 // kg
            }
        },
        donations: [
            {
                id: 1,
                date: '2025-04-03',
                type: 'Fresh Vegetables',
                quantity: '8kg',
                location: 'Downtown Community Center',
                status: 'completed'
            },
            {
                id: 2,
                date: '2025-04-02',
                type: 'Baked Goods',
                quantity: '24 items',
                location: 'Riverside Bakery',
                status: 'completed'
            }
        ],
        requests: [
            {
                id: 1,
                date: '2025-04-04',
                requestId: 'REQ-1001',
                meals: 4,
                location: '123 Main St',
                status: 'delivered'
            }
        ],
        deliveries: [
            {
                id: 1,
                deliveryId: 'DEL-2001',
                from: 'Downtown Farm Market',
                to: 'Lakeview Community Center',
                items: 'Fresh Produce (15kg)',
                date: '2025-04-04',
                time: '2:00 PM - 3:00 PM',
                status: 'completed'
            }
        ],
        activity: [
            {
                id: 1,
                type: 'donation',
                title: 'Food Donated',
                description: 'You donated Fresh Vegetables (5kg)',
                time: '2 hours ago',
                status: 'completed'
            }
        ]
    };

    // Helper Functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-circle-check';
        if (type === 'warning') icon = 'fa-triangle-exclamation';
        if (type === 'error') icon = 'fa-circle-xmark';
        if (type === 'info') icon = 'fa-circle-info';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toastContainer.removeChild(toast), 300);
        }, 5000);
    }

    // Dashboard Navigation
    function switchDashboardSection(sectionName) {
        dashboardNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });

        dashboardSections.forEach(section => {
            section.classList.toggle('active', section.id === `dashboard-${sectionName}`);
        });

        // Load data for the section if needed
        if (sectionName === 'donations') {
            loadDonationsTable();
        } else if (sectionName === 'requests') {
            loadRequestsTable();
        } else if (sectionName === 'deliveries') {
            loadDeliveryCards();
        }
    }

    // Dashboard Data Loading
    function loadUserProfile() {
        document.querySelector('.user-name').textContent = dashboardData.user.name;
        document.querySelector('.user-stat:nth-child(1) .user-stat-value').textContent = dashboardData.user.stats.donations;
        document.querySelector('.user-stat:nth-child(2) .user-stat-value').textContent = dashboardData.user.stats.meals;
        document.querySelector('.user-stat:nth-child(3) .user-stat-value').textContent = dashboardData.user.stats.deliveries;
    }

    function loadDashboardStats() {
        document.getElementById('user-donations-count').textContent = dashboardData.user.stats.donations;
        document.getElementById('user-meals-count').textContent = dashboardData.user.stats.meals;
        document.getElementById('user-deliveries-count').textContent = dashboardData.user.stats.deliveries;
        document.getElementById('people-helped-count').textContent = dashboardData.user.stats.peopleHelped;

        // Impact metrics
        document.querySelector('.impact-metric:nth-child(1) .metric-value').textContent = `${dashboardData.user.impact.foodWastePrevented} kg`;
        document.querySelector('.impact-metric:nth-child(2) .metric-value').textContent = `${dashboardData.user.impact.waterSaved} L`;
        document.querySelector('.impact-metric:nth-child(3) .metric-value').textContent = `${dashboardData.user.impact.co2Reduced} kg`;
    }

    function loadRecentActivity() {
        const container = document.getElementById('recent-activities');
        if (!container) return;
        
        container.innerHTML = '';
        
        dashboardData.activity.forEach(activity => {
            let icon = 'fa-hand-holding-heart';
            if (activity.type === 'delivery') icon = 'fa-truck';
            if (activity.type === 'volunteer') icon = 'fa-people-carry-box';
            if (activity.type === 'request') icon = 'fa-utensils';
            
            let badgeClass = 'badge-success';
            if (activity.status === 'pending') badgeClass = 'badge-warning';
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                <div class="activity-badge">
                    <span class="badge ${badgeClass}">${activity.status}</span>
                </div>
            `;
            
            container.appendChild(activityItem);
        });
    }

    function loadDonationsTable() {
        const container = document.querySelector('#dashboard-donations tbody');
        if (!container) return;
        
        container.innerHTML = '';
        
        dashboardData.donations.forEach(donation => {
            let badgeClass = 'badge-success';
            if (donation.status === 'pending') badgeClass = 'badge-warning';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(donation.date)}</td>
                <td>${donation.type}</td>
                <td>${donation.quantity}</td>
                <td>${donation.location}</td>
                <td><span class="badge ${badgeClass}">${donation.status}</span></td>
                <td>
                    <button class="btn-icon" data-action="view" data-id="${donation.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" data-action="print" data-id="${donation.id}">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            `;
            
            container.appendChild(row);
        });
    }

    function loadRequestsTable() {
        const container = document.querySelector('#dashboard-requests tbody');
        if (!container) return;
        
        container.innerHTML = '';
        
        dashboardData.requests.forEach(request => {
            let badgeClass = 'badge-success';
            if (request.status === 'cancelled') badgeClass = 'badge-error';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(request.date)}</td>
                <td>${request.requestId}</td>
                <td>${request.meals} meals</td>
                <td>${request.location}</td>
                <td><span class="badge ${badgeClass}">${request.status}</span></td>
                <td>
                    <button class="btn-icon" data-action="view" data-id="${request.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" data-action="repeat" data-id="${request.id}">
                        <i class="fas fa-redo"></i>
                    </button>
                </td>
            `;
            
            container.appendChild(row);
        });
    }

    function loadDeliveryCards() {
        const container = document.querySelector('.delivery-cards');
        if (!container) return;
        
        container.innerHTML = '';
        
        dashboardData.deliveries.forEach(delivery => {
            let badgeClass = 'badge-success';
            if (delivery.status === 'in-progress') badgeClass = 'badge-warning';
            
            let statusText = 'Completed';
            if (delivery.status === 'in-progress') statusText = 'In Progress';
            
            let actionButton = `
                <button class="btn-secondary">
                    <i class="fas fa-map-marked-alt"></i> View Route
                </button>
                <button class="btn-primary">
                    <i class="fas fa-redo"></i> Repeat
                </button>
            `;
            
            if (delivery.status === 'in-progress') {
                actionButton = `
                    <button class="btn-secondary">
                        <i class="fas fa-map-marked-alt"></i> View Route
                    </button>
                    <button class="btn-primary">
                        <i class="fas fa-check"></i> Mark Complete
                    </button>
                `;
            }
            
            const card = document.createElement('div');
            card.className = 'delivery-card';
            card.innerHTML = `
                <div class="delivery-header">
                    <div class="delivery-id">${delivery.deliveryId}</div>
                    <div class="delivery-status"><span class="badge ${badgeClass}">${statusText}</span></div>
                </div>
                <div class="delivery-body">
                    <div class="delivery-info">
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>From: ${delivery.from}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker"></i>
                            <span>To: ${delivery.to}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-box-open"></i>
                            <span>Items: ${delivery.items}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>Time: ${delivery.time}</span>
                        </div>
                    </div>
                    <div class="delivery-actions">
                        ${actionButton}
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    // Initialize Charts
    function initCharts() {
        // Load Chart.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            // Activity Chart
            const activityCtx = document.getElementById('activityChart');
            if (activityCtx) {
                new Chart(activityCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        datasets: [
                            {
                                label: 'Donations',
                                data: [8, 10, 12, 9, 11, 13, 15],
                                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                                borderColor: 'rgba(76, 175, 80, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Deliveries',
                                data: [5, 7, 6, 8, 10, 9, 12],
                                backgroundColor: 'rgba(255, 87, 34, 0.7)',
                                borderColor: 'rgba(255, 87, 34, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Donation Chart
            const donationCtx = document.getElementById('donationChart');
            if (donationCtx) {
                new Chart(donationCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Fresh Produce', 'Packaged Food', 'Cooked Meals', 'Baked Goods'],
                        datasets: [{
                            data: [35, 25, 20, 20],
                            backgroundColor: [
                                'rgba(76, 175, 80, 0.7)',
                                'rgba(33, 150, 243, 0.7)',
                                'rgba(255, 152, 0, 0.7)',
                                'rgba(156, 39, 176, 0.7)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        };
        document.head.appendChild(script);
    }

    // Event Listeners
    function setupEventListeners() {
        // Dashboard navigation
        dashboardNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                switchDashboardSection(item.dataset.section);
            });
        });

        // Quick navigation buttons
        document.getElementById('new-donation-btn')?.addEventListener('click', () => {
            showToast('Redirecting to donation form...', 'info');
            // In a real app, this would switch to the donate tab
        });

        document.getElementById('new-request-btn')?.addEventListener('click', () => {
            showToast('Redirecting to request form...', 'info');
        });

        document.getElementById('new-delivery-btn')?.addEventListener('click', () => {
            showToast('Redirecting to volunteer page...', 'info');
        });

        // Report generation
        document.querySelector('.report-filters button')?.addEventListener('click', function() {
            const reportType = document.getElementById('report-type').value;
            const reportPeriod = document.getElementById('report-period').value;
            showToast(`Generating ${reportType} report for ${reportPeriod}...`, 'info');
        });

        // View all activities
        document.querySelector('.btn-view-all')?.addEventListener('click', function() {
            showToast('Showing all activities', 'info');
        });
    }

    // Initialize Dashboard
    function initDashboard() {
        loadUserProfile();
        loadDashboardStats();
        loadRecentActivity();
        loadDonationsTable();
        loadRequestsTable();
        loadDeliveryCards();
        initCharts();
        setupEventListeners();
        
        // Show overview by default
        switchDashboardSection('overview');
    }

    // Start the dashboard
    initDashboard();
});