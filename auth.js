document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const rememberMe = document.getElementById('remember-me');
    const forgotPasswordLink = document.querySelector('.forgot-password a');

    // Pre-populate dummy accounts on first load
    createDummyAccounts();

    // Switch between login and register tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${tab}-form`).classList.add('active');
        });
    });

    // Check if user is already logged in
    function checkAuth() {
        const user = getCurrentUser();
        if (user) {
            // Redirect to main page if already logged in
            window.location.href = 'index.html';
        }
    }

    // Get current user from storage
    function getCurrentUser() {
        const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Basic validation
        if (!email || !password) {
            showAuthError('Please fill in all fields');
            return;
        }

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current user
            const storage = rememberMe.checked ? localStorage : sessionStorage;
            storage.setItem('currentUser', JSON.stringify(user));
            
            // Show success message
            showAuthSuccess(`Welcome back, ${user.name}! Redirecting...`);
            
            // Redirect to main page after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showAuthError('Invalid email or password. Please try again.');
        }
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const role = document.getElementById('register-role').value;
        
        // Validate all fields are filled
        if (!name || !email || !password || !confirmPassword || !role) {
            showAuthError('Please fill in all fields');
            return;
        }
        
        // Validate email format
        if (!validateEmail(email)) {
            showAuthError('Please enter a valid email address');
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showAuthError('Passwords do not match!');
            return;
        }
        
        // Validate password strength
        if (!validatePassword(password)) {
            showAuthError('Password must be at least 8 characters with uppercase, number, and special character');
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.email === email)) {
            showAuthError('User with this email already exists!');
            return;
        }
        
        // Create new user object
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // Note: In production, you would hash this password
            role,
            createdAt: new Date().toISOString(),
            profileImage: getDefaultAvatar(role)
        };
        
        // Add new user to array
        users.push(newUser);
        
        // Save updated users array to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login the new user
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Show success message
        showAuthSuccess(`Account created successfully! Welcome to RescueBites, ${name}!`);
        
        // Redirect to main page after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });

    // Forgot password functionality
    forgotPasswordLink?.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthError('Password reset functionality coming soon!');
    });

    // Helper Functions

    function createDummyAccounts() {
        const dummyAccounts = [
            {
                id: "1001",
                name: "Food Donor",
                email: "donor@rescuebites.com",
                password: "Donor@123",
                role: "donor",
                createdAt: new Date().toISOString(),
                profileImage: getDefaultAvatar('donor')
            },
            {
                id: "1002",
                name: "Food Seeker",
                email: "seeker@rescuebites.com",
                password: "Seeker@123",
                role: "seeker",
                createdAt: new Date().toISOString(),
                profileImage: getDefaultAvatar('seeker')
            },
            {
                id: "1003",
                name: "Community Volunteer",
                email: "volunteer@rescuebites.com",
                password: "Volunteer@123",
                role: "volunteer",
                createdAt: new Date().toISOString(),
                profileImage: getDefaultAvatar('volunteer')
            },
            {
                id: "1004",
                name: "System Admin",
                email: "admin@rescuebites.com",
                password: "Admin@123",
                role: "admin",
                createdAt: new Date().toISOString(),
                profileImage: getDefaultAvatar('admin')
            }
        ];

        // Only create if they don't exist already
        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
        const existingEmails = existingUsers.map(user => user.email);
        
        dummyAccounts.forEach(account => {
            if (!existingEmails.includes(account.email)) {
                existingUsers.push(account);
            }
        });

        localStorage.setItem('users', JSON.stringify(existingUsers));
    }

    function getDefaultAvatar(role) {
        const avatars = {
            donor: 'fas fa-hand-holding-heart',
            seeker: 'fas fa-utensils',
            volunteer: 'fas fa-hands-helping',
            admin: 'fas fa-user-shield'
        };
        return avatars[role] || 'fas fa-user';
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        // At least 8 chars, 1 uppercase, 1 number, 1 special char
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    }

    function showAuthError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'auth-message error';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Insert after the form
        const activeForm = document.querySelector('.auth-form.active');
        activeForm.appendChild(errorElement);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    function showAuthSuccess(message) {
        const successElement = document.createElement('div');
        successElement.className = 'auth-message success';
        successElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Insert after the form
        const activeForm = document.querySelector('.auth-form.active');
        activeForm.appendChild(successElement);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }

    // Check authentication on page load
    checkAuth();
});