import { useState } from 'react';
import './BillListTable.css';

const BillList = ({ bills, patients = [], onEdit, onDelete, onPay, onPrint }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'billDate',
    direction: 'desc'
  });

  const safeAmount = (amount) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return 0;
    }
    return Number(amount);
  };

  const getPatientName = (patientId) => {
    if (!patients || patients.length === 0) {
      return patientId || 'Unknown Patient';
    }
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  const getStatusClass = (status, dueDate) => {
    if (status === 'Paid') return 'status-paid';
    
    if (!dueDate) return 'status-pending';
    
    try {
      const today = new Date();
      const due = new Date(dueDate);
      return due < today ? 'status-overdue' : 'status-pending';
    } catch (error) {
      return 'status-pending';
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const billsArray = Array.isArray(bills) ? bills : [];

  const sortedBills = [...billsArray].sort((a, b) => {
    if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
    if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getBestDate = (bill) => {
    return bill.billDate || bill.date || bill.createdAt || bill.updatedAt || null;
  };

  return (
    <div className="bill-list-container">
      <div className="bill-table-container">
        <table className="bill-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('billNumber')}>
                Bill #
                {sortConfig.key === 'billNumber' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => requestSort('patientId')}>
                Patient
                {sortConfig.key === 'patientId' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => requestSort('billDate')}>
                Date
                {sortConfig.key === 'billDate' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => requestSort('totalAmount')}>
                Amount
                {sortConfig.key === 'totalAmount' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => requestSort('dueDate')}>
                Due Date
                {sortConfig.key === 'dueDate' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => requestSort('status')}>
                Status
                {sortConfig.key === 'status' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBills.length > 0 ? (
              sortedBills.map((bill) => {
                if (!bill || !bill._id) {
                  console.error('Invalid bill object:', bill);
                  return null;
                }
                
                const amount = safeAmount(bill.totalAmount || bill.amount);
                const billDate = getBestDate(bill);
                
                return (
                  <tr key={bill._id}>
                    <td>{bill.billNumber || `BL-${bill._id?.substr(-6) || 'N/A'}`}</td>
                    <td>{bill.patientName || getPatientName(bill.patientId)}</td>
                    <td>{formatDate(billDate)}</td>
                    <td>₹{amount.toFixed(2)}</td>
                    <td>{formatDate(bill.dueDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(bill.status, bill.dueDate)}`}>
                        {bill.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`payment-btn ${bill.status === 'Paid' ? 'disabled' : ''}`} 
                        onClick={() => bill.status !== 'Paid' && onPay && onPay(bill)}
                        disabled={bill.status === 'Paid'}
                      >
                        {bill.status === 'Paid' ? 'Paid' : 'Pay Now'}
                      </button>
                    </td>
                    <td className="actions-cell">
                      {onPrint && (
                        <button className="action-btn print-btn" onClick={() => onPrint(bill)}>
                          Print
                        </button>
                      )}
                      {onEdit && (
                        <button className="action-btn view-btn" onClick={() => onEdit(bill)}>
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button className="action-btn delete-btn" onClick={() => onDelete(bill._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-bills">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillList;
