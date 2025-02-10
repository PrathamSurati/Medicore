import { useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SideBar from './components/Sidebar';
import Navbar from './components/Navbar/Navbar';
import AddPatientModal from './components/New patient/AddPatient';
import './App.css';
import Report from './components/Report';
// import COmplains from './utils/json/complains.json'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar onAddClick={handleAddClick} />
        <SideBar onAddClick={handleAddClick} />
        <div className="app-content">
          <Routes>
            <Route path="/reports" element={<Report />} />
            {/* <Route path="/saveTemplate" element={<div>Saved Templates</div>} /> */}
            {/* <Route path="/reports" element={<COmplains />} /> */}
            {/* Add other routes here */}
          </Routes>
        </div>
      </div>
      <AddPatientModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </BrowserRouter>
  );
}

export default App;
