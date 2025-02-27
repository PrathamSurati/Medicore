import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MedicineData from '../../../utils/json/medicine.json';
import './Medicines.css';

const MedicinesComponent = ({ medicines, setMedicines }) => {
  const [sampleMedicines, setSampleMedicines] = useState({});
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [selectedMedicineType, setSelectedMedicineType] = useState("");

  useEffect(() => {
    const medicines = {};
    const types = new Set();
    
    MedicineData.medicine.forEach(med => {
      const key = Object.keys(med)[0];
      medicines[key] = med[key];
      
      // Add the medicine type to our set
      if (med[key].Type) {
        types.add(med[key].Type);
      }
      if (med[key].Category) {
        types.add(med[key].Category);
      }
    });
    
    setSampleMedicines(medicines);
    setMedicineTypes(Array.from(types).sort());
  }, []);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", when: "", duration: "", Qty: "", Note: "" }, // Removed dose and frequency
    ]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = medicines.map((m, i) => {
      if (i === index) {
        const updatedMedicine = { ...m, [field]: value };
        if (field === "name" && sampleMedicines[value]) {
          // Only copy relevant fields
          const { when, duration, Qty, Note } = sampleMedicines[value];
          return { ...updatedMedicine, when, duration, Qty, Note };
        }
        return updatedMedicine;
      }
      return m;
    });
    setMedicines(updatedMedicines);
  };

  const handleMedicineTypeChange = (value) => {
    setSelectedMedicineType(value);
    
    if (value) {
      const filteredMeds = Object.entries(sampleMedicines)
        .filter(([_, med]) => 
          med.Type === value || med.Category === value
        )
        .map(([name]) => name);
      
      setFilteredMedicines(filteredMeds);
    } else {
      setFilteredMedicines(Object.keys(sampleMedicines));
    }
  };

  const handleMedicineFocus = () => {
    if (!selectedMedicineType) {
      setFilteredMedicines(Object.keys(sampleMedicines));
    }
  };

  const handleMedicineInputChange = (event, index) => {
    const query = event.target.value.toLowerCase();
    handleMedicineChange(index, "name", event.target.value);

    if (query.length > 0) {
      let filtered;
      if (selectedMedicineType) {
        filtered = Object.entries(sampleMedicines)
          .filter(([name, med]) => 
            (med.Type === selectedMedicineType || med.Category === selectedMedicineType) &&
            name.toLowerCase().includes(query)
          )
          .map(([name]) => name);
      } else {
        filtered = Object.keys(sampleMedicines).filter(med => 
          med.toLowerCase().includes(query)
        );
      }
      setFilteredMedicines(filtered);
    } else {
      handleMedicineTypeChange(selectedMedicineType);
    }
  };

  return (
    <div className="medicines-container">
      <div className="medicines-header">
        <h2>Medicines</h2>
        
        {/* Medicine type filter */}
        <div className="medicine-filter">
          <label>Filter by Type:</label>
          <select 
            value={selectedMedicineType}
            onChange={(e) => handleMedicineTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            {medicineTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          {selectedMedicineType && (
            <span className="filter-indicator">
              {filteredMedicines.length} medicines
            </span>
          )}
        </div>
      </div>
      
      <div className="medicines-table">
        {/* Add medicine titles row */}
        <div className="medicine-titles">
          <span>Medicine</span>
          <span>When</span>
          <span>Duration</span>
          <span>Qty</span>
          <span>Note</span>
          <span>Action</span>
        </div>
        
        <div className="medicines-list">
          {medicines.map((medicine, index) => (
            <div key={index} className="medicine-item">
              <input
                className="medicine_input"
                type="text"
                placeholder="Medicine"
                value={medicine.name}
                onChange={(e) => handleMedicineInputChange(e, index)}
                onFocus={() => handleMedicineFocus()}
                list={`medicine-suggestions-${index}`}
                autoComplete="off"
              />
              <datalist id={`medicine-suggestions-${index}`}>
                {filteredMedicines.map((med, idx) => (
                  <option key={idx} value={med} />
                ))}
              </datalist>
              <input
                type="text"
                placeholder="When"
                value={medicine.when}
                onChange={(e) => handleMedicineChange(index, "when", e.target.value)}
              />
              <input
                type="text"
                placeholder="Duration"
                value={medicine.duration}
                onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
              />
              <input
                type="number"
                placeholder="Qty"
                value={medicine.Qty}
                onChange={(e) => handleMedicineChange(index, "Qty", e.target.value)}
              />
              <textarea
                placeholder="Note"
                value={medicine.Note}
                onChange={(e) => handleMedicineChange(index, "Note", e.target.value)}
              />
              <button 
                className="remove-medicine-btn" 
                onClick={() => removeMedicine(index)}
                aria-label="Remove medicine"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={addMedicine} className="add-medicine-btn">
        <span className="plus-icon">+</span> Add Medicine
      </button>
    </div>
  );
};

MedicinesComponent.propTypes = {
  medicines: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    when: PropTypes.string,
    duration: PropTypes.string,
    Qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    Note: PropTypes.string
  })).isRequired,
  setMedicines: PropTypes.func.isRequired
};

export default MedicinesComponent;