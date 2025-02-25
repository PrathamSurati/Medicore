import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideBar from './components/Sidebar';
import Navbar from './components/Navbar/Navbar';
import AddPatientModal from './components/New patient/AddPatient';
import './App.css';
import Report from './Report';
import Settings from './settings/Settings';
import Dashboard from './Dashboard/Dashboard';
import AddBills from './Billing/Components/AddBills';
import Billing from "./Billing/Billing";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const resetActiveSection = () => {
    setActiveSection(null);
  };

  return (
    <Router>
      <div className="app-layout">
        <Navbar 
          onAddClick={handleAddClick} 
          resetActiveSection={resetActiveSection} 
        />
        <SideBar 
          onAddClick={handleAddClick}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/AddBills" element={<AddBills />} />
          </Routes>
        </div>
      </div>
      <AddPatientModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Router>
  );
}

export default App;
