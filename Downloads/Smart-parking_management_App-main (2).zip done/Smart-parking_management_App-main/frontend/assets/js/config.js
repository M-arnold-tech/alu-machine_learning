// API Configuration
// This file centralizes the API base URL for the frontend
// For local development, use: 'http://127.0.0.1:5000'
// For production, this will be set to your Render backend URL

// Automatically detect environment
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// Set API URL based on environment
// IMPORTANT: Replace 'your-backend-url' with your actual Render backend URL after deployment
// Example: 'https://smart-parking-api.onrender.com'
const API_BASE_URL = isLocalhost 
    ? 'https://smart-parking-management-app-ggbf.onrender.com'  // Local development
    : 'https://smart-parking-management-app-ggbf.onrender.com';  // Production - UPDATE THIS!

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL };
}

