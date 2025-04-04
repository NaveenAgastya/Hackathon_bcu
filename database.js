// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

// Your Firebase configuration - replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyAr_XPhkXgr2TDF0j8m9QfSogA1L_iLiYw",
    authDomain: "rescuebits-9d15a.firebaseapp.com",
    projectId: "rescuebits-9d15a",
    storageBucket: "rescuebits-9d15a.firebasestorage.app",
    messagingSenderId: "395509961192",
    appId: "1:395509961192:web:7de4c07d55bcdf37ec945d",
    measurementId: "G-J5QCYT3BVE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get form element
    const donateForm = document.getElementById('donate-form');

    // Add submit event listener to the form
    donateForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        const submitBtn = modern - form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        try {
            // Check if user is authenticated
            const user = auth.currentUser;

            if (!user) {
                showNotification('error', 'You must be logged in to submit a donation');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // Get form data
            const formData = {
                foodType: document.getElementById('food-type').value,
                quantity: document.getElementById('quantity').value,
                expiryDate: document.getElementById('expiry-date').value,
                pickupLocation: document.getElementById('pickup-location').value,
                pickupTime: document.getElementById('pickup-time').value,
                notes: document.getElementById('donation-notes').value,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Anonymous',
                status: 'available', // Initial status of donation
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, "foodDonations"), formData);
            console.log("Donation submitted with ID: ", docRef.id);

            // Show success message
            showNotification('success', 'Your food donation has been successfully submitted!');

            // Reset form
            donateForm.reset();

        } catch (error) {
            console.error("Error submitting donation: ", error);
            showNotification('error', 'Error submitting donation. Please try again.');
        }

        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    });

    // Check authentication state on page load
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is signed in");
            // We could pre-fill some fields here if needed
        } else {
            console.log("No user is signed in");
            // Optionally redirect to login page or show login prompt
        }
    });
});

// Function to show notification
function showNotification(type, message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    // Clear any existing classes and add the type
    notification.className = 'notification';
    notification.classList.add(type);

    // Set icon based on notification type
    let icon = type === 'success'
        ? '<i class="fas fa-check-circle"></i>'
        : '<i class="fas fa-exclamation-circle"></i>';

    // Set notification content
    notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;

    // Add show class to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}