import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import DiagnosisData from '../../../utils/json/DiagnosisValue.json';
import './Diagnosis.css';

const DiagnosisComponent = ({ diagnosis, setDiagnosis }) => {
  const [diagnosisInputValue, setDiagnosisInputValue] = useState("");
  const [filteredDiagnosis, setFilteredDiagnosis] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredDiagnosis(DiagnosisData.DiagnosisValue.slice(0, 20));
  }, []);

  // Update suggestion position when input changes or when showing suggestions
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setSuggestionPosition({
        top: rect.bottom + window.scrollY + 5, // 5px below the input
        left: rect.left + window.scrollX,
      });
    }
  }, [showSuggestions, diagnosisInputValue]);

  const handleDiagnosisChange = (event) => {
    const query = event.target.value.toLowerCase();
    setDiagnosisInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = DiagnosisData.DiagnosisValue.filter((diag) =>
        diag.toLowerCase().includes(query)
      );
      setFilteredDiagnosis(filtered.slice(0, 20)); // Limit to 20 for better performance
      setShowSuggestions(true);
    } else {
      setFilteredDiagnosis(DiagnosisData.DiagnosisValue.slice(0, 20));
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && diagnosisInputValue) {
      setDiagnosis([...diagnosis, diagnosisInputValue]);
      setDiagnosisInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleSelectDiagnosis = (diag) => {
    setDiagnosis([...diagnosis, diag]);
    setDiagnosisInputValue("");
    setShowSuggestions(false);
    inputRef.current.focus();
  };

  const handleFocus = () => {
    if (diagnosisInputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Use a portal to render suggestions outside of the section
  const renderSuggestions = () => {
    if (!showSuggestions || filteredDiagnosis.length === 0) return null;

    const suggestionStyle = {
      position: 'absolute',
      top: `${suggestionPosition.top}px`,
      left: `${suggestionPosition.left}px`,
    };

    return createPortal(
      <div className="diagnosis-suggestions-container" style={suggestionStyle}>
        <div className="diagnosis-suggestions-header">
          Diagnosis Suggestions ({filteredDiagnosis.length})
        </div>
        <div className="diagnosis-suggestions">
          {filteredDiagnosis.map((suggestion, index) => (
            <div 
              key={index} 
              className="suggestion-item"
              onClick={() => handleSelectDiagnosis(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="section">
      <h2>Diagnosis</h2>
      <div className="diagnosis-input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type to add diagnosis..."
          value={diagnosisInputValue}
          onChange={handleDiagnosisChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {renderSuggestions()}
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