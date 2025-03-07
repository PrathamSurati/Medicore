import { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../../utils";
import { useNavigate } from "react-router-dom";
import './AddPatient.css'; 

const AddPatientModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'existing'
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    dob: "",
    city: "",
    address: "",
    pin: "",
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const navigate = useNavigate();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        phone: "",
        gender: "",
        age: "",
        dob: "",
        city: "",
        address: "",
        pin: "",
      });
      setSearchTerm('');
      setSearchResults([]);
      setSelectedPatient(null);
      setAppointmentDate('');
      setAppointmentTime('');
      setActiveTab('new');
    }
  }, [isOpen]);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      
      try {
        console.log(`Searching for patients with term: ${term}`);
        const url = `http://localhost:8081/api/patients/search?query=${encodeURIComponent(term)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          // Handle non-200 responses
          const errorText = await response.text();
          throw new Error(`Search failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Search returned ${data.length} results`);
        
        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
        // Show a toast error message
        handleError(`Search failed: ${error.message}`);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    // No dependencies needed
    []
  );

  // Setup debounced search effect
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300); // 300ms delay
    
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(''); // Clear search after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'new') {
      // Handle new patient submission
      const {
        name, phone, gender, age, dob, city, address, pin
      } = formData;

      if (!name || !phone || !gender || !age || !dob || !city || !address || !pin) {
        return handleError("All fields are required!");
      }

      try {
        const url = "http://localhost:8081/api/newpatient";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        console.log("Server Response: ", result);
        const { success, message, error, patient } = result;

        if (success && patient) {
          handleSuccess(message);
          
          // Create a complete patient object with required properties
          const completePatient = {
            ...patient,
            isVisited: false,
            lastVisitDate: null,
            appointments: [],
            createdAt: new Date().toISOString()
          };
          
          // Log before dispatching event
          console.log("Dispatching patientAdded event with data:", completePatient);
          
          // Dispatch the event
          try {
            const patientAddedEvent = new CustomEvent('patientAdded', {
              detail: { patient: completePatient }
            });
            window.dispatchEvent(patientAddedEvent);
            console.log("Event dispatched successfully");
          } catch (eventErr) {
            console.error("Error dispatching patient event:", eventErr);
          }
          
          // If appointment date is provided, schedule an appointment
          if (appointmentDate) {
            await scheduleAppointment(patient._id);
          } else {
            setTimeout(() => {
              navigate(`/patients/${patient._id}`);
              onClose();
            }, 1500);
          }
        } else if (error) {
          handleError(error);
        } else {
          handleError(message);
        }
      } catch (err) {
        console.error("API Error:", err);
        handleError("Failed to add patient. Please try again later.");            
      }
    } else {
      // Handle existing patient appointment scheduling
      if (!selectedPatient) {
        return handleError("Please select a patient first");
      }
      
      if (!appointmentDate || !appointmentTime) {
        return handleError("Appointment date and time are required");
      }
      
      await scheduleAppointment(selectedPatient._id);
    }
  };

  const scheduleAppointment = async (patientId) => {
    if (!appointmentDate) {
      return handleError("Appointment date is required");
    }
    
    try {
      console.log('Scheduling appointment for patient:', patientId); 
      
      // Format date and time for the appointment
      const appointmentDateTime = appointmentTime 
        ? `${appointmentDate}T${appointmentTime}` 
        : `${appointmentDate}T09:00:00`; // Default to 9 AM if no time specified
      
      // Calculate end time (30 minutes after start)
      const startTime = new Date(appointmentDateTime);
      const endTime = new Date(startTime.getTime() + 30 * 60000);
      
      const appointmentData = {
        patientId,
        // Include patient name from state if this is an existing patient
        ...(selectedPatient && { patientName: selectedPatient.name }),
        title: 'New Appointment',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        type: 'New Visit',
        status: 'Scheduled'
      };
      
      console.log('Sending appointment data:', appointmentData);
      
      const url = "http://localhost:8081/api/appointments";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to schedule appointment: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Appointment creation result:', result);

      // Also dispatch an event for the new appointment
      if (result && result._id) {
        // Log before dispatching event
        console.log("Dispatching appointmentAdded event with data:", result);
        
        // Dispatch the event
        try {
          const newAppointmentEvent = new CustomEvent('appointmentAdded', {
            detail: { appointment: result }
          });
          window.dispatchEvent(newAppointmentEvent);
          console.log("Appointment event dispatched successfully");
        } catch (eventErr) {
          console.error("Error dispatching appointment event:", eventErr);
        }
      }
      
      handleSuccess("Appointment scheduled successfully!");
      setTimeout(() => {
        navigate('/appointments');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      handleError(`Failed to schedule appointment: ${err.message}`);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target.className === 'new_patient_modal') {
      handleClose();
    }
  };

  return (
    <section className="new_patient_modal" onClick={handleBackgroundClick}>
      <div className="add-patient-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={activeTab === 'new' ? 'active-tab' : ''}
            onClick={() => setActiveTab('new')}
          >
            New Patient
          </button>
          <button 
            className={activeTab === 'existing' ? 'active-tab' : ''}
            onClick={() => setActiveTab('existing')}
          >
            Existing Patient
          </button>
        </div>

        {activeTab === 'new' ? (
          <form onSubmit={handleSubmit} className="patient-form">
            <h2>Add New Patient</h2>

            {/* New Patient Form Fields */}
            <div className="form-group">
              <label htmlFor="name">Patient Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Enter Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <div className="radio-group">
                {["Male", "Female", "Other"].map((gender) => (
                  <label key={gender}>
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      required
                      checked={formData.gender === gender}
                      onChange={handleInputChange}
                    />{" "}
                    {gender}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Age and DOB *</label>
              <div className="age-dob-group">
                <input
                  type="number"
                  name="age"
                  placeholder="Age (Years)"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter Address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN Code *</label>
              <input
                type="text"
                id="pin"
                name="pin"
                placeholder="Enter PIN"
                value={formData.pin}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Appointment Scheduling Section */}
            <div className="appointment-section">
              <h3>Schedule Appointment</h3>
              <div className="form-group">
                <label htmlFor="appointmentDate">Appointment Date</label>
                <input
                  type="date"
                  id="appointmentDate"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="appointmentTime">Appointment Time</label>
                <input
                  type="time"
                  id="appointmentTime"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {appointmentDate ? 'Add & Schedule Appointment' : 'Add Patient'}
              </button>
            </div>
          </form>
        ) : (
          <div className="existing-patient-section">
            <h2>Find Existing Patient</h2>
            
            {/* Search for existing patients */}
            <div className="form-group search-container">
              <label htmlFor="patientSearch">Search by name or phone</label>
              <input
                type="text"
                id="patientSearch"
                placeholder="Start typing to search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                autoFocus
              />
              {isSearching && <div className="search-spinner"></div>}
            </div>
            
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Search Results</h3>
                <ul className="patient-list">
                  {searchResults.map(patient => (
                    <li 
                      key={patient._id} 
                      className={`patient-item ${selectedPatient?._id === patient._id ? 'selected' : ''}`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="patient-info-main">
                        <span className="patient-name">{patient.name}</span>
                        <span className="patient-id">{patient.phone}</span>
                      </div>
                      <div className="patient-info-secondary">
                        <span>{patient.gender}, {patient.age} years</span>
                        <span>{patient.address}, {patient.city}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* No results message */}
            {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="no-results">
                <p>No patients found matching "{searchTerm}".</p>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setActiveTab('new')}
                >
                  Add New Patient Instead
                </button>
              </div>
            )}
            
            {/* Selected patient details */}
            {selectedPatient && (
              <div className="selected-patient">
                <h3>Selected Patient</h3>
                <div className="patient-details">
                  <div>
                    <strong>Name:</strong> {selectedPatient.name}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedPatient.phone}
                  </div>
                  <div>
                    <strong>Age/Gender:</strong> {selectedPatient.age} years, {selectedPatient.gender}
                  </div>
                </div>
                
                {/* Appointment form for existing patient */}
                <form onSubmit={handleSubmit} className="appointment-form">
                  <h3>Schedule Appointment</h3>
                  <div className="form-group">
                    <label htmlFor="existingAppointmentDate">Appointment Date *</label>
                    <input
                      type="date"
                      id="existingAppointmentDate"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="existingAppointmentTime">Appointment Time *</label>
                    <input
                      type="time"
                      id="existingAppointmentTime"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Schedule Appointment
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </section>
  );
};

AddPatientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddPatientModal;
