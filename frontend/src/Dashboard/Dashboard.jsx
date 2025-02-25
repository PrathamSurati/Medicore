import { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayPatients: 0,
    pendingBills: 0,
    totalRevenue: 0
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/patients");
        const data = await res.json();
        const total = data.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = data.filter((p) => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= today; // Same logic as your Sidebar
        }).length;

        // Sort and slice recent patients
        const sortedPatients = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latestPatients = sortedPatients.slice(0, 4);

        setStats((prev) => ({
          ...prev,
          totalPatients: total,
          todayPatients: todayCount
        }));
        setRecentPatients(latestPatients);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchPatientStats();

    // Sample data until API is ready
    setStats((prev) => ({
      ...prev,
      pendingBills: 8,
      totalRevenue: 256000
    }));

    setRecentBills([
      { id: 1, patient: 'John Doe', amount: 500, status: 'Paid' },
      { id: 2, patient: 'Jane Smith', amount: 300, status: 'Pending' },
      { id: 3, patient: 'Mike Johnson', amount: 450, status: 'Paid' }
    ]);
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
            <h3>Today is Patients</h3>
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
            <p className="stat-value">₹{stats.totalRevenue}</p>
            <p className="stat-label">Current period</p>
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
            {recentPatients.map((patient, index) => (
              <div key={patient._id || `patient-${index}`} className="activity-item">
                <div className="activity-icon patient">👤</div>
                <div className="activity-content">
                  <h4>{patient.name}</h4>
                  <p>{patient.type}</p>
                  <small>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : ""}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-bills">
          <div className="section-header">
            <h3>Recent Bills</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="bills-list">
            {recentBills.map(bill => (
              <div key={bill.id} className="bill-item">
                <div className="bill-info">
                  <h4>{bill.patient}</h4>
                  <p>₹{bill.amount}</p>
                </div>
                <span className={`status ${bill.status.toLowerCase()}`}>
                  {bill.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;