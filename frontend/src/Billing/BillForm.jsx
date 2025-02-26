import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const BillForm = ({ bill, onSubmit, onCancel, title, patients }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    description: '',
    amount: '',
    status: 'Pending',
    dueDate: '',
    insurance: '',
    paymentMethod: ''
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        id: bill.id,
        patientId: bill.patientId,
        patientName: bill.patientName,
        description: bill.description,
        amount: bill.amount,
        status: bill.status,
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
        insurance: bill.insurance || '',
        paymentMethod: bill.paymentMethod || ''
      });
    }
  }, [bill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If selecting a patient, update the patient name automatically
    if (name === 'patientId' && patients) {
      const selectedPatient = patients.find(p => p.id === value);
      if (selectedPatient) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          patientName: selectedPatient.name || selectedPatient.fullName || ''
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert amount to number
    const processedData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    onSubmit(processedData);
  };

  return (
    <div>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="close-btn" onClick={onCancel}>&times;</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientId">Patient</label>
          {patients && patients.length > 0 ? (
            <select
              id="patientId"
              name="patientId"
              className="form-control"
              value={formData.patientId}
              onChange={handleChange}
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name || patient.fullName || `Patient ${patient.id}`}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="patientId"
              name="patientId"
              className="form-control"
              value={formData.patientId}
              onChange={handleChange}
              required
              placeholder="Patient ID (Patient list not available)"
            />
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="patientName">Patient Name</label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            className="form-control"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            id="amount"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            className="form-control"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="insurance">Insurance</label>
          <input
            type="text"
            id="insurance"
            name="insurance"
            className="form-control"
            value={formData.insurance}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className="form-control"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="">Select Payment Method</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="Insurance">Insurance</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
        
        <div className="form-buttons">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {bill ? 'Update Bill' : 'Create Bill'}
          </button>
        </div>
      </form>
    </div>
  );
};

BillForm.propTypes = {
  bill: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    patientId: PropTypes.string,
    patientName: PropTypes.string,
    description: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    dueDate: PropTypes.string,
    insurance: PropTypes.string,
    paymentMethod: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  patients: PropTypes.array
};

BillForm.defaultProps = {
  bill: null,
  title: 'Bill Form',
  patients: null
};

export default BillForm;

