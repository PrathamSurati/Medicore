import { useState } from "react";
import axios from 'axios';
import "./ReportGenerator.css";
import VitalsComponent from './Vitals/Vitals';
import ComplaintsComponent from './Complaints/Complains';
import DiagnosisComponent from './Diagnosis/Diagnosis';
import MedicinesComponent from './Medicines/Medicines';
import NextVisitComponent from './NextVisit/NextVisit';
import TitleComponent from './Title/Title';

const ReportGenerator = () => {
  const [vitals, setVitals] = useState([
    { id: 1, name: "BP", value: "" },
    { id: 2, name: "Pulse", value: "" },
    { id: 3, name: "Temperature", value: "" },
    { id: 4, name: "SpO2", value: "" },
    { id: 5, name: "Height", value: "" },
  ]);

  const [diagnosis, setDiagnosis] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [date, setDate] = useState(""); 
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    const prescriptionData = {
      vitals,
      complaints,
      diagnosis,
      medicines,
      nextVisit: date,
      title,
    };

    try {
      const response = await axios.post('http://localhost:8081/prescriptions', prescriptionData);
      console.log('Prescription saved successfully:', response.data.message);
      
      // Reset all form fields after successful save
      setVitals([
        { id: 1, name: "BP", value: "" },
        { id: 2, name: "Pulse", value: "" },
        { id: 3, name: "Temperature", value: "" },
        { id: 4, name: "SpO2", value: "" },
        { id: 5, name: "Height", value: "" },
      ]);
      setComplaints([]);
      setDiagnosis([]);
      setMedicines([]);
      setDate("");
      setTitle("");
      
      // Show success message to user
      alert('Prescription saved successfully!');
      
    } catch (error) {
      console.error('Error saving prescription:', error.response ? error.response.data : error.message);
      // Show error message to user
      alert('Error saving prescription. Please try again.');
    }
  };

  return (
    <div className="report-container">
      <h1>New Prescription</h1>
      
      <div className="report-content">
        <TitleComponent 
          title={title} 
          setTitle={setTitle} 
        />
        
        <VitalsComponent 
          vitals={vitals} 
          setVitals={setVitals} 
        />
        
        <ComplaintsComponent 
          complaints={complaints} 
          setComplaints={setComplaints} 
        />
        
        <DiagnosisComponent 
          diagnosis={diagnosis} 
          setDiagnosis={setDiagnosis} 
        />
        
        <MedicinesComponent 
          medicines={medicines} 
          setMedicines={setMedicines} 
        />
        
        <NextVisitComponent 
          date={date} 
          setDate={setDate} 
        />
      </div>
      
      <button className="save-button" onClick={handleSubmit}>
        Save Prescription
      </button>
    </div>
  );
};

export default ReportGenerator;
