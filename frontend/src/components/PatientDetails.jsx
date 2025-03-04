import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./PatientDetails.css"; // Create this file for styling
import axios from "axios";

// Import report components
import ComplaintsComponent from "./Report/Complaints/Complains";
import DiagnosisComponent from "./Report/Diagnosis/Diagnosis";
import MedicinesComponent from "./Report/Medicines/Medicines";
import NextVisitComponent from "./Report/NextVisit/NextVisit";
import VitalsComponent from "./Report/Vitals/Vitals";
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
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

    // Send a POST request to your backend API to save the report data
    try {
      const response = await axios.post(
        `http://localhost:8081/api/patients/${patientId}/details`,
        reportData
      );
      console.log('Report saved successfully:', response.data);
      alert("Report saved successfully!");

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

  if (loading) return <div className="patient-loading">Loading...</div>;
  if (error) return <div className="patient-error">Error: {error}</div>;

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
            </div>
          </div>
        </div>
        <div className="patient-actions">
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
          <button className="action-button print-button">Print</button>
        </div>
      </div>

      {/* Report Components with proper responsive container */}
      {/* <div className="report-component">
        <TitleComponent title={title} setTitle={setTitle} />
      </div> */}

      <div className="report-component">
        <VitalsComponent vitals={vitals} setVitals={setVitals} />
        <ComplaintsComponent
          complaints={complaints}
          setComplaints={setComplaints}
        />
        <DiagnosisComponent diagnosis={diagnosis} setDiagnosis={setDiagnosis} />
        <MedicinesComponent medicines={medicines} setMedicines={setMedicines} />
        <NextVisitComponent date={date} setDate={setDate} />
        <button className="save-report-btn" onClick={handleSaveReport}>
          Save Report
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;
