import { useState, useEffect } from 'react';
import AddBill from '../../components/Billing/AddNewBill/AddBill';
import { createBill } from '../../services/BillingService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddBills = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Update API URL to use port 8081 instead of 5000
  const API_URL = 'http://localhost:8081/api';

  useEffect(() => {
    // Fetch patients data
    const fetchPatients = async () => {
      try {
        console.log('Fetching patients from:', `${API_URL}/patients`);
        // Use axios instead of fetch for better error handling
        const response = await axios.get(`${API_URL}/patients`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Patient data received:', response.data);
        setPatients(response.data);
      } catch (err) {
        setError('Failed to load patients data');
        
        // Enhanced error logging
        if (err.response) {
          const contentType = err.response.headers['content-type'] || '';
          console.error('Error response:', {
            status: err.response.status,
            headers: err.response.headers,
            contentType
          });
          
          // Check if the response is HTML
          if (typeof err.response.data === 'string' && err.response.data.includes('<!doctype')) {
            console.error('Received HTML instead of JSON. Please check your API endpoint and server configuration.');
            setError('API server error: Received HTML instead of JSON. Check server configuration.');
          }
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('API server unreachable. Please check if the server is running.');
        } else {
          console.error('Error setting up request:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleAddBill = async (billData) => {
    try {
      // Format the bill data to match the API's expected structure
      // Keep it simple - focus on the core fields that the API requires
      const simplifiedBillData = {
        patientId: billData.patientId,
        patientName: (patients.find(p => p._id === billData.patientId) || {}).name || '',
        description: billData.items.map(item => item.description).join(', ') || 'Medical services',
        amount: billData.totalAmount,
        status: billData.status,
        dueDate: billData.dueDate,
        // Only include these optional fields if they have values
        ...(billData.notes && { notes: billData.notes }),
        items: billData.items // Include items if your API supports them
      };

      console.log('Sending bill to server:', simplifiedBillData);
      
      await createBill(simplifiedBillData);
      // Show success message
      alert('Bill created successfully!');
      // Redirect to bills page after successful creation
      navigate('/billing');
    } catch (err) {
      // Show more detailed error information
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to create bill: ${errorMessage}`);
      console.error('Error creating bill:', err);
    }
  };

  const handleCancel = () => {
    navigate('/billing');
  };

  if (loading) {
    return <div className="loading">Loading patient data...</div>;
  }

  return (
    <div className="add-bills-container">
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      <AddBill 
        patients={patients} 
        onAddBill={handleAddBill} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default AddBills;
