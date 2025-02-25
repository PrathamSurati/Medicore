import  { useState } from 'react';
import './BillList.css'

const BillList = ({ bills, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredBills = bills.filter(bill => 
    bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedBills = [...filteredBills].sort((a, b) => {
    if (sortField === 'amount') {
      return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortField === 'dueDate') {
      return sortDirection === 'asc' 
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    } else {
      const aValue = a[sortField]?.toLowerCase() || '';
      const bValue = b[sortField]?.toLowerCase() || '';
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'overdue':
        return 'status-overdue';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="bill-list-container">
      <div className="bill-list-header">
        <h2>Bills</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search bills..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredBills.length === 0 ? (
        <div className="no-bills">No bills found</div>
      ) : (
        <div className="table-responsive">
          <table className="bill-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('patientName')}>
                  Patient 
                  {sortField === 'patientName' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('description')}>
                  Description
                  {sortField === 'description' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('amount')}>
                  Amount
                  {sortField === 'amount' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status
                  {sortField === 'status' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('dueDate')}>
                  Due Date
                  {sortField === 'dueDate' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.patientName}</td>
                  <td>{bill.description}</td>
                  <td>${bill.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="action-btn edit" onClick={() => onEdit(bill)}>
                      Edit
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(bill.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillList;
