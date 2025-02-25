import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Complains from '../../../utils/json/complains.json'; // Ensure this path is correct
import './Complaints.css';

const ComplaintsComponent = ({ complaints, setComplaints }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  useEffect(() => {
    setFilteredComplaints(Complains.medical_complaints);
  }, []);

  const handleChange = (event) => {
    const query = event.target.value.toLowerCase();
    setInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = Complains.medical_complaints.filter((complaint) =>
        complaint.toLowerCase().includes(query)
      );
      setFilteredComplaints(filtered);
    } else {
      setFilteredComplaints(Complains.medical_complaints);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue) {
      setComplaints([...complaints, inputValue]);
      setInputValue("");
    }
  };

  return (
    <div className="section">
      <h2>Complaints</h2>
      <input
        type="text"
        placeholder="Type to add complaints..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {inputValue && (
        <ul className="suggestions">
          {filteredComplaints.map((complaint, index) => (
            <li 
              key={index}
              onClick={() => {
                setComplaints([...complaints, complaint]);
                setInputValue("");
              }}
            >
              {complaint}
            </li>
          ))}
        </ul>
      )}
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