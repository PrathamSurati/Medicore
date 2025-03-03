import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PatientDetails.css'; // Create this file for styling
import axios from 'axios';

// Import report components
import Complaints from './Report/Complaints/Complains';
import Diagnosis from './Report/Diagnosis/Diagnosis';
import Medicines from './Report/Medicines/Medicines';
import NextVisit from './Report/NextVisit/NextVisit';
import Vitals from './Report/Vitals/Vitals';

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report state with all properties initialized with correct types
  const [reportData, setReportData] = useState({
    title: '',
    complaints: [], // Changed to array from string
    diagnosis: [], // Changed to array in case it's needed
    medicines: [], // Already an array
    nextVisit: '',
    vitals: [] // Already fixed
  });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    console.log('Fetching patient with ID:', patientId);
    
    axios.get(`http://localhost:8081/api/patients/${patientId}`)
      .then(response => {
        console.log('Patient data received:', response.data);
        setPatient(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching patient:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [patientId]);

  const handleSaveReport = async () => {
    setSaveStatus('Saving...');
    
    try {
      const reportDataToSave = {
        ...reportData,
        patientId,
        patientName: patient.name,
        date: new Date()
      };
      
      // Save report using your existing API
      const response = await axios.post('http://localhost:8081/prescriptions', reportDataToSave);
      console.log('Report saved:', response.data);
      setSaveStatus('Report saved successfully!');
      
      // Reset report data with correct types
      setReportData({
        title: '',
        complaints: [], // Reset as empty array
        diagnosis: [], // Reset as empty array
        medicines: [], // Reset as empty array
        nextVisit: '',
        vitals: [] // Reset as empty array
      });
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving report:', error);
      setSaveStatus(`Error: ${error.message}`);
    }
  };

  // Handlers for updating report data
  const handleComplaintsChange = (complaints) => {
    setReportData(prev => ({ ...prev, complaints }));
  };

  const handleDiagnosisChange = (diagnosis) => {
    setReportData(prev => ({ ...prev, diagnosis }));
  };

  const handleMedicinesChange = (medicines) => {
    setReportData(prev => ({ ...prev, medicines }));
  };

  const handleNextVisitChange = (nextVisit) => {
    setReportData(prev => ({ ...prev, nextVisit }));
  };

  const handleVitalsChange = (vitals) => {
    setReportData(prev => ({ ...prev, vitals }));
  };

  if (loading) return <div className="patient-loading">Loading patient data...</div>;
  if (error) return <div className="patient-error">Error: {error}</div>;
  if (!patient) return <div className="patient-not-found">Patient not found</div>;

  return (
    <div className="patient-details-wrapper">
      {/* Patient Info Navbar */}
      <div className="patient-info-navbar">
        <div className="patient-info-container">
          <div className="patient-avatar">
            {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="patient-basic-info">
            <h2>{patient.name}</h2>
            <div className="patient-tags">
              {patient.age && <span className="patient-info-tag">Age: {patient.age}</span>}
              {patient.gender && <span className="patient-info-tag">{patient.gender}</span>}
              {patient.bloodGroup && <span className="patient-info-tag">Blood Group: {patient.bloodGroup}</span>}
            </div>
          </div>
        </div>
        <div className="patient-actions">
          <button className="action-button edit-button">Edit</button>
          <button className="action-button print-button">Print</button>
        </div>
      </div>
      
      {/* Patient Report Section */}
      <div className="patient-report-section">
        <h3 className="report-section-title">Create Report</h3>
        
        {/* Report components */}
        <div className="report-components">
          {/* Title is excluded as we'll use patient name instead */}
          
          <div className="report-component-section">
            <h4>Vitals</h4>
            <Vitals 
              vitals={reportData.vitals} 
              onChange={handleVitalsChange} 
            />
          </div>
          
          <div className="report-component-section">
            <h4>Complaints</h4>
            <Complaints 
              complaints={reportData.complaints} 
              onChange={handleComplaintsChange} 
            />
          </div>
          
          <div className="report-component-section">
            <h4>Diagnosis</h4>
            <Diagnosis 
              diagnosis={reportData.diagnosis} 
              onChange={handleDiagnosisChange} 
            />
          </div>
          
          <div className="report-component-section">
            <h4>Medicines</h4>
            <Medicines 
              medicines={reportData.medicines} 
              onChange={handleMedicinesChange} 
            />
          </div>
          
          <div className="report-component-section">
            <h4>Next Visit</h4>
            <NextVisit 
              nextVisit={reportData.nextVisit} 
              onChange={handleNextVisitChange} 
            />
          </div>
        </div>
        
        <div className="report-actions">
          <button 
            className="save-report-btn" 
            onClick={handleSaveReport}
          >
            Save Report
          </button>
          {saveStatus && <span className="save-status">{saveStatus}</span>}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails; 