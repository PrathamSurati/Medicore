import  { useState } from 'react';
import './BillList.css';

const BillList = ({ bills, patients, onViewBill, onPayBill, onDeleteBill }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'billDate',
    direction: 'desc'
  });

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status, dueDate) => {
    if (status === 'Paid') return 'status-paid';
    
    const today = new Date();
    const due = new Date(dueDate);
    
    return due < today ? 'status-overdue' : 'status-pending';
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBills = [...bills].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

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
              <th onClick={() => requestSort('status')}>
                Status
                {sortConfig.key === 'status' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBills.length > 0 ? (
              sortedBills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.billNumber}</td>
                  <td>{getPatientName(bill.patientId)}</td>
                  <td>{formatDate(bill.billDate)}</td>
                  <td>₹{bill.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(bill.status, bill.dueDate)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn view-btn" onClick={() => onViewBill(bill)}>
                      View
                    </button>
                    {bill.status !== 'Paid' && (
                      <button className="action-btn pay-btn" onClick={() => onPayBill(bill)}>
                        Pay
                      </button>
                    )}
                    <button className="action-btn delete-btn" onClick={() => onDeleteBill(bill._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-bills">
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
