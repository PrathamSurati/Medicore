import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentManager.css';
// Add React Icons imports
import { FaCalendarAlt, FaUser, FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const AppointmentManager = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all', 'today', 'upcoming', 'past'
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const calendarRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add new state for rescheduling modal
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const rescheduleModalRef = useRef(null);
  
  // Format today's date for default input value
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check if sidebar is collapsed by its class
    const sidebarElement = document.querySelector('.primary-sidebar');
    if (sidebarElement) {
      setSidebarCollapsed(sidebarElement.classList.contains('collapsed'));
    }
    
    // Add listener for sidebar collapse events
    const checkSidebarState = () => {
      const isCollapsed = document.querySelector('.primary-sidebar.collapsed') !== null;
      setSidebarCollapsed(isCollapsed);
    };
    
    // Use MutationObserver to detect sidebar class changes
    const observer = new MutationObserver(checkSidebarState);
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    // Fetch patients and appointments from API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch patients
        const patientsResponse = await fetch('http://localhost:8081/api/patients');
        if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);

        // Fetch appointments
        const appointmentsResponse = await fetch('http://localhost:8081/api/appointments');
        if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup event listener for clicks outside calendar dropdown
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Close reschedule modal when clicking outside
    const handleClickOutsideReschedule = (event) => {
      if (rescheduleModalRef.current && 
          !rescheduleModalRef.current.contains(event.target) &&
          !event.target.closest('.action-button.reschedule')) {
        setIsRescheduleModalOpen(false);
        setRescheduleError(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideReschedule);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideReschedule);
    };
  }, []);

  // Add this new function to refresh appointments from the server
  const refreshAppointments = async () => {
    try {
      const appointmentsResponse = await fetch('http://localhost:8081/api/appointments');
      if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(appointmentsData);
      console.log('Appointments refreshed from server:', appointmentsData.length, 'appointments loaded');
    } catch (err) {
      console.error('Error refreshing appointments:', err);
    }
  };

  // Helper function to determine if an appointment is today, upcoming, or past
  const getAppointmentStatus = (appointment) => {
    if (!appointment.startTime) return 'unknown';
    
    const appointmentDate = new Date(appointment.startTime);
    const today = new Date();
    
    // Set time to midnight for date comparison
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const apptDate = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    
    if (apptDate.getTime() === todayDate.getTime()) {
      return 'today';
    } else if (apptDate > todayDate) {
      return 'upcoming';
    } else if (apptDate < todayDate) {
      return 'past';
    }
    return 'unknown';
  };

  // Function to format appointment time range
  const formatAppointmentTimeRange = (startTime, endTime) => {
    if (!startTime) return "Not scheduled";
    const start = new Date(startTime);
    const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (!endTime) return startStr;
    const end = new Date(endTime);
    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${startStr} - ${endStr}`;
  };

  // Function to update appointment status
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus, e) => {
    if (e) e.stopPropagation();
    
    try {
      const response = await fetch(`http://localhost:8081/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitStatus: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update appointment');
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointmentId ? { ...apt, visitStatus: newStatus } : apt
        )
      );
      
      // Show success toast
      showNotification(`Appointment ${newStatus === 'visited' ? 'marked as visited' : newStatus === 'cancelled' ? 'cancelled' : 'updated'}`);
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError(err.message);
    }
  };
  
  // Simple notification function (replace with react-toastify if available)
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'appointment-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 2000);
    }, 10);
  };

  // Get appointments for a specific date and filter type
  const getAppointmentsForDate = (date) => {
    if (!date || !appointments.length) return [];
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    return appointments.filter(appointment => {
      if (!appointment.startTime) return false;
      const appointmentDate = new Date(appointment.startTime);
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentFilter === 'all') {
        // For 'all' filter, return appointments only for the selected date
        return appointmentDate.getTime() === date.getTime();
      } else if (appointmentFilter === 'today') {
        // For 'today' filter, return today's appointments
        return appointmentDate.getTime() === currentDate.getTime();
      } else if (appointmentFilter === 'upcoming') {
        // For 'upcoming' filter, return all future appointments
        return appointmentDate.getTime() > currentDate.getTime();
      } else if (appointmentFilter === 'past') {
        // For 'past' filter, return all past appointments
        return appointmentDate.getTime() < currentDate.getTime();
      }
      return false;
    });
  };

  // Get patients with appointments for selected date with filters applied
  const getPatientsWithAppointments = () => {
    // Get appointments for the selected date
    const dateAppointments = getAppointmentsForDate(selectedDate);
    
    // Filter appointments based on filter type
    let filteredAppointments = dateAppointments;
    if (appointmentFilter !== 'all') {
      filteredAppointments = filteredAppointments.filter(appointment => 
        getAppointmentStatus(appointment) === appointmentFilter
      );
    }
    
    // Apply search term to appointments
    if (searchTerm) {
      filteredAppointments = filteredAppointments.filter(apt => {
        // Find the patient for this appointment
        const patient = patients.find(p => p._id === apt.patientId);
        const patientName = patient ? patient.name.toLowerCase() : '';
        
        // Search in appointment details and patient name
        return patientName.includes(searchTerm.toLowerCase()) || 
               (apt.title && apt.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (apt.notes && apt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }
    
    // Sort appointments by time
    filteredAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Group appointments by patient
    const patientAppointments = {};
    filteredAppointments.forEach(appointment => {
      if (!patientAppointments[appointment.patientId]) {
        patientAppointments[appointment.patientId] = [];
      }
      patientAppointments[appointment.patientId].push(appointment);
    });

    // Create patient list with their appointments
    const patientsWithAppts = Object.keys(patientAppointments).map(patientId => {
      const patient = patients.find(p => p._id === patientId) || { name: 'Unknown Patient', _id: patientId };
      return {
        ...patient,
        appointments: patientAppointments[patientId]
      };
    });

    return patientsWithAppts;
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
  };
  
  // Toggle calendar dropdown
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };
  
  // Format selected date for display
  const formatSelectedDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  // Format date for input value
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Navigate to next/prev date
  const navigatePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const navigateNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  // Get counts for badge display
  const getFilteredAppointmentsCount = () => {
    return getAppointmentsForDate(selectedDate).length;
  };
  
  const getTodayFilteredCount = () => {
    return getAppointmentsForDate(selectedDate).filter(apt => 
      getAppointmentStatus(apt) === 'today'
    ).length;
  };
  
  const getUpcomingFilteredCount = () => {
    return getAppointmentsForDate(selectedDate).filter(apt => 
      getAppointmentStatus(apt) === 'upcoming'
    ).length;
  };
  
  const getPastFilteredCount = () => {
    return getAppointmentsForDate(selectedDate).filter(apt => 
      getAppointmentStatus(apt) === 'past'
    ).length;
  };

  // Create new appointment
  const handleCreateAppointment = () => {
    navigate('/add-appointment');
  };

  // View patient details
  const handleViewPatient = (patientId, e) => {
    if (e) e.stopPropagation();
    navigate(`/patients/${patientId}`);
  };
  
  // New functions for handling appointment rescheduling
  const handleRescheduleClick = (appointment, e) => {
    if (e) e.stopPropagation();
    
    // Set the appointment to be rescheduled
    setAppointmentToReschedule(appointment);
    
    // Populate with current appointment details
    if (appointment.startTime) {
      const startDate = new Date(appointment.startTime);
      setNewAppointmentDate(startDate.toISOString().split('T')[0]);
      setNewAppointmentTime(startDate.toTimeString().slice(0, 5));
      
      if (appointment.endTime) {
        const endDate = new Date(appointment.endTime);
        setNewEndTime(endDate.toTimeString().slice(0, 5));
      } else {
        // Default to 30 minutes later
        const thirtyMinutesLater = new Date(startDate.getTime() + 30 * 60000);
        setNewEndTime(thirtyMinutesLater.toTimeString().slice(0, 5));
      }
    } else {
      // Default to today and current time
      setNewAppointmentDate(today);
      const now = new Date();
      setNewAppointmentTime(now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0'));
      
      // Default end time to 30 minutes later
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
      setNewEndTime(thirtyMinutesLater.getHours().toString().padStart(2, '0') + ':' + 
                   thirtyMinutesLater.getMinutes().toString().padStart(2, '0'));
    }
    
    // Open the modal
    setIsRescheduleModalOpen(true);
    setRescheduleError(null);
  };
  
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!newAppointmentDate || !newAppointmentTime || !newEndTime) {
      setRescheduleError('Please fill in all fields');
      return;
    }
    
    // Create start and end date objects
    const startDateTime = new Date(`${newAppointmentDate}T${newAppointmentTime}`);
    const endDateTime = new Date(`${newAppointmentDate}T${newEndTime}`);
    
    // Validate times
    if (endDateTime <= startDateTime) {
      setRescheduleError('End time must be after start time');
      return;
    }
    
    setRescheduleLoading(true);
    setRescheduleError(null);
    
    // Log the data being sent to backend
    const updateData = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };
    console.log('Sending update to backend for appointment:', appointmentToReschedule._id);
    console.log('Update data:', updateData);
    
    try {
      // Update the appointment
      const response = await fetch(`http://localhost:8081/api/appointments/${appointmentToReschedule._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reschedule appointment: ${response.status} ${errorText}`);
      }
      
      const updatedAppointment = await response.json();
      console.log('Backend successfully updated appointment:', updatedAppointment);
      
      // Refresh all appointments from the server to ensure we have latest data
      await refreshAppointments();
      
      // Close modal
      setIsRescheduleModalOpen(false);
      
      // Check if the appointment was rescheduled to a different date than currently selected
      const newAppointmentDateObj = new Date(newAppointmentDate);
      const currentSelectedDateObj = new Date(selectedDate);
      
      const isSameDate = 
        newAppointmentDateObj.getDate() === currentSelectedDateObj.getDate() &&
        newAppointmentDateObj.getMonth() === currentSelectedDateObj.getMonth() &&
        newAppointmentDateObj.getFullYear() === currentSelectedDateObj.getFullYear();
      
      if (!isSameDate) {
        // Create a notification with action button
        const actionNotification = document.createElement('div');
        actionNotification.className = 'appointment-action-notification';
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = 'Appointment rescheduled to ' + new Date(newAppointmentDate).toLocaleDateString();
        
        const actionButton = document.createElement('button');
        actionButton.textContent = 'View';
        actionButton.className = 'action-notification-button';
        actionButton.onclick = () => {
          // Update the selected date to match the new appointment date
          setSelectedDate(new Date(newAppointmentDate));
          document.body.removeChild(actionNotification);
        };
        
        actionNotification.appendChild(messageSpan);
        actionNotification.appendChild(actionButton);
        
        document.body.appendChild(actionNotification);
        
        setTimeout(() => {
          actionNotification.classList.add('show');
          setTimeout(() => {
            actionNotification.classList.remove('show');
            setTimeout(() => {
              if (document.body.contains(actionNotification)) {
                document.body.removeChild(actionNotification);
              }
            }, 500);
          }, 5000); // Longer display time for action notification
        }, 10);
      } else {
        // Simple notification for same-day reschedule
        showNotification('Appointment successfully rescheduled');
      }
      
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      setRescheduleError(err.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancelReschedule = () => {
    setIsRescheduleModalOpen(false);
    setRescheduleError(null);
  };
  
  // Add a useEffect to refresh appointments periodically
  useEffect(() => {
    // Initial fetch already done in first useEffect
    
    // Set up interval to refresh appointments every 5 minutes
    const refreshInterval = setInterval(() => {
      refreshAppointments();
    }, 300000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <div className={`appointment-manager ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="appointment-header">
        <h1>Appointment Manager</h1>
        {/* Removed the New Appointment button */}
      </div>
      
      <div className="appointment-toolbar">
        {/* Prominent Calendar Dropdown */}
        <div className="calendar-dropdown" ref={calendarRef}>
          <div className="date-navigation">
            <button 
              className="nav-button prev"
              onClick={navigatePrevDay}
              aria-label="Previous day"
            >
              <FaChevronLeft />
            </button>
            
            <div className="calendar-simple-wrapper">
              <button className="calendar-toggle" onClick={toggleCalendar}>
                <span className="calendar-icon"><FaCalendarAlt /></span>
                <span className="selected-date">{formatSelectedDate(selectedDate)}</span>
                <span className="dropdown-arrow"><FaChevronDown /></span>
              </button>
              
              {isCalendarOpen && (
                <div className="calendar-popup">
                  <div className="calendar-popup-header">
                    <h4>Select a date</h4>
                    <button className="today-button sm" onClick={goToToday}>Today</button>
                  </div>
                  <div className="custom-date-picker">
                    <input 
                      type="date" 
                      value={formatDateForInput(selectedDate)}
                      onChange={handleDateChange}
                      className="date-input fullwidth"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="nav-button next"
              onClick={navigateNextDay}
              aria-label="Next day"
            >
              <FaChevronRight />
            </button>
            
            {/* Removed the Today button */}
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="appointment-filters">
          <button 
            className={`filter-button ${appointmentFilter === 'all' ? 'active' : ''}`}
            onClick={() => setAppointmentFilter('all')}
          >
            All
            <span className="count-badge">{getFilteredAppointmentsCount()}</span>
          </button>
          <button 
            className={`filter-button ${appointmentFilter === 'today' ? 'active' : ''}`}
            onClick={() => setAppointmentFilter('today')}
          >
            Today
            <span className="count-badge">{getTodayFilteredCount()}</span>
          </button>
          <button 
            className={`filter-button ${appointmentFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setAppointmentFilter('upcoming')}
          >
            Upcoming
            <span className="count-badge">{getUpcomingFilteredCount()}</span>
          </button>
          <button 
            className={`filter-button ${appointmentFilter === 'past' ? 'active' : ''}`}
            onClick={() => setAppointmentFilter('past')}
          >
            Past
            <span className="count-badge">{getPastFilteredCount()}</span>
          </button>
        </div>
        
        {/* Search Box */}
        <div className="appointment-search">
          <input 
            type="text"
            placeholder="Search appointments or patients..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {/* Patients with appointments display */}
      <div className="appointments-wrapper">
        <h2 className="appointments-date-header">
          Appointments for {formatSelectedDate(selectedDate)}
          {appointmentFilter !== 'all' && ` (${appointmentFilter})`}
        </h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : (
          <div className="patient-appointments-list">
            {getPatientsWithAppointments().length === 0 ? (
              <div className="no-appointments">
                No appointments found for this date and filter.
              </div>
            ) : (
              getPatientsWithAppointments().map(patient => (
                <div key={patient._id} className="patient-with-appointments">
                  <div className="patient-header" onClick={() => handleViewPatient(patient._id)}>
                    <h3 className="patient-name">
                      <span className="patient-icon"><FaUser /></span> {patient.name}
                    </h3>
                    <div className="patient-meta">
                      {patient.age && <span>Age: {patient.age}</span>}
                      {patient.gender && <span> | {patient.gender}</span>}
                    </div>
                  </div>
                  
                  <div className="patient-appointments">
                    {patient.appointments.map(appointment => (
                      <div 
                        key={appointment._id} 
                        className={`appointment-item ${
                          appointment.visitStatus === 'visited' ? 'status-completed' : 
                          appointment.visitStatus === 'cancelled' ? 'status-cancelled' : 'status-scheduled'
                        }`}
                      >
                        <div className="appointment-time-pill">
                          {formatAppointmentTimeRange(appointment.startTime, appointment.endTime)}
                        </div>
                        
                        <div className="appointment-details">
                          <div className="appointment-title">
                            {appointment.title || 'Regular checkup'}
                          </div>
                          
                          {appointment.notes && (
                            <div className="appointment-notes">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="appointment-status">
                          {appointment.visitStatus === 'visited' ? 'Completed' : 
                           appointment.visitStatus === 'cancelled' ? 'Cancelled' : 
                           getAppointmentStatus(appointment) === 'past' ? 'Missed' : 'Scheduled'}
                        </div>
                        
                        <div className="appointment-actions">
                          {getAppointmentStatus(appointment) !== 'past' && appointment.visitStatus !== 'visited' && (
                            <button 
                              className="action-button mark-visited"
                              onClick={(e) => handleUpdateAppointmentStatus(appointment._id, 'visited', e)}
                            >
                              Mark Visited
                            </button>
                          )}
                          
                          {getAppointmentStatus(appointment) !== 'past' && appointment.visitStatus !== 'cancelled' && appointment.visitStatus !== 'visited' && (
                            <button 
                              className="action-button cancel"
                              onClick={(e) => handleUpdateAppointmentStatus(appointment._id, 'cancelled', e)}
                            >
                              Cancel
                            </button>
                          )}
                          
                          {appointment.visitStatus !== 'visited' && (
                            <button 
                              className="action-button reschedule"
                              onClick={(e) => handleRescheduleClick(appointment, e)}
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Add the reschedule modal */}
      {isRescheduleModalOpen && appointmentToReschedule && (
        <div className="reschedule-modal-overlay">
          <div className="reschedule-modal" ref={rescheduleModalRef}>
            <div className="reschedule-modal-header">
              <h3>Reschedule Appointment</h3>
              <button className="close-button" onClick={handleCancelReschedule}>&times;</button>
            </div>
            
            {rescheduleError && (
              <div className="reschedule-error">
                {rescheduleError}
              </div>
            )}
            
            <div className="patient-info-section">
              <strong>Patient:</strong> {
                patients.find(p => p._id === appointmentToReschedule.patientId)?.name || 
                'Unknown Patient'
              }
            </div>
            
            <form onSubmit={handleRescheduleSubmit} className="reschedule-form">
              <div className="form-group">
                <label htmlFor="appointmentDate">Date</label>
                <input 
                  type="date" 
                  id="appointmentDate" 
                  value={newAppointmentDate} 
                  min={today}
                  onChange={(e) => setNewAppointmentDate(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="appointmentTime">Start Time</label>
                <input 
                  type="time" 
                  id="appointmentTime" 
                  value={newAppointmentTime} 
                  onChange={(e) => setNewAppointmentTime(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="appointmentEndTime">End Time</label>
                <input 
                  type="time" 
                  id="appointmentEndTime" 
                  value={newEndTime} 
                  onChange={(e) => setNewEndTime(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={handleCancelReschedule}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={rescheduleLoading}
                >
                  {rescheduleLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;