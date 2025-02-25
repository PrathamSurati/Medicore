import  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DiagnosisData from '../../../utils/json/DiagnosisValue.json'; // Import JSON
import './Diagnosis.css';

const DiagnosisComponent = ({ diagnosis, setDiagnosis }) => {
  const [diagnosisInputValue, setDiagnosisInputValue] = useState("");
  const [filteredDiagnosis, setFilteredDiagnosis] = useState([]);

  useEffect(() => {
    setFilteredDiagnosis(DiagnosisData.DiagnosisValue);
  }, []);

  const handleDiagnosisChange = (event) => {
    const query = event.target.value.toLowerCase();
    setDiagnosisInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = DiagnosisData.DiagnosisValue.filter((diag) =>
        diag.toLowerCase().includes(query)
      );
      setFilteredDiagnosis(filtered);
    } else {
      setFilteredDiagnosis(DiagnosisData.DiagnosisValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && diagnosisInputValue) {
      setDiagnosis([...diagnosis, diagnosisInputValue]);
      setDiagnosisInputValue("");
    }
  };

  return (
    <div className="section">
      <h2>Diagnosis</h2>
      <div className="diagnosis-input-container">
        <input
          type="text"
          placeholder="Type to add diagnosis..."
          value={diagnosisInputValue}
          onChange={handleDiagnosisChange}
          onKeyDown={handleKeyDown}
        />
        {diagnosisInputValue && (
          <div className="diagnosis-suggestions">
            {filteredDiagnosis.slice(0, 5).map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => {
                  setDiagnosis([...diagnosis, suggestion]);
                  setDiagnosisInputValue("");
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="tags">
        {diagnosis.map((d, index) => (
          <span key={index} className="tag">
            {d} <button onClick={() => setDiagnosis(diagnosis.filter((_, i) => i !== index))}>x</button>
          </span>
        ))}
      </div>
    </div>
  );
};
DiagnosisComponent.propTypes = {
  diagnosis: PropTypes.array.isRequired,
  setDiagnosis: PropTypes.func.isRequired
};

export default DiagnosisComponent;