/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut, onAuthStateChanged, updateProfile, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, doc, query, where, limit, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAeLRIkeJQLTAOioG7BAlAwVZXBvvs1ixg",
    authDomain: "rescuebites-daf20.firebaseapp.com",
    databaseURL: "https://rescuebites-daf20-default-rtdb.firebaseio.com",
    projectId: "rescuebites-daf20",
    storageBucket: "rescuebites-daf20.firebasestorage.app",
    messagingSenderId: "1024045025573",
    appId: "1:1024045025573:web:ef8bf1f68893164b1472cc",
    measurementId: "G-LLS7CCG16D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDB = getDatabase(app);

// Utility Functions
function getElementOrThrow(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element with ID ${id} not found`);
    return el;
}


function getElementOrNull(id) {
    return document.getElementById(id);
}

function showToast(message, type = 'info') {
    const toastContainer = getElementOrNull('toast-container') || document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// User Management System
const userDatabase = {
    findUserByEmail: async function (email) {
        try {
            const userQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                return {
                    id: userDoc.id,
                    ...userDoc.data()
                };
            }
            return null;
        } catch (error) {
            console.error("Error finding user by email:", error);
            showToast("Error finding user", 'error');
            return null;
        }
    },

    findUserById: async function (id) {
        try {
            const userDoc = await getDoc(doc(db, 'users', id));
            if (userDoc.exists()) {
                return {
                    id: userDoc.id,
                    ...userDoc.data()
                };
            }
            return null;
        } catch (error) {
            console.error("Error finding user by ID:", error);
            showToast("Error finding user", 'error');
            return null;
        }
    },

    getUsersByRole: async function (role) {
        try {
            const usersQuery = query(collection(db, 'users'), where('role', '==', role));
            const usersSnapshot = await getDocs(usersQuery);
            return usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting users by role:", error);
            showToast("Error loading users", 'error');
            return [];
        }
    },

    addUser: async function (user) {
        try {
            const userData = {
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || "",
                location: user.location || "",
                notifications: [],
                createdAt: serverTimestamp()
            };

            const userRef = await addDoc(collection(db, 'users'), userData);
            return {
                id: userRef.id,
                ...userData
            };
        } catch (error) {
            console.error("Error adding user:", error);
            showToast("Error creating user", 'error');
            return null;
        }
    },

    addNotification: async function (userId, notification) {
        try {
            const notificationWithId = {
                id: Date.now(),
                ...notification,
                read: false,
                createdAt: new Date().toISOString()
            };

            await updateDoc(doc(db, 'users', userId), {
                notifications: arrayUnion(notificationWithId)
            });
            return true;
        } catch (error) {
            console.error("Error adding notification:", error);
            showToast("Error sending notification", 'error');
            return false;
        }
    },

    markNotificationAsRead: async function (userId, notificationId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (!userDoc.exists()) return false;

            const userData = userDoc.data();
            const updatedNotifications = userData.notifications.map(notification => {
                if (notification.id === notificationId) {
                    return { ...notification, read: true };
                }
                return notification;
            });

            await updateDoc(doc(db, 'users', userId), {
                notifications: updatedNotifications
            });
            return true;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return false;
        }
    }
};

// Authentication System
const authSystem = {
    currentUser: null,

    login: async function (email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            const userQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                const userData = userDoc.data();
                this.currentUser = {
                    id: userDoc.id,
                    ...userData,
                    firebaseUid: firebaseUser.uid
                };
                return this.currentUser;
            }
            return null;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    register: async function (userData) {
        try {
            const signInMethods = await fetchSignInMethodsForEmail(auth, userData.email);
            if (signInMethods.length > 0) {
                return { error: "Email already in use" };
            }

            if (userData.password !== userData.confirm) {
                return { error: "Passwords don't match" };
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );
            const firebaseUser = userCredential.user;

            await updateProfile(firebaseUser, {
                displayName: userData.name
            });

            const newUser = {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phone: userData.phone || "",
                location: userData.location || "",
                notifications: [],
                firebaseUid: firebaseUser.uid,
                createdAt: serverTimestamp()
            };

            const userRef = await addDoc(collection(db, 'users'), newUser);
            this.currentUser = {
                id: userRef.id,
                ...newUser
            };

            return { user: this.currentUser };
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },

    googleSignIn: async function () {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;

            const userQuery = query(collection(db, 'users'), where('email', '==', firebaseUser.email), limit(1));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                const userData = userDoc.data();
                this.currentUser = {
                    id: userDoc.id,
                    ...userData,
                    firebaseUid: firebaseUser.uid
                };
                return { user: this.currentUser };
            } else {
                return {
                    newUser: true,
                    partialUser: {
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        firebaseUid: firebaseUser.uid
                    }
                };
            }
        } catch (error) {
            console.error("Google sign-in error:", error);
            throw error;
        }
    },

    completeProfile: async function (userData) {
        try {
            const newUser = {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phone: userData.phone || "",
                location: userData.location || "",
                notifications: [],
                firebaseUid: userData.firebaseUid,
                createdAt: serverTimestamp()
            };

            const userRef = await addDoc(collection(db, 'users'), newUser);
            this.currentUser = {
                id: userRef.id,
                ...newUser
            };

            return { user: this.currentUser };
        } catch (error) {
            console.error("Complete profile error:", error);
            throw error;
        }
    },

    resetPassword: async function (email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error("Password reset error:", error);
            throw error;
        }
    },

    logout: async function () {
        try {
            await signOut(auth);
            this.currentUser = null;
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    },

    isAuthenticated: function () {
        return this.currentUser !== null;
    },

    getUser: function () {
        return this.currentUser;
    },

    initAuthStateListener: function (callback) {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);

                if (!docSnap.exists()) {
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        createdAt: new Date(),
                    });
                    console.log("✅ User document created in Firestore.");
                } else {
                    console.log("✅ User document already exists.");
                }
            }
        });
    }
};



async function addUserManually(uid, email) {
    try {
        await setDoc(doc(db, "users", uid), {
            uid: uid,
            email: email,
            createdAt: new Date(),
        });
        console.log("✅ User manually added to Firestore.");
    } catch (error) {
        console.error("❌ Error adding user:", error);
    }
}

// Food Request System
const foodRequestSystem = {
    createRequest: async function (seekerId, details) {
        try {
            const seeker = await userDatabase.findUserById(seekerId);
            if (!seeker) {
                throw new Error("Seeker not found");
            }

            const requestData = {
                seekerId,
                seekerName: seeker.name,
                ...details,
                status: "inquiring",
                donorId: null,
                volunteerId: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const requestRef = await addDoc(collection(db, 'requests'), requestData);
            const requestSnapshot = await getDoc(requestRef);
            const requestData2 = requestSnapshot.data();

            const newRequest = {
                id: requestRef.id,
                ...requestData2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await this.notifyDonors(newRequest);
            return newRequest;
        } catch (error) {
            console.error("Error creating request:", error);
            showToast("Error creating request", 'error');
            throw error;
        }
    },

    notifyDonors: async function (request) {
        try {
            const donors = await userDatabase.getUsersByRole("donor");
            for (const donor of donors) {
                await userDatabase.addNotification(donor.id, {
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
            }
        } catch (error) {
            console.error("Error notifying donors:", error);
            throw error;
        }
    },

    getRequests: async function () {
        try {
            const requestsSnapshot = await getDocs(collection(db, 'requests'));
            return requestsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting requests:", error);
            showToast("Error loading requests", 'error');
            return [];
        }
    },

    getRequestById: async function (requestId) {
        try {
            const requestDoc = await getDoc(doc(db, 'requests', requestId));
            if (requestDoc.exists()) {
                return {
                    id: requestDoc.id,
                    ...requestDoc.data()
                };
            }
            return null;
        } catch (error) {
            console.error("Error getting request by ID:", error);
            showToast("Error loading request", 'error');
            return null;
        }
    },

    updateRequestStatus: async function (requestId, status, details = {}) {
        try {
            await updateDoc(doc(db, 'requests', requestId), {
                status,
                ...details,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating request status:", error);
            showToast("Error updating request", 'error');
            return false;
        }
    }
};

// Counter Animation Functions
function updateCounter(element, target) {
    if (!element) {
        console.error('Counter element not found');
        return;
    }
    element.textContent = target;
}

function animateCounter(element, start, end, duration) {
    if (!element) return;

    let startTime = null;
    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        updateCounter(element, value);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// User Content Management
function loadUserContent(user) {
    if (!user) return;

    console.log(`Loading content for ${user.role}: ${user.name}`);

    try {
        // Load role-specific content
        switch (user.role) {
            case 'donor':
                loadDonorContent(user);
                break;
            case 'seeker':
                loadSeekerContent(user);
                break;
            case 'volunteer':
                loadVolunteerContent(user);
                break;
            default:
                console.error('Unknown user role');
        }

        // Load common content
        loadCommonContent(user);
    } catch (error) {
        console.error('Error loading user content:', error);
        showToast('Error loading content', 'error');
    }
}

function loadDonorContent(user) {
    // Donor-specific content loading
    const donorDashboard = getElementOrNull('donor-dashboard');
    if (donorDashboard) {
        donorDashboard.style.display = 'block';
    }
}

function loadSeekerContent(user) {
    // Seeker-specific content loading
    const seekerDashboard = getElementOrNull('seeker-dashboard');
    if (seekerDashboard) {
        seekerDashboard.style.display = 'block';
    }
}

function loadVolunteerContent(user) {
    // Volunteer-specific content loading
    const volunteerDashboard = getElementOrNull('volunteer-dashboard');
    if (volunteerDashboard) {
        volunteerDashboard.style.display = 'block';
    }
}

function loadCommonContent(user) {
    // Content common to all roles
    const userProfile = getElementOrNull('user-profile');
    if (userProfile) {
        userProfile.textContent = `Welcome, ${user.name}`;
    }
}

function initializeNotifications(user) {
    if (!user) return;

    console.log(`Initializing notifications for user: ${user.id}`);

    try {
        const notificationsBadge = getElementOrNull('notifications-badge');
        if (notificationsBadge) {
            const unreadCount = user.notifications?.filter(n => !n.read).length || 0;
            notificationsBadge.textContent = unreadCount;
            notificationsBadge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}

// Modal Functions
function openCompleteProfileModal(partialUser) {
    let modal = getElementOrNull('complete-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'complete-profile-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Complete Your Profile</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="complete-profile-form">
                        <div class="form-group">
                            <label for="complete-name">Name</label>
                            <input type="text" id="complete-name" required>
                        </div>
                        <div class="form-group">
                            <label>I am a:</label>
                            <div class="role-selection">
                                <label>
                                    <input type="radio" name="complete-role" value="donor" checked>
                                    <span>Food Donor</span>
                                </label>
                                <label>
                                    <input type="radio" name="complete-role" value="seeker">
                                    <span>Food Seeker</span>
                                </label>
                                <label>
                                    <input type="radio" name="complete-role" value="volunteer">
                                    <span>Volunteer</span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="complete-phone">Phone (optional)</label>
                            <input type="tel" id="complete-phone">
                        </div>
                        <div class="form-group">
                            <label for="complete-location">Location (optional)</label>
                            <input type="text" id="complete-location">
                        </div>
                        <button type="submit" class="btn-primary">Complete Profile</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            authSystem.logout();
        });
    }

    modal.querySelector('#complete-name').value = partialUser.name || '';

    const form = modal.querySelector('#complete-profile-form');
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const completeData = {
            ...partialUser,
            name: getElementOrThrow('complete-name').value,
            role: document.querySelector('input[name="complete-role"]:checked').value,
            phone: getElementOrThrow('complete-phone').value,
            location: getElementOrThrow('complete-location').value
        };

        try {
            const result = await authSystem.completeProfile(completeData);
            modal.style.display = 'none';
            showToast(`Welcome, ${result.user.name}!`, 'success');
            initializeAppForUser(result.user);
        } catch (error) {
            showToast(`Error completing profile: ${error.message}`, 'error');
        }
    });

    modal.style.display = 'flex';
}

function openForgotPasswordModal() {
    let modal = getElementOrNull('forgot-password-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forgot-password-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Reset Password</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <form id="forgot-password-form">
                        <div class="form-group">
                            <label for="reset-email">Email</label>
                            <input type="email" id="reset-email" required>
                        </div>
                        <button type="submit" class="btn-primary">Send Reset Link</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    const form = modal.querySelector('#forgot-password-form');
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = getElementOrThrow('reset-email').value;

        try {
            await authSystem.resetPassword(email);
            modal.style.display = 'none';
            showToast(`Password reset email sent to ${email}`, 'success');
        } catch (error) {
            showToast(`Error sending reset email: ${error.message}`, 'error');
        }
    });

    modal.style.display = 'flex';
}

// Initialize the Application
async function initializeAppForUser(user) {
    try {
        const loginPage = getElementOrNull('login-page');
        const appContainer = getElementOrNull('app-container');

        if (loginPage) loginPage.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';

        const usernameDisplay = getElementOrNull('username');
        if (usernameDisplay) usernameDisplay.textContent = user.name;

        const userAvatar = getElementOrNull('user-avatar');
        if (userAvatar) userAvatar.innerHTML = `<i class="fas fa-user"></i>`;

        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            const tabName = tab.dataset.tab;
            if (tabName === 'dashboard' && user.role === 'seeker') {
                tab.style.display = 'none';
            } else {
                tab.style.display = 'flex';
            }
        });

        loadUserContent(user);
        initializeNotifications(user);
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Error initializing application', 'error');
    }
}

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create social login button and forgot password link
        const googleLoginButton = document.createElement('button');
        googleLoginButton.type = 'button';
        googleLoginButton.className = 'btn-social google';
        googleLoginButton.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
        googleLoginButton.addEventListener('click', async () => {
            try {
                const result = await authSystem.googleSignIn();
                if (result.error) {
                    showToast(result.error, 'error');
                } else if (result.newUser) {
                    openCompleteProfileModal(result.partialUser);
                } else {
                    showToast(`Welcome back, ${result.user.name}!`, 'success');
                    initializeAppForUser(result.user);
                }
            } catch (error) {
                showToast(`Google sign-in error: ${error.message}`, 'error');
            }
        });

        const forgotPasswordLink = document.createElement('a');
        forgotPasswordLink.href = '#';
        forgotPasswordLink.className = 'forgot-password-link';
        forgotPasswordLink.textContent = 'Forgot Password?';
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            openForgotPasswordModal();
        });

        // Add to login form if exists
        const loginFormButtons = document.querySelector('.login-form-buttons');
        if (loginFormButtons) {
            loginFormButtons.appendChild(googleLoginButton);
            loginFormButtons.appendChild(forgotPasswordLink);
        }

        // Set up form event listeners
        const loginForm = getElementOrNull('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = getElementOrThrow('login-email').value;
                const password = getElementOrThrow('login-password').value;

                const submitButton = loginForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                submitButton.disabled = true;

                try {
                    const user = await authSystem.login(email, password);
                    if (user) {
                        showToast(`Welcome back, ${user.name}!`, 'success');
                        initializeAppForUser(user);
                    } else {
                        showToast('Invalid email or password', 'error');
                    }
                } catch (error) {
                    showToast(`Login error: ${error.message}`, 'error');
                } finally {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                }
            });
        }

        const registerForm = getElementOrNull('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userData = {
                    name: getElementOrThrow('register-name').value,
                    email: getElementOrThrow('register-email').value,
                    password: getElementOrThrow('register-password').value,
                    confirm: getElementOrThrow('register-confirm').value,
                    role: document.querySelector('input[name="role"]:checked').value,
                    phone: "",
                    location: ""
                };

                const submitButton = registerForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                submitButton.disabled = true;

                try {
                    const result = await authSystem.register(userData);
                    if (result.error) {
                        showToast(result.error, 'error');
                    } else {
                        showToast(`Account created successfully! Welcome, ${result.user.name}`, 'success');
                        initializeAppForUser(result.user);
                    }
                } catch (error) {
                    showToast(`Registration error: ${error.message}`, 'error');
                } finally {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                }
            });
        }

        // Initialize auth state listener
        authSystem.initAuthStateListener((user) => {
            if (user) {
                initializeAppForUser(user);
            } else {
                const loginPage = getElementOrNull('login-page');
                const appContainer = getElementOrNull('app-container');
                if (loginPage) loginPage.style.display = 'flex';
                if (appContainer) appContainer.style.display = 'none';
            }
        });

        // Add global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            showToast('An unexpected error occurred', 'error');
        });

    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Error initializing application', 'error');
    }
});

// Add styles
const firebaseStyles = document.createElement('style');
firebaseStyles.innerHTML = `
    .btn-social {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        font-weight: 500;
        cursor: pointer;
        transition: background-color var(--transition-fast);
        margin-top: var(--spacing-md);
        width: 100%;
    }
    
    .btn-social.google {
        background-color: white;
        color: #4285F4;
        border: 1px solid #dadce0;
    }
    
    .btn-social.google:hover {
        background-color: #f8f9fa;
    }
    
    .forgot-password-link {
        display: block;
        text-align: center;
        margin-top: var(--spacing-md);
        color: var(--primary-color);
        font-size: 0.9rem;
    }
    
    #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .toast {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        color: white;
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .toast.show {
        opacity: 1;
    }
    
    .toast-success {
        background-color: #4CAF50;
    }
    
    .toast-error {
        background-color: #F44336;
    }
    
    .toast-info {
        background-color: #2196F3;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background-color: white;
        border-radius: var(--radius-lg);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 500px;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }

    .close-modal {
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }

    .modal-body {
        padding: var(--spacing-lg);
    }

    .role-selection {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }

    .role-selection label {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
`;
document.head.appendChild(firebaseStyles); */