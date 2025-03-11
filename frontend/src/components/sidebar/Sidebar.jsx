import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import signoutButton from "../../assets/images/signout_button.png";
import addPatientIcon from "../../assets/images/add.png";
import addBillIcon from "../../assets/images/bill.png";
import patientsIcon from "../../assets/images/patients.png";
import reportsIcon from "../../assets/images/reports.png";
import settingsIcon from "../../assets/images/settings.png";
import leftArrow from "../../assets/images/left_arrow.png";
import rightArrow from "../../assets/images/right_arrow.png";
import searchIcon from "../../assets/images/search.png";
import saveIcon from "../../assets/images/save.png";
import "./Sidebar.css";
import PropTypes from "prop-types";

const Sidebar = ({ onAddClick, activeSection, setActiveSection, navigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [visitedFilter, setVisitedFilter] = useState("all"); // 'all', 'today', 'upcoming', 'visited'
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsResponse = await fetch("http://localhost:8081/api/patients");
        if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
        const patientsData = await patientsResponse.json();
        
        const patientsWithVisitStatus = patientsData.map(patient => ({
          ...patient,
          isVisited: patient.isVisited || false,
          lastVisitDate: patient.lastVisitDate || null,
          appointments: []
        }));
        setPatients(patientsWithVisitStatus);

        // Fetch appointments
        const appointmentsResponse = await fetch("http://localhost:8081/api/appointments");
        if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
        const appointmentsData = await appointmentsResponse.json();
        
        setAppointments(appointmentsData);
        
        // Associate appointments with patients
        if (appointmentsData.length > 0) {
          setPatients(prevPatients => {
            const patientsCopy = [...prevPatients];
            
            // Group appointments by patient ID
            const appointmentsByPatient = {};
            appointmentsData.forEach(appointment => {
              if (appointment.patientId) {
                if (!appointmentsByPatient[appointment.patientId]) {
                  appointmentsByPatient[appointment.patientId] = [];
                }
                appointmentsByPatient[appointment.patientId].push(appointment);
              }
            });
            
            // Update patients with their appointments and visit status
            return patientsCopy.map(patient => {
              const patientAppointments = appointmentsByPatient[patient._id] || [];
              
              // Find today's appointment if it exists
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const todayAppointment = patientAppointments.find(appointment => {
                const appointmentDate = new Date(appointment.startTime);
                return appointmentDate >= today && appointmentDate < tomorrow;
              });
              
              return {
                ...patient,
                appointments: patientAppointments,
                todayAppointment: todayAppointment,
                visitStatus: todayAppointment ? todayAppointment.visitStatus : null
              };
            });
          });
        }

        // Fetch prescriptions
        const prescriptionsResponse = await fetch('http://localhost:8081/api/prescriptions');
        if (!prescriptionsResponse.ok) throw new Error('Network response was not ok');
        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(prescriptionsData);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      }
    };

    fetchData();

    // Setup event listeners for updates
    const handleReportSaved = (event) => {
      console.log("Report saved event received:", event.detail);
      const { patientId, date } = event.detail;
      
      setPatients(prevPatients => 
        prevPatients.map(patient => {
          if (patient._id === patientId) {
            // Update the patient's visit status when a report is saved
            const updatedTodayAppointment = patient.todayAppointment ? 
              { ...patient.todayAppointment, visitStatus: 'visited' } : null;
            
            return { 
              ...patient, 
              isVisited: true, 
              lastVisitDate: date || new Date().toISOString(),
              todayAppointment: updatedTodayAppointment,
              visitStatus: 'visited'
            };
          }
          return patient;
        })
      );
    };

    const handlePatientAdded = (event) => {
      console.log("Patient added event received:", event.detail);
      const { patient } = event.detail;
      
      if (!patient || !patient._id) {
        console.error("Invalid patient data in event:", event.detail);
        return;
      }
      
      // Add the new patient to the state
      setPatients(prevPatients => {
        // Check if this patient already exists
        if (prevPatients.some(p => p._id === patient._id)) {
          console.log("Patient already exists, not adding duplicate");
          return prevPatients;
        }
        
        console.log("Adding new patient to sidebar:", patient);
        // Add to beginning of array for visibility
        return [patient, ...prevPatients];
      });
    };

    const handleAppointmentAdded = (event) => {
      console.log("Appointment added event received:", event.detail);
      const { appointment } = event.detail;
      
      if (!appointment || !appointment._id) {
        console.error("Invalid appointment data in event:", event.detail);
        return;
      }
      
      // Add new appointment to state
      setAppointments(prevAppointments => {
        if (prevAppointments.some(a => a._id === appointment._id)) {
          return prevAppointments;
        }
        return [appointment, ...prevAppointments];
      });
      
      // Update the patient with this appointment
      if (appointment.patientId) {
        setPatients(prevPatients => 
          prevPatients.map(patient => 
            patient._id === appointment.patientId 
              ? { 
                  ...patient, 
                  appointments: [appointment, ...(patient.appointments || [])]
                }
              : patient
          )
        );
      }
    };

    // Add event listeners
    window.addEventListener('reportSaved', handleReportSaved);
    window.addEventListener('patientAdded', handlePatientAdded);
    window.addEventListener('appointmentAdded', handleAppointmentAdded);
    
    // Cleanup
    return () => {
      window.removeEventListener('reportSaved', handleReportSaved);
      window.removeEventListener('patientAdded', handlePatientAdded);
      window.removeEventListener('appointmentAdded', handleAppointmentAdded);
    };
  }, []);

  const handlePatientClick = (patientId, forceReadOnly = false) => {
    console.log('Patient clicked with ID:', patientId);
    
    // Find the patient to check if they've been visited before
    const patient = patients.find(p => p._id === patientId);
    
    // Determine if we should go to read-only mode:
    // 1. If forceReadOnly is true, OR
    // 2. If the patient has been visited before (has a report)
    const shouldBeReadOnly = forceReadOnly || (patient && patient.isVisited);
    
    if (shouldBeReadOnly) {
      navigate(`/patients/${patientId}?readOnly=true`);
    } else {
      navigate(`/patients/${patientId}`);
    }
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

  // Helper function to determine if an appointment is today, upcoming, or past
  const getAppointmentStatus = (appointment) => {
    if (!appointment.startTime) return 'unknown';
    
    const appointmentDate = new Date(appointment.startTime);
    const today = new Date();
    
    // Set hours to 0 to compare just the date part
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const apptDate = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    
    if (apptDate.getTime() === todayDate.getTime()) {
      return 'today';
    } else if (appointmentDate > today) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  // Get the latest appointment for a patient
  const getLatestAppointment = (patient) => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return null;
    }
    
    // Sort appointments by date (most recent first)
    return [...patient.appointments].sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    )[0];
  };

  // Group patients by their appointment status
  const todayPatients = patients.filter(patient => {
    const latestAppointment = getLatestAppointment(patient);
    return latestAppointment && getAppointmentStatus(latestAppointment) === 'today';
  });
  
  const upcomingPatients = patients.filter(patient => {
    const latestAppointment = getLatestAppointment(patient);
    return latestAppointment && getAppointmentStatus(latestAppointment) === 'upcoming';
  });
  
  const pastPatients = patients.filter(patient => {
    // Consider patients with past appointments or those who have been marked as visited
    const latestAppointment = getLatestAppointment(patient);
    return (latestAppointment && getAppointmentStatus(latestAppointment) === 'past') || 
           patient.isVisited;
  });
  
  // Add a new function to get only visited patients
  const visitedPatients = patients.filter(patient => 
    patient.isVisited === true
  );

  // Filter patients based on search term
  const filterBySearchTerm = (patientsList) => {
    return patientsList.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Update the today's patients filtering to prioritize non-visited patients
  const filteredTodayPatients = filterBySearchTerm(todayPatients).sort((a, b) => {
    // First sort by visit status (non-visited first)
    if ((a.visitStatus === 'visited') !== (b.visitStatus === 'visited')) {
      return a.visitStatus === 'visited' ? 1 : -1; // non-visited patients come first
    }
    
    // Then sort by appointment time (ascending order)
    const appointmentA = getLatestAppointment(a);
    const appointmentB = getLatestAppointment(b);
    
    // Handle cases where appointments might be missing
    if (!appointmentA && !appointmentB) return 0;
    if (!appointmentA) return 1;
    if (!appointmentB) return -1;
    
    // Sort by time (earliest time first)
    const timeA = new Date(appointmentA.startTime).getTime();
    const timeB = new Date(appointmentB.startTime).getTime();
    return timeA - timeB;
  });
  
  const filteredUpcomingPatients = filterBySearchTerm(upcomingPatients);
  const filteredPastPatients = filterBySearchTerm(pastPatients);
  const filteredVisitedPatients = filterBySearchTerm(visitedPatients);

  // Format date helper function (more detailed for appointments)
  const formatAppointmentTime = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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

      {/* Modified: Display patients organized by appointment status */}
      {activeSection === "appointments" && (
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

          <div className="patient-filter-controls">
            <button 
              className={`filter-button ${visitedFilter === "all" ? "active" : ""}`}
              onClick={() => setVisitedFilter("all")}
            >
              All
            </button>
            <button 
              className={`filter-button ${visitedFilter === "today" ? "active" : ""}`}
              onClick={() => setVisitedFilter("today")}
            >
              Today
            </button>
            <button 
              className={`filter-button ${visitedFilter === "upcoming" ? "active" : ""}`}
              onClick={() => setVisitedFilter("upcoming")}
            >
              Upcoming
            </button>
            {/* Removed "Past" filter button */}
            <button 
              className={`filter-button ${visitedFilter === "visited" ? "active" : ""}`}
              onClick={() => setVisitedFilter("visited")}
            >
              Visited
            </button>
          </div>

          <div className="patients-container">
            {/* Today's Appointments Section - Updated to handle visited status */}
            {(visitedFilter === "all" || visitedFilter === "today") && (
              <div className="patients-section today-section">
                <h3 className="section-header">Today's Appointments ({filteredTodayPatients.length})</h3>
                {filteredTodayPatients.length === 0 ? (
                  <div className="no-results">No appointments today</div>
                ) : (
                  <div className="patients-list">
                    {filteredTodayPatients.map((patient, index) => {
                      const latestAppointment = getLatestAppointment(patient);
                      return (
                        <div 
                          key={patient._id} 
                          className={`patient-card today-card ${patient.visitStatus === 'visited' ? "visited-patient" : ""}`}
                          onClick={() => handlePatientClick(patient._id, patient.visitStatus === 'visited')}
                        >
                          <div className="patient-number">{index + 1}</div>
                          <div className="patient-info">
                            <div className="patient-name">{patient.name}</div>
                            <div className="patient-details">
                              {patient.age && <span>Age: {patient.age}</span>}
                              {patient.gender && <span> | {patient.gender}</span>}
                              {patient.visitStatus && (
                                <span className={`visit-status-tag ${patient.visitStatus}`}>
                                  | {patient.visitStatus === 'visited' ? 'Visited' : 'Not Visited'}
                                </span>
                              )}
                            </div>
                            {latestAppointment && (
                              <div className="appointment-time">
                                <span className="time-badge">{formatAppointmentTime(latestAppointment.startTime)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Appointments Section */}
            {(visitedFilter === "all" || visitedFilter === "upcoming") && (
              <div className="patients-section upcoming-section">
                <h3 className="section-header">Upcoming Appointments ({filteredUpcomingPatients.length})</h3>
                {filteredUpcomingPatients.length === 0 ? (
                  <div className="no-results">No upcoming appointments</div>
                ) : (
                  <div className="patients-list">
                    {filteredUpcomingPatients.map((patient, index) => {
                      const latestAppointment = getLatestAppointment(patient);
                      return (
                        <div 
                          key={patient._id} 
                          className={`patient-card upcoming-card ${patient.visitStatus === 'visited' || patient.isVisited ? "visited-patient" : ""}`}
                          onClick={() => handlePatientClick(patient._id, (patient.visitStatus === 'visited' || patient.isVisited))}
                        >
                          <div className="patient-number">{index + 1}</div>
                          <div className="patient-info">
                            <div className="patient-name">{patient.name}</div>
                            <div className="patient-details">
                              {patient.age && <span>Age: {patient.age}</span>}
                              {patient.gender && <span> | {patient.gender}</span>}
                              {(patient.visitStatus || patient.isVisited) && (
                                <span className={`visit-status-tag ${patient.visitStatus === 'visited' || patient.isVisited ? 'visited' : 'not-visited'}`}>
                                  | {patient.visitStatus === 'visited' || patient.isVisited ? 'Visited' : 'Not Visited'}
                                </span>
                              )}
                            </div>
                            {latestAppointment && (
                              <div className="appointment-date">
                                {formatAppointmentDate(latestAppointment.startTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Past Appointments Section removed */}

            {/* Add new Visited Patients Section */}
            {(visitedFilter === "all" || visitedFilter === "visited") && (
              <div className="patients-section visited-section">
                <h3 className="section-header">Visited Patients ({filteredVisitedPatients.length})</h3>
                {filteredVisitedPatients.length === 0 ? (
                  <div className="no-results">No visited patients</div>
                ) : (
                  <div className="patients-list">
                    {filteredVisitedPatients.map((patient, index) => {
                      return (
                        <div 
                          key={patient._id} 
                          className="patient-card visited-card"
                          onClick={() => handlePatientClick(patient._id, true)} // Visited patients are read-only
                        >
                          <div className="patient-number">{index + 1}</div>
                          <div className="patient-info">
                            <div className="patient-header">
                              <div className="patient-name">{patient.name}</div>
                              {patient.lastVisitDate && (
                                <span className="date-badge">Visit: {new Date(patient.lastVisitDate).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="patient-details">
                              {patient.age && <span>Age: {patient.age}</span>}
                              {patient.gender && <span> | {patient.gender}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
