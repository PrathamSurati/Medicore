// import { useState } from 'react';
import './Vitals.css'; // Import the CSS file
import PropTypes from 'prop-types';

const VitalsComponent = ({ vitals, setVitals }) => {
  const addVital = () => {
    setVitals([...vitals, { id: Date.now(), name: "", value: "" }]);
  };

  const removeVital = (id) => {
    setVitals(vitals.filter((v) => v.id !== id));
  };

  return (
    <div className="vitals-section">
      <h2>Vitals</h2>
      {vitals.map((vital) => (
        <div key={vital.id} className="vital-item">
          <input
            type="text"
            placeholder={vital.name || "New vital name"}
            value={vital.name}
            onChange={(e) =>
              setVitals(
                vitals.map((v) =>
                  v.id === vital.id ? { ...v, name: e.target.value } : v
                )
              )
            }
          />
          <input
            type="text"
            placeholder="Value"
            value={vital.value}
            onChange={(e) =>
              setVitals(
                vitals.map((v) =>
                  v.id === vital.id ? { ...v, value: e.target.value } : v
                )
              )
            }
          />
          <button onClick={() => removeVital(vital.id)}>🗑️</button>
        </div>
      ))}
      <button onClick={addVital}>+ Add Vital</button>
    </div>
  );
};

VitalsComponent.propTypes = {
  vitals: PropTypes.string.isRequired,
  setVitals: PropTypes.func.isRequired
};


export default VitalsComponent;