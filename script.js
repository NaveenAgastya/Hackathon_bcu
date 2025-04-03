document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const pageContainers = document.querySelectorAll('.page-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            pageContainers.forEach(page => page.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const donateBtn = document.getElementById('donate-food-btn');
    const requestBtn = document.getElementById('request-food-btn');
    const volunteerBtn = document.getElementById('volunteer-btn');

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            pageContainers.forEach(page => page.classList.remove('active'));

            document.querySelector('.tab[data-tab="donate"]').classList.add('active');
            document.getElementById('donate').classList.add('active');
        });
    }

    if (requestBtn) {
        requestBtn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            pageContainers.forEach(page => page.classList.remove('active'));

            document.querySelector('.tab[data-tab="request"]').classList.add('active');
            document.getElementById('request').classList.add('active');
        });
    }

    if (volunteerBtn) {
        volunteerBtn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            pageContainers.forEach(page => page.classList.remove('active'));

            document.querySelector('.tab[data-tab="volunteer"]').classList.add('active');
            document.getElementById('volunteer').classList.add('active');
        });
    }

    const donateForm = document.getElementById('donate-form');
    if (donateForm) {
        donateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const foodType = document.getElementById('food-type').value;
            const quantity = document.getElementById('quantity').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const pickupLocation = document.getElementById('pickup-location').value;

            const donationData = {
                foodType,
                quantity,
                expiryDate,
                pickupLocation,
                timestamp: new Date().toISOString()
            };

            const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
            existingDonations.push(donationData);

            localStorage.setItem('donations', JSON.stringify(existingDonations));

            donateForm.reset();
            alert('Thank you for your donation! Your food will help those in need.');
            updateDashboard();
        });
    }

    // Form submission for volunteer
    const volunteerForm = document.getElementById('volunteer-form');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('volunteer-name').value;
            const email = document.getElementById('volunteer-email').value;

            // Store volunteer data
            const volunteerData = {
                name,
                email,
                timestamp: new Date().toISOString()
            };

            const existingVolunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
            existingVolunteers.push(volunteerData);
            localStorage.setItem('volunteers', JSON.stringify(existingVolunteers));

            volunteerForm.reset();
            alert('Thank you for volunteering! We\'ll contact you about available deliveries.');

            updateDashboard();
        });
    }

    // Function to update dashboard with stored data
    function updateDashboard() {
        const donations = JSON.parse(localStorage.getItem('donations') || '[]');
        const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');

        // Update dashboard statistics
        const donationSection = document.querySelector('#dashboard .donation-list');
        if (donationSection) {
            // Clear existing items
            donationSection.innerHTML = '';

            // Add recent donations (up to 3)
            donations.slice(-3).forEach(donation => {
                const donationItem = document.createElement('div');
                donationItem.className = 'donation-item';
                donationItem.innerHTML = `
                    <div class="donation-icon"></div>
                    <div class="donation-details">
                        <p>${donation.foodType} - ${donation.quantity}</p>
                        <p>Expires: ${new Date(donation.expiryDate).toLocaleDateString()}</p>
                        <p>Pickup: ${donation.pickupLocation}</p>
                    </div>
                `;
                donationSection.appendChild(donationItem);
            });
        }

        // Update nearby donations
        const nearbySection = document.querySelector('#donate .donation-list');
        if (nearbySection) {
            nearbySection.innerHTML = '';

            donations.slice(-2).forEach(donation => {
                const donationItem = document.createElement('div');
                donationItem.className = 'donation-item';
                donationItem.innerHTML = `
                    <div class="donation-icon"></div>
                    <div class="donation-details">
                        <p>${donation.foodType} - ${donation.quantity}</p>
                        <p>Expires: ${new Date(donation.expiryDate).toLocaleDateString()}</p>
                        <p>Pickup: ${donation.pickupLocation}</p>
                    </div>
                `;
                nearbySection.appendChild(donationItem);
            });
        }

        // Update volunteer deliveries
        const deliveryList = document.querySelector('#volunteer .delivery-list');
        if (deliveryList && donations.length > 0) {
            deliveryList.innerHTML = '';

            // Show the most recent donations as available for delivery
            donations.slice(-2).forEach(donation => {
                const deliveryItem = document.createElement('div');
                deliveryItem.className = 'delivery-item';
                deliveryItem.innerHTML = `
                    <div class="delivery-icon"></div>
                    <div class="delivery-details">
                        <p>${donation.foodType} - ${donation.quantity}</p>
                        <p>Pickup: ${donation.pickupLocation}</p>
                    </div>
                `;
                deliveryList.appendChild(deliveryItem);
            });
        }

        // Update impact summary
        const mealsSaved = document.querySelector('#dashboard .impact-card:nth-child(1)');
        const donorsCount = document.querySelector('#dashboard .impact-card:nth-child(2)');
        const deliveriesCount = document.querySelector('#dashboard .impact-card:nth-child(3)');

        if (mealsSaved && donorsCount && deliveriesCount) {
            // Simple estimates for demo purposes
            mealsSaved.innerHTML = `Meals Saved<br><strong>${donations.length * 5}</strong>`;
            donorsCount.innerHTML = `Donors<br><strong>${Math.floor(donations.length / 2)}</strong>`;
            deliveriesCount.innerHTML = `Deliveries<br><strong>${Math.floor(donations.length * 0.8)}</strong>`;
        }
    }

    // Initialize dashboard on page load
    updateDashboard();

    // Simulate some initial data
    if (!localStorage.getItem('donations')) {
        const sampleDonations = [
            {
                foodType: "Fresh Vegetables",
                quantity: "5 kg",
                expiryDate: "2025-04-05",
                pickupLocation: "123 Main St",
                timestamp: new Date().toISOString()
            },
            {
                foodType: "Bread and Pastries",
                quantity: "12 items",
                expiryDate: "2025-04-04",
                pickupLocation: "45 Baker Avenue",
                timestamp: new Date().toISOString()
            }
        ];
        localStorage.setItem('donations', JSON.stringify(sampleDonations));
        updateDashboard();
    }
});