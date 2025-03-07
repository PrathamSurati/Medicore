import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SideBar from './components/Sidebar';
import Navbar from './components/Navbar/Navbar';
import AddPatientModal from './components/New patient/AddPatient';
import './App.css';
import ReportGenerator from './components/Report/ReportGenerator';
import Settings from './settings/Settings';
import Dashboard from './Dashboard/Dashboard';
import AddBills from './Billing/Components/AddBills';
import Billing from "./Billing/Billing";
import PatientDetails from './components/PatientDetails';
// Import admin routes
// import AdminRoutes from './AdminRoutes';

// Wrapper component to access location
const AppContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Redirect to home page on page reload
  useEffect(() => {
    // This will detect page reload (not navigation within the app)
    const handleBeforeUnload = () => {
      // Store a flag in sessionStorage to indicate reload
      sessionStorage.setItem('pageReloaded', 'true');
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check if the page was reloaded
    const wasReloaded = sessionStorage.getItem('pageReloaded') === 'true';
    
    if (wasReloaded && location.pathname !== '/') {
      // Clear the flag
      sessionStorage.removeItem('pageReloaded');
      // Redirect to home
      navigate('/');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, location.pathname]);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const resetActiveSection = () => {
    setActiveSection(null);
  };

  const handleSidebarToggle = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar 
        onAddClick={handleAddClick} 
        resetActiveSection={resetActiveSection} 
      />
      <SideBar 
        onAddClick={handleAddClick}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        navigate={navigate}
        onToggle={handleSidebarToggle}
      />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<ReportGenerator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/AddBills" element={<AddBills />} />
          <Route path="/patients/:patientId" element={<PatientDetails />} />
          
          {/* Include other app routes as needed */}
          
          {/* This route handles all admin/* paths and drops back into normal routing for non-admin paths */}
          {/* <Route path="/admin" element={<AdminRoutes />} /> */}
        </Routes>
      </div>
      <AddPatientModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;