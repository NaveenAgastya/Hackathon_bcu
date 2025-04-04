// Firebase Configuration and Form Submission Handler

// 1. Initialize Firebase (place this in your main JS file)
// You'll need to replace these values with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyAr_XPhkXgr2TDF0j8m9QfSogA1L_iLiYw",
    authDomain: "rescuebits-9d15a.firebaseapp.com",
    databaseURL: "https://rescuebits-9d15a-default-rtdb.firebaseio.com",
    projectId: "rescuebits-9d15a",
    storageBucket: "rescuebits-9d15a.firebasestorage.app",
    messagingSenderId: "395509961192",
    appId: "1:395509961192:web:7de4c07d55bcdf37ec945d",
    measurementId: "G-J5QCYT3BVE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// 2. Form submission handler
document.getElementById('donate-form').addEventListener('submit', submitForm);

function submitForm(e) {
    e.preventDefault();

    // Get form values
    const foodType = getInputVal('food-type');
    const quantity = getInputVal('quantity');
    const expiryDate = getInputVal('expiry-date');
    const pickupLocation = getInputVal('pickup-location');
    const pickupTime = getInputVal('pickup-time');
    const donationNotes = getInputVal('donation-notes');

    // Create donation object
    const donation = {
        foodType,
        quantity,
        expiryDate,
        pickupLocation,
        pickupTime,
        donationNotes,
        status: 'pending', // Initial status
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    // Save donation to Firebase
    saveDonation(donation);

    // Show success message
    showSuccessMessage();

    // Clear form
    document.getElementById('donate-form').reset();
}

// Helper function to get form values
function getInputVal(id) {
    return document.getElementById(id).value;
}

// Save donation to Firebase
function saveDonation(donation) {
    // Generate a new key for the donation
    const newDonationKey = database.ref().child('donations').push().key;

    // Write the new donation data
    const updates = {};
    updates['/donations/' + newDonationKey] = donation;

    // You might also want to maintain a list of donations by user if you implement authentication
    // updates['/user-donations/' + userId + '/' + newDonationKey] = donation;

    return database.ref().update(updates);
}

// Show success message
function showSuccessMessage() {
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success';
    successAlert.role = 'alert';
    successAlert.textContent = 'Your donation has been submitted successfully!';

    // Insert the alert before the form
    const form = document.getElementById('donate-form');
    form.parentNode.insertBefore(successAlert, form);

    // Remove the alert after 3 seconds
    setTimeout(() => {
        successAlert.remove();
    }, 3000);
}

// 3. Optional: Add functions to retrieve donations (for admin panel)
function getAllDonations(callback) {
    const donationsRef = firebase.database().ref('donations');
    donationsRef.on('value', (snapshot) => {
        const donations = snapshot.val();
        callback(donations);
    });
}

// Function to update donation status (for admin)
function updateDonationStatus(donationId, newStatus) {
    const updates = {};
    updates['/donations/' + donationId + '/status'] = newStatus;
    return database.ref().update(updates);
}