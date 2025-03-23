import { useState, useEffect } from 'react';
import { getBillingData, updateBill, deleteBill } from '../../../services/BillingService';
import BillForm from '../../../components/Billing/EditBill/BillForm';
import BillList from '../../../components/Billing/BillList-TableView/BillListTable'; // Make sure the import path is correct
import './Billing.css';
import PaymentForm from '../../../components/Billing/PaymentForm/PaymentForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [paymentBill, setPaymentBill] = useState(null); // Add this missing state
  const navigate = useNavigate(); // Add this hook

  const [stats, setStats] = useState({
    totalBills: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueBills: 0
  });

  // API URL
  const API_URL = 'http://localhost:8081/api';
  
  // Fetch patients data
  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_URL}/patients`);
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  // Fetch billing data
  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await getBillingData();
      setBills(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load billing data. Please try again.');
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate billing statistics
  const calculateStats = (billsData) => {
    const totalBills = billsData.length;
    const paidAmount = billsData
      .filter(bill => bill.status === 'Paid')
      .reduce((sum, bill) => sum + bill.amount, 0);
    const pendingAmount = billsData
      .filter(bill => bill.status === 'Pending')
      .reduce((sum, bill) => sum + bill.amount, 0);
    const overdueBills = billsData.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return bill.status !== 'Paid' && dueDate < new Date();
    }).length;

    setStats({ totalBills, paidAmount, pendingAmount, overdueBills });
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAddBill = async (newBill) => {
    try {
      await createBill(newBill);
      setShowAddForm(false);
      fetchBills();
    } catch (err) {
      setError('Failed to create bill. Please try again.');
      console.error('Error creating bill:', err);
    }
  };

  const handleEditBill = async (updatedBill) => {
    try {
      await updateBill(updatedBill);
      setEditBill(null);
      fetchBills();
    } catch (err) {
      setError('Failed to update bill. Please try again.');
      console.error('Error updating bill:', err);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteBill(billId);
        fetchBills();
      } catch (err) {
        setError('Failed to delete bill. Please try again.');
        console.error('Error deleting bill:', err);
      }
    }
  };

  // Add a view/edit bill handler
  const handleViewBill = (bill) => {
    setEditBill(bill); // Use the edit modal to view the bill
  };

  // Handle payment
  const handlePayBill = (bill) => {
    setPaymentBill(bill);
  };

  // Process the payment
  const processPayment = async (paymentDetails) => {
    try {
      // Create a new object with updated payment information
      const updatedBill = {
        ...paymentBill,
        status: 'Paid',
        paymentDate: new Date(),
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.reference || '',
        notes: paymentDetails.notes || paymentBill.notes || ''
      };

      await updateBill(updatedBill);
      setPaymentBill(null);
      fetchBills();
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      console.error('Error processing payment:', err);
    }
  };

  // Handle print bill
  const handlePrintBill = (bill) => {
    // Create a print-friendly version of the bill
    const printWindow = window.open('', '_blank');
    
    // Get formatted date strings
    const billDate = bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A';
    const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';
    
    // Generate print content with bill details
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt - ${bill.billNumber || `BL-${bill._id?.substr(-6) || 'N/A'}`}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .bill-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .bill-info div {
              flex: 1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .summary {
              margin-top: 30px;
              text-align: right;
            }
            .total {
              font-weight: bold;
              font-size: 1.2em;
              margin-top: 10px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 0.9em;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>MEDICORE</h2>
            <h3>Medical Bill</h3>
          </div>
          
          <div class="bill-info">
            <div>
              <p><strong>Bill #:</strong> ${bill.billNumber || `BL-${bill._id?.substr(-6) || 'N/A'}`}</p>
              <p><strong>Date:</strong> ${billDate}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <div>
              <p><strong>Patient:</strong> ${bill.patientName || 'N/A'}</p>
              <p><strong>Status:</strong> ${bill.status || 'Pending'}</p>
              <p><strong>Patient ID:</strong> ${bill.patientId || 'N/A'}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items ? bill.items.map(item => `
                <tr>
                  <td>${item.description || 'N/A'}</td>
                  <td>${item.quantity || 1}</td>
                  <td>₹${parseFloat(item.price).toFixed(2)}</td>
                  <td>₹${parseFloat(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>
          
          <div class="summary">
            <p><strong>Subtotal:</strong> ₹${(bill.subtotal || 0).toFixed(2)}</p>
            ${bill.discount ? `<p><strong>Discount:</strong> ₹${parseFloat(bill.discount).toFixed(2)}</p>` : ''}
            ${bill.tax ? `<p><strong>Tax:</strong> ${parseFloat(bill.tax).toFixed(2)}%</p>` : ''}
            <p class="total"><strong>Total Amount:</strong> ₹${(bill.totalAmount || bill.amount || 0).toFixed(2)}</p>
          </div>
          
          ${bill.notes ? `<div><strong>Notes:</strong> ${bill.notes}</div>` : ''}
          
          <div class="footer">
            <p>Thank you for choosing Medicore for your healthcare needs.</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">Print Bill</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    // Optionally auto-print the document
    // printWindow.print();
  };

  return (
    <div className="billing-container">
      <div className="billing-header">
        <h1>Billing Management</h1>
        <button 
          className="add-bill-btn" 
          onClick={() => navigate('/AddBills')} // Change this line to navigate to AddBills
        >
          Create New Bill
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="billing-stats">
        <div className="stat-card">
          <h3>Total Bills</h3>
          <p>{stats.totalBills}</p>
        </div>
        <div className="stat-card">
          <h3>Paid Amount</h3>
          <p>₹{stats.paidAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <p>₹{stats.pendingAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Overdue Bills</h3>
          <p>{stats.overdueBills}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading billing data...</div>
      ) : (
        <BillList 
          bills={bills} 
          onEdit={handleViewBill} 
          onDelete={handleDeleteBill} 
          onPay={handlePayBill}
          onPrint={handlePrintBill}
        />
      )}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BillForm 
              onSubmit={handleAddBill}
              onCancel={() => setShowAddForm(false)}
              title="Create New Bill"
            />
          </div>
        </div>
      )}

      {editBill && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BillForm 
              bill={editBill}
              onSubmit={handleEditBill}
              onCancel={() => setEditBill(null)}
              title="Edit Bill"
            />
          </div>
        </div>
      )}

      {paymentBill && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <PaymentForm 
              bill={paymentBill}
              onSubmit={processPayment}
              onCancel={() => setPaymentBill(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
