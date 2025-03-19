import { useState, useEffect, useRef } from "react";
import medicineData from "../../../utils/json/medicine.json";
import "./AddBill.css";

const AddBill = ({ patients, onAddBill, onCancel }) => {
  const [billData, setBillData] = useState({
    patientId: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Default to 30 days from now
    billNumber: `BILL-${Math.floor(10000 + Math.random() * 90000)}`,
    items: [{ description: "", quantity: 1, price: 0 }],
    status: "Pending",
    notes: "",
    discount: 0,
    tax: 0,
  });

  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const suggestionsRef = useRef(null);
  const modalRef = useRef(null);

  // Process medicine data into a more usable format - only keep name and price
  const medicines = medicineData.medicine.map(medicineObj => {
    const medicineName = Object.keys(medicineObj)[0];
    return {
      name: medicineName,
      price: parseFloat(medicineObj[medicineName]["Price (INR)"]) || 0,
      category: medicineObj[medicineName].Category
    };
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleModalClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };
    
    document.addEventListener("mousedown", handleModalClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleModalClickOutside);
    };
  }, [onCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillData({ ...billData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billData.items];
    updatedItems[index][field] = value;
    
    // Show medicine suggestions when typing in description field
    if (field === "description" && value.trim() !== "") {
      const filteredSuggestions = medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions for better UX
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
      setActiveItemIndex(index);
      setActiveSuggestionIndex(0);
    } else if (field === "description") {
      setShowSuggestions(false);
    }
    
    setBillData({ ...billData, items: updatedItems });
  };

  const handleSuggestionClick = (suggestion) => {
    if (activeItemIndex !== null) {
      const updatedItems = [...billData.items];
      updatedItems[activeItemIndex] = {
        ...updatedItems[activeItemIndex],
        description: suggestion.name,
        price: suggestion.price
        // Removed medicineDetails object
      };
      
      setBillData({ ...billData, items: updatedItems });
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e, index) => {
    // Arrow key navigation for suggestions
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && suggestions.length > 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  const addItem = () => {
    setBillData({
      ...billData,
      items: [...billData.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const updatedItems = billData.items.filter((_, i) => i !== index);
    setBillData({ ...billData, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return billData.items.reduce((total, item) => {
      return total + parseFloat(item.price) * parseInt(item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(billData.discount) || 0;
    const tax = parseFloat(billData.tax) || 0;

    return (subtotal - discount) * (1 + tax / 100);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!billData.patientId) newErrors.patientId = "Patient is required";
    if (!billData.billDate) newErrors.billDate = "Bill date is required";
    if (!billData.dueDate) newErrors.dueDate = "Due date is required";
    if (!billData.billNumber) newErrors.billNumber = "Bill number is required";

    billData.items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`itemDescription${index}`] = "Description is required";
      }
      if (item.quantity <= 0) {
        newErrors[`itemQuantity${index}`] = "Quantity must be greater than 0";
      }
      if (item.price <= 0) {
        newErrors[`itemPrice${index}`] = "Price must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const subtotal = calculateSubtotal();
    const totalAmount = calculateTotal();

    // Keep the bill data structure simple and consistent
    const newBill = {
      patientId: billData.patientId,
      billNumber: billData.billNumber,
      billDate: billData.billDate,
      dueDate: billData.dueDate,
      status: billData.status,
      items: billData.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.quantity) * Number(item.price),
      })),
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(billData.discount || 0),
      tax: Number(billData.tax || 0),
      totalAmount: Number(totalAmount.toFixed(2)),
      notes: billData.notes || "",
    };

    // Debug log to see what we're sending
    console.log("New bill data:", newBill);

    onAddBill(newBill);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onCancel()}>
      <div className="modal-content add-bill-form" ref={modalRef}>
        <div className="modal-header">
          <h2>Create New Bill</h2>
          <button className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Patient</label>
              <select
                name="patientId"
                value={billData.patientId}
                onChange={handleChange}
                className={`form-control ${errors.patientId ? "error" : ""}`}
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <div className="error-text">{errors.patientId}</div>
              )}
            </div>

            <div className="form-group">
              <label>Bill Number</label>
              <input
                type="text"
                name="billNumber"
                value={billData.billNumber}
                onChange={handleChange}
                className={`form-control ${errors.billNumber ? "error" : ""}`}
                readOnly
              />
              {errors.billNumber && (
                <div className="error-text">{errors.billNumber}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bill Date</label>
              <input
                type="date"
                name="billDate"
                value={billData.billDate}
                onChange={handleChange}
                className={`form-control ${errors.billDate ? "error" : ""}`}
              />
              {errors.billDate && (
                <div className="error-text">{errors.billDate}</div>
              )}
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={billData.dueDate}
                onChange={handleChange}
                className={`form-control ${errors.dueDate ? "error" : ""}`}
              />
              {errors.dueDate && (
                <div className="error-text">{errors.dueDate}</div>
              )}
            </div>
          </div>

          <div className="items-section">
            <h3>Bill Items</h3>
            <div className="items-header">
              <div>Description</div>
              <div>Qty</div>
              <div>Price (₹)</div>
              <div>Total (₹)</div>
              <div></div>
            </div>

            {billData.items.map((item, index) => (
              <div className="item-row" key={index}>
                <div className="item-suggestion-container">
                  <input
                    type="text"
                    placeholder="Type medicine name..."
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={errors[`itemDescription${index}`] ? "error" : ""}
                  />
                  {showSuggestions && activeItemIndex === index && (
                    <ul className="suggestions-list" ref={suggestionsRef}>
                      {suggestions.map((suggestion, i) => (
                        <li
                          key={i}
                          className={i === activeSuggestionIndex ? "suggestion-item active" : "suggestion-item"}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="suggestion-name">{suggestion.name}</div>
                          <div className="suggestion-details">
                            <span className="suggestion-price">₹{suggestion.price}</span>
                            <span className="suggestion-category">{suggestion.category}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors[`itemDescription${index}`] && (
                    <div className="error-text">
                      {errors[`itemDescription${index}`]}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    className={errors[`itemQuantity${index}`] ? "error" : ""}
                  />
                  {errors[`itemQuantity${index}`] && (
                    <div className="error-text">
                      {errors[`itemQuantity${index}`]}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        parseFloat(e.target.value)
                      )
                    }
                    className={errors[`itemPrice${index}`] ? "error" : ""}
                  />
                  {errors[`itemPrice${index}`] && (
                    <div className="error-text">
                      {errors[`itemPrice${index}`]}
                    </div>
                  )}
                </div>
                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
                <div>
                  {billData.items.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
                
                {/* Removed the medicine details section */}
              </div>
            ))}

            <button type="button" className="add-item-btn" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <div className="bill-summary">
            <div className="summary-row">
              <div className="summary-label">Subtotal:</div>
              <div className="summary-value">
                ₹{calculateSubtotal().toFixed(2)}
              </div>
            </div>

            <div className="summary-row">
              <div className="summary-label">Discount:</div>
              <div className="summary-input">
                <input
                  type="number"
                  min="0"
                  name="discount"
                  value={billData.discount}
                  onChange={handleChange}
                />{" "}
                ₹
              </div>
            </div>

            <div className="summary-row">
              <div className="summary-label">Tax:</div>
              <div className="summary-input">
                <input
                  type="number"
                  min="0"
                  name="tax"
                  value={billData.tax}
                  onChange={handleChange}
                />{" "}
                %
              </div>
            </div>

            <div className="summary-row total-row">
              <div className="summary-label">Total:</div>
              <div className="summary-value total-value">
                ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
          {/*           
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={billData.notes}
              onChange={handleChange}
              className="form-control notes"
              placeholder="Optional notes..."
            />
          </div> */}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBill;
