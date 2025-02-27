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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch patients data
        const patientsResponse = await axios.get(`${API_URL}/patients`);
        const patientsData = patientsResponse.data;
        
        // Calculate total patients
        const totalPatients = patientsData.length;

        // Calculate today's patients
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayPatients = patientsData.filter((p) => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= today;
        }).length;

        // Sort and slice recent patients
        const sortedPatients = [...patientsData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latestPatients = sortedPatients.slice(0, 4);
        setRecentPatients(latestPatients);

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

        // Get recent bills
        const sortedBills = [...billsData].sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        const latestBills = sortedBills.slice(0, 3).map(bill => ({
          id: bill._id,
          patient: bill.patientName,
          amount: bill.amount,
          status: bill.status
        }));
        
        setRecentBills(latestBills);

        // Update all stats at once
        setStats({
          totalPatients,
          todayPatients,
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
                <h3>Today's Patients</h3>
                <p className="stat-value">{stats.todayPatients}</p>
                <p className="stat-label">Patients visited today</p>
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

          <div className="dashboard-content">
            <div className="recent-activity">
              <div className="section-header">
                <h3>Recent Patients</h3>
                <button className="view-all">View All</button>
              </div>
              <div className="activity-list">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient, index) => (
                    <div key={patient._id || `patient-${index}`} className="activity-item">
                      <div className="activity-icon patient">👤</div>
                      <div className="activity-content">
                        <h4>{patient.name}</h4>
                        <p>{patient.type || patient.category || 'Patient'}</p>
                        <small>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : ""}</small>
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
                <button className="view-all">View All</button>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;