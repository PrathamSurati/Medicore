import { useState } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ bill, onSubmit, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState(bill?.notes || '');
  const [errors, setErrors] = useState({});

  // Safe amount accessor
  const safeAmount = (amount) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return 0;
    }
    return Number(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'Card' || paymentMethod === 'UPI' || paymentMethod === 'Bank Transfer') {
      if (!reference) {
        newErrors.reference = 'Reference is required for this payment method';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        paymentMethod,
        reference,
        notes
      });
    }
  };

  // Guard against undefined bill
  if (!bill) {
    return (
      <div className="payment-form-container">
        <h2>Error: Invalid Bill</h2>
        <p>The bill information is missing or invalid.</p>
        <div className="form-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const amount = safeAmount(bill.totalAmount || bill.amount);
  const patientName = bill.patientName || 'Unknown Patient';

  return (
    <div className="payment-form-container">
      <h2>Process Payment</h2>
      <div className="bill-summary">
        <p><strong>Patient:</strong> {patientName}</p>
        <p><strong>Amount Due:</strong> ₹{amount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> {formatDate(bill.dueDate)}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Payment Method</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Credit/Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        {(paymentMethod === 'Card' || paymentMethod === 'UPI' || paymentMethod === 'Bank Transfer') && (
          <div className="form-group">
            <label>Transaction Reference</label>
            <input 
              type="text" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter transaction ID/reference"
            />
            {errors.reference && <span className="error">{errors.reference}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Notes</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional payment notes"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Complete Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
