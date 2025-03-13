import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "./PatientDetails.css"; // Create this file for styling
import axios from "axios";

// Import MUI Timeline components
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';

// Import report components
import ComplaintsComponent from "../Report/Complaints/Complains";
import DiagnosisComponent from "../Report/Diagnosis/Diagnosis";
import MedicinesComponent from "../Report/Medicines/Medicines";
import NextVisitComponent from "../Report/NextVisit/NextVisit";
import VitalsComponent from "../Report/Vitals/Vitals";
// import TitleComponent from './Report/Title/Title';

// Default initial values for form fields
const defaultVitals = [
  { id: 1, name: "BP", value: "" },
  { id: 2, name: "Pulse", value: "" },
  { id: 3, name: "Temperature", value: "" },
  { id: 4, name: "SpO2", value: "" },
  { id: 5, name: "Height", value: "" },
];

const PatientDetails = () => {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('readOnly') === 'true';
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState(null);
  const [appointment, setAppointment] = useState(null);

  const [vitals, setVitals] = useState(defaultVitals);
  const [diagnosis, setDiagnosis] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");

  const dropdownRef = useRef(null); // Add this ref to target the dropdown element

  // Function to reset all form fields
  const resetFormFields = () => {
    setVitals([...defaultVitals]); // Create a fresh copy of defaultVitals
    setDiagnosis([]);
    setMedicines([]);
    setComplaints([]);
    setDate("");
    setTitle("");
  };

  useEffect(() => {
    // Reset all form fields when switching patients
    resetFormFields();

    // Clear selected record when switching patients
    setSelectedRecord(null);
    
    // Reset loading and error states
    setRecordLoading(false);
    setRecordError(null);

    // Set loading to true when switching patients
    setLoading(true);

    // Fetch patient data
    axios
      .get(`http://localhost:8081/api/patients/${patientId}`)
      .then((response) => {
        setPatient(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });

    // Fetch templates
    axios
      .get(`http://localhost:8081/api/prescriptions`)
      .then((response) => {
        console.log("Fetched templates:", response.data);
        setTemplates(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch templates:", error);
      });
      
    // Fetch patient history
    axios
      .get(`http://localhost:8081/api/patients/${patientId}/history`)
      .then((response) => {
        console.log("Fetched patient history:", response.data);
        setPatientHistory(response.data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch patient history:", error);
      });

    // Fetch today's appointment for this patient
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    axios
      .get(`http://localhost:8081/api/appointments/patient/${patientId}`)
      .then((response) => {
        // Find appointment scheduled for today
        const todayAppointment = response.data.find(appt => {
          const apptDate = new Date(appt.startTime);
          return apptDate >= today && apptDate < tomorrow;
        });
        
        if (todayAppointment) {
          setAppointment(todayAppointment);
          console.log('Appointment status:', todayAppointment.visitStatus);
        }
      })
      .catch((error) => {
        console.error('Error fetching appointments:', error);
      });
  }, [patientId]); // This effect runs when patientId changes

  // Add an effect for handling outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Add this to prevent event propagation issues with scrolling
  useEffect(() => {
    const handleScroll = (event) => {
      // Prevent scroll events on PatientDetails from affecting other components
      event.stopPropagation();
    };

    // Only apply this if needed - remove if it causes issues
    const patientDetailsWrapper = document.querySelector(
      ".patient-details-wrapper"
    );
    if (patientDetailsWrapper) {
      patientDetailsWrapper.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (patientDetailsWrapper) {
        patientDetailsWrapper.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleSaveReport = async () => {
    // Create a template name if none provided
    const templateTitle =
      title.trim() || `Template ${new Date().toLocaleDateString()}`;

    const reportData = {
      vitals,
      complaints,
      diagnosis,
      medicines,
      nextVisit: date,
      title: templateTitle,
      patientId,
      patientName: patient.name,
      date: new Date(),
    };

    // Check if any fields are filled before saving
    const isEmpty = !vitals.some(v => v.value) && !complaints.length && !diagnosis.length && !medicines.length && !date && !title.trim();
    if (isEmpty) {
      alert("Cannot save empty report.");
      return;
    }

    try {
      // Step 1: Save the report
      const response = await axios.post(
        `http://localhost:8081/api/patients/${patientId}/details`,
        reportData
      );
      console.log('Report saved successfully:', response.data);
      
      // Step 2: Find today's appointment for this patient and update visit status
      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Fetch appointments for this patient
        const appointmentsResponse = await axios.get(
          `http://localhost:8081/api/appointments/patient/${patientId}`
        );
        
        // Find appointment scheduled for today
        const todayAppointment = appointmentsResponse.data.find(appointment => {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate >= today && appointmentDate < tomorrow;
        });
        
        // If there's an appointment for today, update its visit status
        if (todayAppointment) {
          const updatedAppointment = await axios.patch(
            `http://localhost:8081/api/appointments/${todayAppointment._id}`,
            { 
              visitStatus: 'visited',
              status: 'Completed'
            }
          );
          console.log('Appointment visit status updated to visited');
          
          // Update the appointment in local state to reflect changes immediately
          setAppointment(updatedAppointment.data);
        }
      } catch (appointmentError) {
        console.error('Error updating appointment visit status:', appointmentError);
      }

      // Step 3: Refresh patient history to show the new record
      try {
        const historyResponse = await axios.get(
          `http://localhost:8081/api/patients/${patientId}/history`
        );
        setPatientHistory(historyResponse.data || []);
      } catch (historyError) {
        console.error('Error refreshing patient history:', historyError);
      }
      
      // Step 4: Refresh patient data to reflect any status changes
      try {
        const patientResponse = await axios.get(
          `http://localhost:8081/api/patients/${patientId}`
        );
        setPatient(patientResponse.data);
      } catch (patientError) {
        console.error('Error refreshing patient data:', patientError);
      }

      // Reset form fields
      resetFormFields();
      
      alert("Report saved successfully!");

      // Dispatch custom event to notify sidebar about the saved report
      const reportSavedEvent = new CustomEvent('reportSaved', {
        detail: {
          patientId: patientId,
          date: new Date().toISOString()
        }
      });
      window.dispatchEvent(reportSavedEvent);

      // Refresh templates list
      axios.get(`http://localhost:8081/api/prescriptions`).then((response) => {
        setTemplates(response.data || []);
      });
      
    } catch (error) {
      console.error('Error saving report:', error);
      alert("Error saving report. Please try again.");
    }
  };

  const loadTemplate = (templateId) => {
    axios
      .get(`http://localhost:8081/prescriptions/${templateId}`)
      .then((response) => {
        const template = response.data;
        console.log("Loading complete template:", template);

        setTitle(template.title || "");

        if (template.vitals && template.vitals.length > 0) {
          const mappedVitals = template.vitals.map((vital, index) => ({
            id: index + 1,
            name: vital.name || "",
            value: vital.value || "",
          }));

          if (mappedVitals.length < vitals.length) {
            const mergedVitals = [...defaultVitals]; // Use defaultVitals as base
            mappedVitals.forEach((vital, index) => {
              mergedVitals[index] = vital;
            });
            setVitals(mergedVitals);
          } else {
            setVitals(mappedVitals);
          }
        }

        setComplaints(template.complaints || []);
        setDiagnosis(template.diagnosis || []);
        setMedicines(template.medicines || []);

        if (template.nextVisit) {
          const nextVisitDate = new Date(template.nextVisit);
          const formattedDate = nextVisitDate.toISOString().split("T")[0];
          setDate(formattedDate);
        } else {
          setDate("");
        }

        setDropdownOpen(false);
      })
      .catch((error) => {
        alert("Error loading the selected template.");
        console.error("Template loading error:", error);
      });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const savePatientDetailsToDatabase = async (patientData) => {
    try {
      const response = await axios.post(
        `http://localhost:8081/api/patients/${patientId}/details`,
        patientData
      );
      console.log('Patient details saved successfully:', response.data);
    } catch (error) {
      console.error('Error saving patient details:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Enhanced function to handle timeline dot click - fetch complete record data
  const handleTimelineDotClick = async (record, event) => {
    // Prevent default browser behavior and event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // If clicking the same record, close it
    if (selectedRecord && selectedRecord._id === record._id) {
      setSelectedRecord(null);
      return;
    }
    
    // Show loading while fetching record details
    setRecordLoading(true);
    setRecordError(null);
    
    try {
      // Fetch the complete record data for the same patient (ensure patientId is included in URL)
      const response = await axios.get(
        `http://localhost:8081/api/patients/${patientId}/records/${record._id}`
      );
      console.log("Fetched detailed record:", response.data);
      
      // Make sure the record belongs to the current patient
      if (response.data.patientId === patientId) {
        setSelectedRecord(response.data);
      } else {
        throw new Error("Record does not belong to current patient");
      }
    } catch (error) {
      console.error("Error fetching record details:", error);
      setRecordError("Failed to load record details. Please try again.");
      // Use the basic record data from timeline as fallback
      setSelectedRecord(record);
    } finally {
      setRecordLoading(false);
    }
  };

  // Add this function to handle printing
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get current date in readable format
    const currentDate = new Date().toLocaleDateString();
    
    // Determine what data to use: selected record or current form data
    const reportData = selectedRecord ? {
      vitals: selectedRecord.vitals,
      complaints: selectedRecord.complaints,
      diagnosis: selectedRecord.diagnosis,
      medicines: selectedRecord.medicines,
      nextVisit: selectedRecord.nextVisit,
      date: selectedRecord.date || currentDate
    } : {
      vitals,
      complaints,
      diagnosis,
      medicines,
      nextVisit: date,
      date: currentDate
    };
    
    // Format the report date for display
    const reportDateDisplay = selectedRecord ? 
      new Date(selectedRecord.date).toLocaleDateString() : 
      currentDate;
    
    // Prepare HTML content for printing
    let printContent = `
      <html>
        <head>
          <title>Medical Report - ${patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .patient-info { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .medicine-item { margin-bottom: 8px; }
            .footer { margin-top: 50px; text-align: right; }
            table { width: 100%; border-collapse: collapse; }
            table td { padding: 5px; }
            .vital-name { font-weight: bold; margin-right: 5px; }
            .report-title { text-align: center; font-size: 24px; margin-bottom: 20px; }
            .report-date { text-align: right; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="report-title">Medical Report</div>
          <div class="report-date">Date: ${reportDateDisplay}</div>
          
          <div class="patient-info">
            <h2>${patient.name}</h2>
            <div>
              ${patient.age ? `Age: ${patient.age}` : ''}
              ${patient.gender ? ` | Gender: ${patient.gender}` : ''}
              ${patient.bloodGroup ? ` | Blood Group: ${patient.bloodGroup}` : ''}
            </div>
          </div>
    `;
    
    // Add vitals section if there are any values
    if (reportData.vitals && reportData.vitals.some(v => v.value)) {
      printContent += `
        <div class="section">
          <div class="section-title">Vitals:</div>
          <table>
      `;
      
      reportData.vitals.forEach(vital => {
        if (vital.value) {
          printContent += `
            <tr>
              <td width="30%"><span class="vital-name">${vital.name}:</span></td>
              <td>${vital.value}</td>
            </tr>
          `;
        }
      });
      
      printContent += `
          </table>
        </div>
      `;
    }
    
    // Add complaints section if there are any
    if (reportData.complaints && reportData.complaints.length > 0) {
      printContent += `
        <div class="section">
          <div class="section-title">Complaints:</div>
          <ul>
      `;
      
      reportData.complaints.forEach(complaint => {
        printContent += `<li>${complaint}</li>`;
      });
      
      printContent += `
          </ul>
        </div>
      `;
    }
    
    // Add diagnosis section if there are any
    if (reportData.diagnosis && reportData.diagnosis.length > 0) {
      printContent += `
        <div class="section">
          <div class="section-title">Diagnosis:</div>
          <ul>
      `;
      
      reportData.diagnosis.forEach(item => {
        printContent += `<li>${item}</li>`;
      });
      
      printContent += `
          </ul>
        </div>
      `;
    }
    
    // Add medicines section if there are any
    if (reportData.medicines && reportData.medicines.length > 0) {
      printContent += `
        <div class="section">
          <div class="section-title">Medications:</div>
          <ul>
      `;
      
      reportData.medicines.forEach(medicine => {
        printContent += `
          <li class="medicine-item">
            <strong>${medicine.name || 'Unnamed medicine'}</strong>
            ${medicine.when ? ` - ${medicine.when}` : ''}
            ${medicine.duration ? ` - for ${medicine.duration}` : ''}
            ${medicine.Qty ? ` - Qty: ${medicine.Qty}` : ''}
            ${medicine.Note ? `<br>Note: ${medicine.Note}` : ''}
          </li>
        `;
      });
      
      printContent += `
          </ul>
        </div>
      `;
    }
    
    // Add next visit date if available
    if (reportData.nextVisit) {
      const visitDate = new Date(reportData.nextVisit).toLocaleDateString();
      printContent += `
        <div class="section">
          <div class="section-title">Next Visit:</div>
          <p>${visitDate}</p>
        </div>
      `;
    }
    
    // Add footer
    printContent += `
          <div class="footer">
            <p>Doctor's Signature: ____________________</p>
          </div>
        </body>
      </html>
    `;
    
    // Write content to the new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.print();
      // Uncomment below if you want the print window to close after printing
      // printWindow.onafterprint = function() { printWindow.close(); };
    };
  };

  if (loading) return <div className="patient-loading">Loading...</div>;
  if (error) return <div className="patient-error">Error: {error}</div>;

  return (
    <div className="patient-details-wrapper">
      {/* Patient Info Navbar */}
      <div className="patient-info-navbar">
        <div className="patient-info-container">
          <div className="patient-basic-info">
            <h2>{patient.name}</h2>
            <div className="patient-tags">
              {patient.age && (
                <span className="patient-info-tag">Age: {patient.age}</span>
              )}
              {patient.gender && (
                <span className="patient-info-tag">{patient.gender}</span>
              )}
              {patient.bloodGroup && (
                <span className="patient-info-tag">
                  Blood Group: {patient.bloodGroup}
                </span>
              )}
              {appointment && (
                <span className={`patient-info-tag visit-status ${appointment.visitStatus}`}>
                  {appointment.visitStatus === 'visited' ? 'Visited' : 'Not Visited'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="patient-actions">
          {/* Only show templates dropdown if not in read-only mode */}
          {!isReadOnly && (
            <div className="template-dropdown" ref={dropdownRef}>
              <button
                className="template-dropdown-button"
                onClick={toggleDropdown}
              >
                Saved Templates
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                className={`template-dropdown-content ${
                  dropdownOpen ? "show" : ""
                }`}
              >
                <div className="dropdown-header">Saved Templates</div>
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <div
                      key={template._id}
                      className="template-item"
                      onClick={() => loadTemplate(template._id)}
                    >
                      {template.title || "Untitled Template"}
                    </div>
                  ))
                ) : (
                  <div className="template-item">No saved templates</div>
                )}
              </div>
            </div>
          )}
          <button className="action-button print-button" onClick={handlePrint}>Print</button>
        </div>
      </div>

      {/* Main content area with timeline and report components side by side */}
      <div className="patient-content-container">
        {/* Patient History Timeline - Always visible on the left */}
        <div className="patient-timeline-container">
          <h3>Patient History</h3>
          <Timeline
            sx={{
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.2,
              },
            }}
          >
            {patientHistory.length > 0 ? (
              patientHistory.map((record) => (
                <TimelineItem key={record._id}>
                  <TimelineOppositeContent color="textSecondary">
                    {formatDate(record.date)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot 
                      onClick={(e) => handleTimelineDotClick(record, e)}
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedRecord && selectedRecord._id === record._id ? '#4a90e2' : undefined,
                        '&:hover': { backgroundColor: '#4a90e2' }
                      }}
                    />
                    {/* Don't add connector to last item */}
                    {patientHistory.indexOf(record) < patientHistory.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <div 
                      className={`timeline-content ${selectedRecord && selectedRecord._id === record._id ? 'selected' : ''}`}
                      onClick={(e) => handleTimelineDotClick(record, e)}
                    >
                      <h4>{record.title || 'Patient Visit'}</h4>
                      {record.diagnosis && record.diagnosis.length > 0 && (
                        <p><strong>Diagnosis:</strong> {record.diagnosis.join(', ')}</p>
                      )}
                      {record.medicines && record.medicines.length > 0 && (
                        <p><strong>Medications:</strong> {record.medicines.length} prescribed</p>
                      )}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))
            ) : (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot />
                </TimelineSeparator>
                <TimelineContent>No previous visits recorded</TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
        </div>

        {/* Report Components container - on the right */}
        <div className="report-container">
          {isReadOnly ? (
            <div className="read-only-notice">
              <p>This is a past appointment record. It cannot be edited.</p>
              
              {/* Show selected record if available, otherwise show a message */}
              {selectedRecord ? (
                <div className="selected-record-container">
                  <div className="selected-record-header">
                    <h3>{selectedRecord.title || 'Patient Visit'}</h3>
                    <span className="record-date">{formatDate(selectedRecord.date)}</span>
                    <button className="close-record-btn" onClick={() => setSelectedRecord(null)}>
                      &times;
                    </button>
                  </div>
                  <div className="selected-record-content">
                    {/* Vitals Section */}
                    {selectedRecord.vitals && selectedRecord.vitals.length > 0 && selectedRecord.vitals.some(v => v.value) && (
                      <div className="record-section">
                        <h4>Vitals</h4>
                        <ul className="vitals-list">
                          {selectedRecord.vitals.map((vital, index) => (
                            vital.value && (
                              <li key={index}>
                                <span className="vital-name">{vital.name}:</span> {vital.value}
                              </li>
                            )
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Complaints Section */}
                    {selectedRecord.complaints && selectedRecord.complaints.length > 0 && (
                      <div className="record-section">
                        <h4>Complaints</h4>
                        <ul className="complaints-list">
                          {selectedRecord.complaints.map((complaint, index) => (
                            <li key={index}>{complaint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Diagnosis Section */}
                    {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                      <div className="record-section">
                        <h4>Diagnosis</h4>
                        <ul className="diagnosis-list">
                          {selectedRecord.diagnosis.map((diagnosis, index) => (
                            <li key={index}>{diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Medicines Section */}
                    {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
                      <div className="record-section">
                        <h4>Medications</h4>
                        <ul className="medicines-list">
                          {selectedRecord.medicines.map((medicine, index) => (
                            <li key={index}>
                              <div className="medicine-name">{medicine.name}</div>
                              <div className="medicine-details">
                                {medicine.dosage && <span className="medicine-dosage">{medicine.dosage}</span>}
                                {medicine.frequency && <span className="medicine-frequency">{medicine.frequency}</span>}
                                {medicine.duration && <span className="medicine-duration">for {medicine.duration}</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Next Visit Section */}
                    {selectedRecord.nextVisit && (
                      <div className="record-section">
                        <h4>Next Visit</h4>
                        <p>{new Date(selectedRecord.nextVisit).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-selected-record">
                  <p>Click on a timeline item to view the details of that visit.</p>
                </div>
              )}
            </div>
          ) : (
            // Original form rendering for editable mode
            <>
              {recordLoading ? (
                <div className="record-loading">
                  <p>Loading record data...</p>
                </div>
              ) : recordError ? (
                <div className="record-error">
                  <p>{recordError}</p>
                  <button 
                    className="retry-btn" 
                    onClick={() => handleTimelineDotClick(selectedRecord)}
                  >
                    Retry
                  </button>
                </div>
              ) : selectedRecord ? (
                <div className="selected-record-container">
                  <div className="selected-record-header">
                    <h3>{selectedRecord.title || 'Patient Visit'}</h3>
                    <span className="record-date">{formatDate(selectedRecord.date)}</span>
                    <button className="close-record-btn" onClick={() => setSelectedRecord(null)}>
                      &times;
                    </button>
                  </div>
                  <div className="selected-record-content">
                    {/* Vitals Section */}
                    {selectedRecord.vitals && selectedRecord.vitals.length > 0 && selectedRecord.vitals.some(v => v.value) && (
                      <div className="record-section">
                        <h4>Vitals</h4>
                        <ul className="vitals-list">
                          {selectedRecord.vitals.map((vital, index) => (
                            vital.value && (
                              <li key={index}>
                                <span className="vital-name">{vital.name}:</span> {vital.value}
                              </li>
                            )
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Complaints Section */}
                    {selectedRecord.complaints && selectedRecord.complaints.length > 0 && (
                      <div className="record-section">
                        <h4>Complaints</h4>
                        <ul className="complaints-list">
                          {selectedRecord.complaints.map((complaint, index) => (
                            <li key={index}>{complaint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Diagnosis Section */}
                    {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                      <div className="record-section">
                        <h4>Diagnosis</h4>
                        <ul className="diagnosis-list">
                          {selectedRecord.diagnosis.map((diagnosis, index) => (
                            <li key={index}>{diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Medicines Section */}
                    {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
                      <div className="record-section">
                        <h4>Medications</h4>
                        <ul className="medicines-list">
                          {selectedRecord.medicines.map((medicine, index) => (
                            <li key={index}>
                              <div className="medicine-name">{medicine.name}</div>
                              <div className="medicine-details">
                                {medicine.dosage && <span className="medicine-dosage">{medicine.dosage}</span>}
                                {medicine.frequency && <span className="medicine-frequency">{medicine.frequency}</span>}
                                {medicine.duration && <span className="medicine-duration">for {medicine.duration}</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Next Visit Section */}
                    {selectedRecord.nextVisit && (
                      <div className="record-section">
                        <h4>Next Visit</h4>
                        <p>{new Date(selectedRecord.nextVisit).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="selected-record-actions">
                    <button className="load-record-btn" onClick={() => {
                      // Load the selected record data into the form
                      setVitals(selectedRecord.vitals && selectedRecord.vitals.length > 0 
                        ? selectedRecord.vitals 
                        : [...defaultVitals]);
                      setComplaints(selectedRecord.complaints || []);
                      setDiagnosis(selectedRecord.diagnosis || []);
                      setMedicines(selectedRecord.medicines || []);
                      setDate(selectedRecord.nextVisit || '');
                      setTitle(selectedRecord.title || '');
                      setSelectedRecord(null); // Close the record view
                    }}>
                      Use as Template
                    </button>
                  </div>
                </div>
              ) : (
                // Show the form if no record is selected
                <div className="report-component">
                  <VitalsComponent vitals={vitals} setVitals={setVitals} />
                  <ComplaintsComponent complaints={complaints} setComplaints={setComplaints} />
                  <DiagnosisComponent diagnosis={diagnosis} setDiagnosis={setDiagnosis} />
                  <MedicinesComponent medicines={medicines} setMedicines={setMedicines} />
                  <NextVisitComponent date={date} setDate={setDate} />
                  <button className="save-report-btn" onClick={handleSaveReport}>
                    Save Report
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
