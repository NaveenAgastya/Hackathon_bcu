// Community Kitchen Dashboard - Enhanced JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabElements = document.querySelectorAll('.tab');
    const pageContainers = document.querySelectorAll('.page-container');
    const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    const toastContainer = document.getElementById('toast-container');
    
    // Sample Data
    const sampleData = {
      user: {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, USA',
        bio: 'Community kitchen volunteer and food waste reduction advocate.',
        stats: {
          donations: 12,
          meals: 84,
          deliveries: 7,
          peopleHelped: 150
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
        },
        {
          id: 3,
          date: '2025-04-01',
          type: 'Canned Foods',
          quantity: '15 items',
          location: 'North End Grocery',
          status: 'pending'
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
        },
        {
          id: 2,
          date: '2025-04-02',
          requestId: 'REQ-1000',
          meals: 2,
          location: '123 Main St',
          status: 'delivered'
        },
        {
          id: 3,
          date: '2025-03-28',
          requestId: 'REQ-0999',
          meals: 3,
          location: '123 Main St',
          status: 'cancelled'
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
        },
        {
          id: 2,
          deliveryId: 'DEL-2000',
          from: 'Sunrise Bakery',
          to: 'Hope Street Shelter',
          items: 'Bread and Pastries (30 items)',
          date: '2025-04-04',
          time: '5:00 PM - 6:00 PM',
          status: 'in-progress'
        }
      ],
      impact: {
        foodWastePrevented: 42, // kg
        waterSaved: 120, // liters
        co2Reduced: 84 // kg
      },
      activity: [
        {
          id: 1,
          type: 'donation',
          title: 'Food Donated',
          description: 'You donated Fresh Vegetables (5kg)',
          time: '2 hours ago',
          status: 'completed'
        },
        {
          id: 2,
          type: 'delivery',
          title: 'Delivery Completed',
          description: 'You delivered meals to Riverside Community Center',
          time: '1 day ago',
          status: 'completed'
        },
        {
          id: 3,
          type: 'volunteer',
          title: 'Kitchen Help',
          description: 'You volunteered at Downtown Community Kitchen',
          time: '3 days ago',
          status: 'pending'
        },
        {
          id: 4,
          type: 'request',
          title: 'Food Request',
          description: 'Your request for 4 meals has been processed',
          time: '5 days ago',
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
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toastContainer.removeChild(toast);
        }, 300);
      }, 5000);
    }
  
    // Navigation Functions
    function switchTab(tabName) {
      tabElements.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });
  
      pageContainers.forEach(page => {
        page.classList.toggle('active', page.id === tabName);
      });
    }
  
    function switchDashboardSection(sectionName) {
      dashboardNavItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
      });
  
      dashboardSections.forEach(section => {
        section.classList.toggle('active', section.id === `dashboard-${sectionName}`);
      });
    }
  
    // Dashboard Functions
    function loadUserProfile() {
      const user = sampleData.user;
      document.querySelector('.user-name').textContent = user.name;
      document.querySelector('.user-stat:nth-child(1) .user-stat-value').textContent = user.stats.donations;
      document.querySelector('.user-stat:nth-child(2) .user-stat-value').textContent = user.stats.meals;
      document.querySelector('.user-stat:nth-child(3) .user-stat-value').textContent = user.stats.deliveries;
      
      // Populate settings form
      if (document.getElementById('profile-form')) {
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-phone').value = user.phone;
        document.getElementById('profile-address').value = user.address;
        document.getElementById('profile-bio').value = user.bio;
      }
    }
  
    function loadDashboardStats() {
      document.getElementById('user-donations-count').textContent = sampleData.user.stats.donations;
      document.getElementById('user-meals-count').textContent = sampleData.user.stats.meals;
      document.getElementById('user-deliveries-count').textContent = sampleData.user.stats.deliveries;
      document.getElementById('people-helped-count').textContent = sampleData.user.stats.peopleHelped;
      
      // Impact metrics
      document.querySelector('.impact-metric:nth-child(1) .metric-value').textContent = `${sampleData.impact.foodWastePrevented} kg`;
      document.querySelector('.impact-metric:nth-child(2) .metric-value').textContent = `${sampleData.impact.waterSaved} L`;
      document.querySelector('.impact-metric:nth-child(3) .metric-value').textContent = `${sampleData.impact.co2Reduced} kg`;
    }
  
    function loadRecentActivity() {
      const container = document.getElementById('recent-activities');
      if (!container) return;
      
      container.innerHTML = '';
      
      sampleData.activity.forEach(activity => {
        let icon = 'fa-hand-holding-heart';
        if (activity.type === 'delivery') icon = 'fa-truck';
        if (activity.type === 'volunteer') icon = 'fa-people-carry-box';
        if (activity.type === 'request') icon = 'fa-utensils';
        
        let badgeClass = 'badge-success';
        if (activity.status === 'pending') badgeClass = 'badge-warning';
        if (activity.status === 'cancelled') badgeClass = 'badge-error';
        
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
            <span class="badge ${badgeClass}">${activity.status.replace('-', ' ')}</span>
          </div>
        `;
        
        container.appendChild(activityItem);
      });
    }
  
    function loadDonationsTable() {
      const container = document.querySelector('#dashboard-donations tbody');
      if (!container) return;
      
      container.innerHTML = '';
      
      sampleData.donations.forEach(donation => {
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
            <button class="btn-icon" data-action="view" data-id="${donation.id}"><i class="fas fa-eye"></i></button>
            <button class="btn-icon" data-action="print" data-id="${donation.id}"><i class="fas fa-print"></i></button>
          </td>
        `;
        
        container.appendChild(row);
      });
    }
  
    function loadRequestsTable() {
      const container = document.querySelector('#dashboard-requests tbody');
      if (!container) return;
      
      container.innerHTML = '';
      
      sampleData.requests.forEach(request => {
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
            <button class="btn-icon" data-action="view" data-id="${request.id}"><i class="fas fa-eye"></i></button>
            <button class="btn-icon" data-action="repeat" data-id="${request.id}"><i class="fas fa-redo"></i></button>
          </td>
        `;
        
        container.appendChild(row);
      });
    }
  
    function loadDeliveryCards() {
      const container = document.querySelector('.delivery-cards');
      if (!container) return;
      
      container.innerHTML = '';
      
      sampleData.deliveries.forEach(delivery => {
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
  
    function initCharts() {
      // Only load Chart.js if we're on the dashboard
      if (!document.getElementById('dashboard')) return;
      
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
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
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
                borderColor: [
                  'rgba(76, 175, 80, 1)',
                  'rgba(33, 150, 243, 1)',
                  'rgba(255, 152, 0, 1)',
                  'rgba(156, 39, 176, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                }
              }
            }
          });
        }
      };
      document.head.appendChild(script);
    }
  
    // Event Listeners
    function setupEventListeners() {
      // Tab navigation
      tabElements.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
      });
      
      // Dashboard navigation
      dashboardNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          switchDashboardSection(item.dataset.section);
        });
      });
      
      // Quick navigation buttons
      document.getElementById('donate-food-btn')?.addEventListener('click', () => switchTab('donate'));
      document.getElementById('request-food-btn')?.addEventListener('click', () => switchTab('request'));
      document.getElementById('volunteer-btn')?.addEventListener('click', () => switchTab('volunteer'));
      document.getElementById('new-donation-btn')?.addEventListener('click', () => switchTab('donate'));
      document.getElementById('new-request-btn')?.addEventListener('click', () => switchTab('request'));
      document.getElementById('new-delivery-btn')?.addEventListener('click', () => switchTab('volunteer'));
      
      // Settings form
      document.getElementById('profile-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Profile updated successfully!', 'success');
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
      if (!document.getElementById('dashboard')) return;
      
      loadUserProfile();
      loadDashboardStats();
      loadRecentActivity();
      loadDonationsTable();
      loadRequestsTable();
      loadDeliveryCards();
      initCharts();
      setupEventListeners();
      
      // Show dashboard by default
      switchDashboardSection('overview');
    }
  
    // Initialize the application
    initDashboard();
    
    // Show home page by default
    switchTab('home');
  });