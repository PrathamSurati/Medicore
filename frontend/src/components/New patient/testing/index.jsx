import { useState, useEffect } from "react";

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/patients") // Corrected API URL
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setPatients(data))
      .catch((error) => {
        console.error("Error fetching patients:", error);
        setError(error.message);
      });
  }, []);

  return (
    <div className="patients-container">
      <h2>Patients List</h2>
      {error ? (
        <p className="error-message">Error: {error}</p>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul className="patients-list">
          {patients.map((patient, index) => (
            <li key={patient._id} className="patient-card">
              <h4>
                {index + 1}. {patient.name} ({patient.gender})
              </h4>
              <p>📞 Phone: {patient.phone}</p>
              <p>🎂 Age: {patient.age} | DOB: {new Date(patient.dob).toLocaleDateString()}</p>
              <p>🏡 City: {patient.city}</p>
              <p>📍 Address: {patient.address}, {patient.pin}</p>
              <p>
                <small>🕒 Created At: {new Date(patient.createdAt).toLocaleString()}</small>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientsList;
