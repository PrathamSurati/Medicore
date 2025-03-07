import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import signoutButton from "../assets/images/signout_button.png";
import addPatientIcon from "../assets/images/add.png";
import addBillIcon from "../assets/images/bill.png";
import patientsIcon from "../assets/images/patients.png";
import reportsIcon from "../assets/images/reports.png";
import settingsIcon from "../assets/images/settings.png";
import leftArrow from "../assets/images/left_arrow.png";
import rightArrow from "../assets/images/right_arrow.png";
import searchIcon from "../assets/images/search.png";
import saveIcon from "../assets/images/save.png";
import "./Sidebar.css";
import PropTypes from "prop-types";

const Sidebar = ({ onAddClick, activeSection, setActiveSection, navigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]); // Add state for appointments
  const [prescriptions, setPrescriptions] = useState([]); 
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/patients")
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
      })
      .then(data => setPatients(data))
      .catch(err => setError(err.message));

    // Fetch appointments
    fetch("http://localhost:8081/api/appointments")
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch appointments');
        return response.json();
      })
      .then(data => setAppointments(data))
      .catch(err => setError(err.message));

    fetch('http://localhost:8081/api/prescriptions')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPrescriptions(data);
      })
      .catch(error => {
        setError(error.toString());
      });
  }, []);

  const handlePatientClick = (patientId) => {
    console.log('Patient clicked with ID:', patientId);
    navigate(`/patients/${patientId}`);
  };

  // New function to handle appointment click
  const handleAppointmentClick = (appointmentId) => {
    console.log('Appointment clicked with ID:', appointmentId);
    // Navigate to appointment details or related patient
    const appointment = appointments.find(apt => apt._id === appointmentId);
    if (appointment && appointment.patientId) {
      navigate(`/patients/${appointment.patientId}`);
    }
  };

  const menuItems = [
    { id: "Add patient", label: "Add patient", icon: addPatientIcon },
    { id: "AddBills", label: "Add Bills", icon: addBillIcon },
    { id: "appointments", label: "Appointments", icon: patientsIcon }, // Changed label to "Appointments" 
    { id: "reports", label: "Reports", icon: reportsIcon },
    { id: "saveTemplate", label: "Save Template", icon: saveIcon }, 
    { id: "settings", label: "Settings", icon: settingsIcon },
  ];

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients
    .filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Filter appointments based on search term
  const filteredAppointments = appointments
    .filter((appointment) =>
      (appointment.patientName && appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.title && appointment.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className={`primary-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        {/* ...existing sidebar header and search... */}
        <div className="upperContent">
          <div className="sidebar-header">
            <h1 className="app-title">
              {isCollapsed ? "" : "Report generator"}
            </h1>
            <button className="collapse-button" onClick={handleToggleSidebar}>
              <img
                src={isCollapsed ? rightArrow : leftArrow}
                alt="arrows"
                style={{ height: "30px", width: "25px" }}
              />
            </button>
          </div>

          <div className="search-container">
            {isCollapsed ? (
              <img src={searchIcon} alt="Search" className="search-icon" />
            ) : (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            )}
          </div>

          <ul className="menu-list">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`menu-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  if (item.id === "Add patient") {
                    onAddClick();
                  }
                }}
                title={isCollapsed ? item.label : ""}
              >
                <Link to={`/${item.id}`} className="menu-link">
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="menu-icon" 
                    style={item.id === "saveTemplate" ? { height: "25px", width: "25px" } : {}}
                  />
                  {!isCollapsed && (
                    <span className="menu-label">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ...existing profile section... */}
        <div className="profile-signout-container">
          <div className={`user-profile ${isCollapsed ? "collapsed" : ""}`}>
            <div className="avatar">👨‍⚕️</div>
            <div className="user-info">
              <strong>Dr. Smit</strong>
              <small>Cardiologist</small>
            </div>
          </div>
          <button className="signout-button" title="Sign Out">
            <div className="signout-icon">
              <img
                src={signoutButton}
                alt="Sign out"
                style={{
                  height: "20px",
                  width: "20px",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Modified: Display appointments instead of patients */}
      {activeSection === "appointments" && (
        <aside className="secondary-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="appointments-list">
            {error ? (
              <div className="error-message">{error}</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="no-results">No appointments found</div>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <div 
                  key={appointment._id} 
                  className="appointment-card"
                  onClick={() => handleAppointmentClick(appointment._id)}
                >
                  <h4>
                    {appointment.patientName || "Unnamed Patient"}
                  </h4>
                  <div className="appointment-info">
                    <div><strong>Date:</strong></div>
                    <div>{formatDate(appointment.startTime).split(' ')[0]}</div>
                  </div>
                  
                  <div className="appointment-time">
                    {formatDate(appointment.startTime).split(' ')[1]} - {appointment.endTime ? formatDate(appointment.endTime).split(' ')[1] : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {activeSection === "saveTemplate" && (
        <aside className="secondary-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="templates-list">
              {prescriptions.length === 0 ? (
                <div className="no-results">No prescriptions found</div>
              ) : (
                prescriptions.map((prescription, index) => (
                  <div key={prescription._id} className="template-card">
                    <h4>
                      {index + 1}. {prescription.title}
                    </h4>
                  </div>
                ))
              )}
            </div>
        </aside>
      )}
    </>
  );
};

Sidebar.propTypes = {
  onAddClick: PropTypes.func.isRequired,
  activeSection: PropTypes.string,
  setActiveSection: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default Sidebar;
