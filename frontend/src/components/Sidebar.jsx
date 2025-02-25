import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
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

const Sidebar = ({ onAddClick, activeSection, setActiveSection }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]); 
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the patients from your API
    fetch('http://localhost:8081/api/patients')
      .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data:', data);
        setPatients(data);
      })
      .catch(error => {
        console.error('Error fetching patients:', error);
        setError(error.toString());
      });



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



  const menuItems = [
    { id: "Add patient", label: "Add patient", icon: addPatientIcon }, // Change id to match route
    { id: "AddBills", label: "Add Bills", icon: addBillIcon },
    { id: "patients", label: "Patients", icon: patientsIcon },
    { id: "reports", label: "Reports", icon: reportsIcon },
    { id: "saveTemplate", label: "Save Template", icon: saveIcon }, 
    { id: "settings", label: "Settings", icon: settingsIcon },
  ];



  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredPatients = patients
    .filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* <div className="app-container"> */}
      <div className={`primary-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="upperContent">
          <div className="sidebar-header">
            <h1 className="app-title">
              {isCollapsed ? "" : "Report generator"}
            </h1>
            <button className="collapse-button" onClick={handleToggleSidebar}>
              <img
                src={isCollapsed ? leftArrow : rightArrow}
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

      {activeSection === "patients" && (
        <aside className="secondary-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="patients-list">
            {error ? (
              <div className="error-message">{error}</div>
            ) : filteredPatients.length === 0 ? (
              <div className="no-results">No patients found</div>
            ) : (
              filteredPatients.map((patient, index) => (
                <div key={patient._id} className="patient-card">
                  <h4>
                    {index + 1}. {patient.name}
                  </h4>
                  <p>
                    <small>Created At: {new Date(patient.createdAt).toLocaleString()}</small>
                  </p>
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

      {/* </div> */}
    </>
  );
};

Sidebar.propTypes = {
  onAddClick: PropTypes.func.isRequired,
  activeSection: PropTypes.string,
  setActiveSection: PropTypes.func.isRequired,
};

export default Sidebar;
