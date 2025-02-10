import { useState, useEffect } from "react";
import "../styles.css";

const ComplaintInput = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Fetch complaints from JSON
  useEffect(() => {
    fetch("../utils/json/complains.json")
      .then((response) => response.json())
      .then((data) => setComplaints(data.medical_complaints))
      .catch((error) => console.error("Error fetching complaints:", error));
  }, []);

  // Handle input change
  const handleInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = complaints.filter((complaint) =>
        complaint.toLowerCase().includes(query)
      );
      setFilteredComplaints(filtered);
    } else {
      setFilteredComplaints([]);
    }
  };

  // Handle selecting a suggestion
  const handleSelectComplaint = (complaint) => {
    setInputValue(complaint);
    setFilteredComplaints([]); // Hide suggestions
  };

  return (
    <div className="container">
      <h2>Enter Your Complaint</h2>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Start typing..."
      />
      <ul className="suggestions">
        {filteredComplaints.map((complaint, index) => (
          <li key={index} onClick={() => handleSelectComplaint(complaint)}>
            {complaint}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComplaintInput;
