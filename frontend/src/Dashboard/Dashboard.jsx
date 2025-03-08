import { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    pendingBills: 0,
    totalRevenue: 0
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  // API URL
  const API_URL = 'http://localhost:8081/api';
  
  // Add state variables to control expanded views
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  const [allBills, setAllBills] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch patients data
        const patientsResponse = await axios.get(`${API_URL}/patients`);
        const patientsData = patientsResponse.data;
        
        // Calculate total patients
        const totalPatients = patientsData.length;

        // Fetch appointments to calculate today's patients
        const appointmentsResponse = await axios.get(`${API_URL}/appointments`);
        const appointmentsData = appointmentsResponse.data;
        
        // Calculate today's patients based on appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Find appointments scheduled for today
        const todayAppointments = appointmentsData.filter((appointment) => {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate >= today && appointmentDate < tomorrow;
        });
        
        // Count unique patients with appointments today
        const uniqueTodayPatientIds = new Set();
        todayAppointments.forEach(appointment => {
          if (appointment.patientId) {
            uniqueTodayPatientIds.add(appointment.patientId);
          }
        });
        
        const todayPatients = uniqueTodayPatientIds.size;

        // Create a map of patient IDs to their most recent appointment or visit
        const patientActivityMap = {};
        
        // First, process appointment data
        appointmentsData.forEach(appointment => {
          const patientId = appointment.patientId;
          if (!patientId) return;
          
          const appointmentDate = new Date(appointment.startTime);
          
          if (!patientActivityMap[patientId] || 
              appointmentDate > new Date(patientActivityMap[patientId].date)) {
            patientActivityMap[patientId] = {
              date: appointment.startTime,
              type: 'appointment'
            };
          }
        });
        
        // Then, check for visit dates which may override appointment dates
        patientsData.forEach(patient => {
          if (patient.lastVisitDate) {
            const visitDate = new Date(patient.lastVisitDate);
            const patientId = patient._id;
            
            if (!patientActivityMap[patientId] || 
                visitDate > new Date(patientActivityMap[patientId].date)) {
              patientActivityMap[patientId] = {
                date: patient.lastVisitDate,
                type: 'visit'
              };
            }
          }
        });
        
        // Enrich patient data with their most recent activity
        const patientsWithActivity = patientsData.map(patient => {
          const activity = patientActivityMap[patient._id];
          return {
            ...patient,
            recentActivity: activity || { date: patient.createdAt, type: 'registered' }
          };
        });
        
        // Sort patients by their most recent activity date
        const sortedByActivity = [...patientsWithActivity].sort(
          (a, b) => new Date(b.recentActivity.date) - new Date(a.recentActivity.date)
        );
        
        // Get the 4 most recently active patients for the summary
        const recentlyActivePatients = sortedByActivity.slice(0, 4);
        setRecentPatients(recentlyActivePatients);
        
        // Store all patients for the expanded view
        setAllPatients(sortedByActivity);

        // Fetch bills data
        const billsResponse = await axios.get(`${API_URL}/bills`);
        const billsData = billsResponse.data;

        // Calculate pending bills count
        const pendingBills = billsData.filter(bill => 
          bill.status === 'Pending' || bill.status === 'Overdue'
        ).length;

        // Calculate total revenue (sum of all paid bills)
        const totalRevenue = billsData
          .filter(bill => bill.status === 'Paid')
          .reduce((sum, bill) => sum + (bill.amount || 0), 0);

        // Sort bills by date
        const sortedBills = [...billsData].sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        
        // Get recent bills for summary
        const latestBills = sortedBills.slice(0, 3).map(bill => ({
          id: bill._id,
          patient: bill.patientName,
          amount: bill.amount,
          status: bill.status
        }));
        
        setRecentBills(latestBills);
        
        // Store all bills for expanded view
        setAllBills(sortedBills.map(bill => ({
          id: bill._id,
          patient: bill.patientName,
          amount: bill.amount,
          status: bill.status,
          date: bill.createdAt || bill.date
        })));

        // Update stats
        setStats({
          totalPatients,
          todayPatients: uniqueTodayPatientIds.size,
          pendingBills,
          totalRevenue
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Error logging for API failures
        if (error.response) {
          console.error("API error response:", {
            status: error.response.status,
            data: error.response.data
          });
        } else if (error.request) {
          console.error("No API response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Toggle functions for the expanded views
  const toggleAllPatients = () => {
    setShowAllPatients(!showAllPatients);
    // Close bills view if open
    if (showAllBills) setShowAllBills(false);
  };
  
  const toggleAllBills = () => {
    setShowAllBills(!showAllBills);
    // Close patients view if open
    if (showAllPatients) setShowAllPatients(false);
  };

  // Helper function to format activity type for display
  const formatActivityType = (activity) => {
    if (!activity) return 'N/A';
    
    switch (activity.type) {
      case 'appointment':
        return `Appointment on ${new Date(activity.date).toLocaleDateString()}`;
      case 'visit':
        return `Visited on ${new Date(activity.date).toLocaleDateString()}`;
      case 'registered':
        return `Registered on ${new Date(activity.date).toLocaleDateString()}`;
      default:
        return activity.type;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="date-filter">
          <select defaultValue="today">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-dashboard">Loading dashboard data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon patients">👥</div>
              <div className="stat-content">
                <h3>Total Patients</h3>
                <p className="stat-value">{stats.totalPatients}</p>
                <p className="stat-label">All time patients</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon today">📅</div>
              <div className="stat-content">
                <h3>Today's Appointments</h3>
                <p className="stat-value">{stats.todayPatients}</p>
                <p className="stat-label">Patients scheduled today</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending">📋</div>
              <div className="stat-content">
                <h3>Pending Bills</h3>
                <p className="stat-value">{stats.pendingBills}</p>
                <p className="stat-label">Bills to be collected</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue">💰</div>
              <div className="stat-content">
                <h3>Total Revenue</h3>
                <p className="stat-value">₹{stats.totalRevenue.toFixed(2)}</p>
                <p className="stat-label">All time revenue</p>
              </div>
            </div>
          </div>

          {/* Show expanded view or regular dashboard content */}
          {showAllPatients ? (
            <div className="expanded-view">
              <div className="expanded-header">
                <h2>All Patients</h2>
                <button className="back-button" onClick={toggleAllPatients}>Back to Dashboard</button>
              </div>
              <div className="patients-full-list">
                {allPatients.map((patient, index) => (
                  <div key={patient._id || `patient-${index}`} className="patient-list-item">
                    <div className={`activity-icon patient ${patient.recentActivity.type}`}>
                      {patient.recentActivity.type === 'visit' ? '🩺' : 
                       patient.recentActivity.type === 'appointment' ? '📅' : '👤'}
                    </div>
                    <div className="patient-full-info">
                      <h4>{patient.name}</h4>
                      <div className="patient-details-row">
                        <span>{patient.gender}</span>
                        {patient.age && <span> | Age: {patient.age}</span>}
                        {patient.phone && <span> | Phone: {patient.phone}</span>}
                      </div>
                      <p className="activity-info">{formatActivityType(patient.recentActivity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : showAllBills ? (
            <div className="expanded-view">
              <div className="expanded-header">
                <h2>All Bills</h2>
                <button className="back-button" onClick={toggleAllBills}>Back to Dashboard</button>
              </div>
              <div className="bills-full-list">
                <table className="bills-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBills.map(bill => (
                      <tr key={bill.id} className="bill-list-item">
                        <td>{bill.patient}</td>
                        <td>₹{bill.amount.toFixed(2)}</td>
                        <td><span className={`status ${bill.status.toLowerCase()}`}>{bill.status}</span></td>
                        <td>{new Date(bill.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="dashboard-content">
              <div className="recent-activity">
                <div className="section-header">
                  <h3>Recent Patient Activity</h3>
                  <button className="view-all" onClick={toggleAllPatients}>View All</button>
                </div>
                <div className="activity-list">
                  {recentPatients.length > 0 ? (
                    recentPatients.map((patient, index) => (
                      <div key={patient._id || `patient-${index}`} className="activity-item">
                        <div className={`activity-icon patient ${patient.recentActivity.type}`}>
                          {patient.recentActivity.type === 'visit' ? '🩺' : 
                           patient.recentActivity.type === 'appointment' ? '📅' : '👤'}
                        </div>
                        <div className="activity-content">
                          <h4>{patient.name}</h4>
                          <p>{formatActivityType(patient.recentActivity)}</p>
                          <small>{patient.gender} {patient.age ? `| Age: ${patient.age}` : ''}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No recent patients</div>
                  )}
                </div>
              </div>

              <div className="recent-bills">
                <div className="section-header">
                  <h3>Recent Bills</h3>
                  <button className="view-all" onClick={toggleAllBills}>View All</button>
                </div>
                <div className="bills-list">
                  {recentBills.length > 0 ? (
                    recentBills.map(bill => (
                      <div key={bill.id} className="bill-item">
                        <div className="bill-info">
                          <h4>{bill.patient}</h4>
                          <p>₹{bill.amount.toFixed(2)}</p>
                        </div>
                        <span className={`status ${bill.status.toLowerCase()}`}>
                          {bill.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No recent bills</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;