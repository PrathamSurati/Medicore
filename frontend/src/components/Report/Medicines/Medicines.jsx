import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MedicineData from '../../../utils/json/medicine.json'; // Import JSON
import './Medicines.css';

const MedicinesComponent = ({ medicines, setMedicines }) => {
  const [sampleMedicines, setSampleMedicines] = useState({});

  useEffect(() => {
    const medicines = {};
    MedicineData.medicine.forEach(med => {
      const key = Object.keys(med)[0];
      medicines[key] = med[key];
    });
    setSampleMedicines(medicines);
  }, []);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dose: "", when: "", frequency: "", duration: "", Qty: "", Note: "" },
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
          return { ...updatedMedicine, ...sampleMedicines[value] };
        }
        return updatedMedicine;
      }
      return m;
    });
    setMedicines(updatedMedicines);
  };

  return (
    <div className="section">
      <h2>Medicines</h2>
      {medicines.map((medicine, index) => (
        <div key={index} className="medicine-item">
          <input
            type="text"
            placeholder="Medicine"
            value={medicine.name}
            onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
          />
          <input
            type="text"
            placeholder="Dose"
            value={medicine.dose}
            onChange={(e) => handleMedicineChange(index, "dose", e.target.value)}
          />
          <input
            type="text"
            placeholder="When"
            value={medicine.when}
            onChange={(e) => handleMedicineChange(index, "when", e.target.value)}
          />
          <input
            type="text"
            placeholder="Frequency"
            value={medicine.frequency}
            onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
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
          <button onClick={() => removeMedicine(index)}>🗑️</button>
        </div>
      ))}
      <button onClick={addMedicine}>+ Add Medicine</button>
    </div>
  );
};
MedicinesComponent.propTypes = {
  medicines: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    dose: PropTypes.string,
    when: PropTypes.string,
    frequency: PropTypes.string,
    duration: PropTypes.string,
    Qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    Note: PropTypes.string
  })).isRequired,
  setMedicines: PropTypes.func.isRequired
};

export default MedicinesComponent;