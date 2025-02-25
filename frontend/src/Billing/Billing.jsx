import  { useState, useEffect } from 'react';
import { getBillingData, createBill, updateBill, deleteBill } from './BillingService';
import BillForm from './BillForm';
import BillList from './BillList';
import './Billing.css';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [stats, setStats] = useState({
    totalBills: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueBills: 0
  });

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

  return (
    <div className="billing-container">
      <div className="billing-header">
        <h1>Billing Management</h1>
        <button className="add-bill-btn" onClick={() => setShowAddForm(true)}>
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
          <p>${stats.paidAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <p>${stats.pendingAmount.toFixed(2)}</p>
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
          onEdit={setEditBill} 
          onDelete={handleDeleteBill} 
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
    </div>
  );
};

export default Billing;
