import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Complains from '../../../utils/json/complains.json';
import './Complaints.css';

const ComplaintsComponent = ({ complaints, setComplaints }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredComplaints(Complains.medical_complaints.slice(0, 20));
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
  }, [showSuggestions, inputValue]);

  const handleChange = (event) => {
    const query = event.target.value.toLowerCase();
    setInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = Complains.medical_complaints.filter((complaint) =>
        complaint.toLowerCase().includes(query)
      );
      setFilteredComplaints(filtered.slice(0, 20)); // Limit to 20 for better performance
      setShowSuggestions(true);
    } else {
      setFilteredComplaints(Complains.medical_complaints.slice(0, 20));
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue) {
      setComplaints([...complaints, inputValue]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleSelectComplaint = (complaint) => {
    setComplaints([...complaints, complaint]);
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current.focus();
  };

  const handleFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Use a portal to render suggestions outside of the section
  const renderSuggestions = () => {
    if (!showSuggestions || filteredComplaints.length === 0) return null;

    const suggestionStyle = {
      position: 'absolute',
      top: `${suggestionPosition.top}px`,
      left: `${suggestionPosition.left}px`,
    };

    return createPortal(
      <div className="suggestions-container" style={suggestionStyle}>
        <div className="suggestions-header">
          Complaints Suggestions ({filteredComplaints.length})
        </div>
        <ul className="suggestions">
          {filteredComplaints.map((complaint, index) => (
            <li 
              key={index}
              onClick={() => handleSelectComplaint(complaint)}
            >
              {complaint}
            </li>
          ))}
        </ul>
      </div>,
      document.body
    );
  };

  return (
    <div className="section">
      <h2>Complaints</h2>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type to add complaints..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {renderSuggestions()}
      <div className="tags">
        {complaints.map((c, index) => (
          <span key={index} className="tag">
            {c} <button onClick={() => setComplaints(complaints.filter((_, i) => i !== index))}>x</button>
          </span>
        ))}
      </div>
    </div>
  );
};

ComplaintsComponent.propTypes = {
  complaints: PropTypes.array.isRequired,
  setComplaints: PropTypes.func.isRequired
};

export default ComplaintsComponent;