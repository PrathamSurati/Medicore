import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/patients/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const handleSavePrescription = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/patients/${id}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prescription }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prescription');
      }

      // Optionally, you can fetch the updated prescriptions or handle success
      setPrescription('');
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{patient.name}</h1>
      <h2>Prescriptions</h2>
      <ul>
        {patient.prescriptions.map((prescription) => (
          <li key={prescription._id}>{prescription.title}</li>
        ))}
      </ul>
      <input
        type="text"
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
        placeholder="New Prescription"
      />
      <button onClick={handleSavePrescription}>Save Prescription</button>
    </div>
  );
};

export default PatientDetails;
