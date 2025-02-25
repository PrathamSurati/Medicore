import axios from 'axios';

// Update API URL to use port 8081 instead of 5000
const API_URL = 'http://localhost:8081/api';

/**
 * Get all patients
 */
export const getPatients = async () => {
  try {
    // Adding debugging to help troubleshoot the API issue
    console.log(`Fetching patients from: ${API_URL}/patients`);
    const response = await axios.get(`${API_URL}/patients`, {
      // Add headers to help diagnose possible CORS or content type issues
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Log success for debugging
    console.log('Patient data received:', response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// ...existing code...
