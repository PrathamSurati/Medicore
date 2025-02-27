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
      <div className="vitals-header">
        <h2>Vitals</h2>
      </div>
      <div className="vitals-row-container">
        {vitals.map((vital) => (
          <div key={vital.id} className="vital-card">
            <div className="vital-content">
              <input
                type="text"
                className="vital-name-input"
                placeholder="Name"
                value={vital.name}
                title={vital.name || "Vital name"}
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
                className="vital-value-input"
                placeholder="Value"
                value={vital.value}
                title={vital.value || "Vital value"}
                onChange={(e) =>
                  setVitals(
                    vitals.map((v) =>
                      v.id === vital.id ? { ...v, value: e.target.value } : v
                    )
                  )
                }
              />
            </div>
            <button 
              className="vital-remove-btn" 
              onClick={() => removeVital(vital.id)}
              title="Remove vital"
            >
              🗑️
            </button>
          </div>
        ))}
        <button className="vital-add-btn" onClick={addVital}>+ Add</button>
      </div>
    </div>
  );
};

VitalsComponent.propTypes = {
  vitals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired,
  setVitals: PropTypes.func.isRequired
};

export default VitalsComponent;