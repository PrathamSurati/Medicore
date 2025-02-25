import axios from 'axios';

// Update API URL to use port 8081 instead of 5000
const API_URL = 'http://localhost:8081/api';
// const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8081/api';

// Get all bills
export const getBillingData = async () => {
  try {
    const response = await axios.get(`${API_URL}/bills`);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing data:', error);
    throw error;
  }
};

// Get a single bill by ID
export const getBillById = async (billId) => {
  try {
    const response = await axios.get(`${API_URL}/bills/${billId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bill with ID ${billId}:`, error);
    throw error;
  }
};

// Create a new bill
export const createBill = async (billData) => {
  try {
    // Check the structure of the data we're sending
    console.log('Creating bill with data:', JSON.stringify(billData, null, 2));
    
    // Format the data according to what the server expects
    // This is a simple transformation - adjust based on your API's requirements
    const formattedData = {
      patientId: billData.patientId,
      patientName: billData.patientName || '',
      description: billData.description || '',
      amount: parseFloat(billData.amount || 0),
      status: billData.status || 'Pending',
      dueDate: billData.dueDate || new Date().toISOString(),
      // Only include these fields if they exist
      ...(billData.insurance && { insurance: billData.insurance }),
      ...(billData.paymentMethod && { paymentMethod: billData.paymentMethod }),
      // Add any other required fields
      createdAt: new Date().toISOString()
    };
    
    console.log('Formatted bill data:', JSON.stringify(formattedData, null, 2));
    
    const response = await axios.post(`${API_URL}/bills`, formattedData);
    console.log('Bill created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating bill:', error);
    
    // Enhanced error logging to see the response from the server
    if (error.response) {
      console.error('Server response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    throw error;
  }
};

// Update an existing bill
export const updateBill = async (billData) => {
  try {
    const response = await axios.put(`${API_URL}/bills/${billData.id}`, billData);
    return response.data;
  } catch (error) {
    console.error(`Error updating bill with ID ${billData.id}:`, error);
    throw error;
  }
};

// Delete a bill
export const deleteBill = async (billId) => {
  try {
    const response = await axios.delete(`${API_URL}/bills/${billId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting bill with ID ${billId}:`, error);
    throw error;
  }
};

// Get billing statistics
export const getBillingStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/bills/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing statistics:', error);
    throw error;
  }
};

// Generate invoice for a bill
export const generateInvoice = async (billId) => {
  try {
    const response = await axios.get(`${API_URL}/bills/${billId}/invoice`, {
    responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error generating invoice for bill ID ${billId}:`, error);
    throw error;
  }
};

