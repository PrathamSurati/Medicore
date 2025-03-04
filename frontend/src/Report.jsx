import { useState, useEffect } from "react";
import axios from 'axios'; // Import axios
import "./Report.css";
import Complains from './utils/json/complains.json';
import DiagnosisData from './utils/json/DiagnosisValue.json';
import MedicineData from './utils/json/medicine.json';

const NewPrescription = () => {
  const [vitals, setVitals] = useState([
    { id: 1, name: "BP", value: "" },
    { id: 2, name: "Pulse", value: "" },
    { id: 3, name: "Temperature", value: "" },
    { id: 4, name: "SpO2", value: "" },
    { id: 5, name: "Height", value: "" },
  ]);

  const [diagnosis, setDiagnosis] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [sampleComplaints, setSampleComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  
  const [inputValue, setInputValue] = useState("");
  const [sampleDiagnosis, setSampleDiagnosis] = useState([]);
  const [filteredDiagnosis, setFilteredDiagnosis] = useState([]);
  const [diagnosisInputValue, setDiagnosisInputValue] = useState("");
  const [sampleMedicines, setSampleMedicines] = useState({});
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [date, setDate] = useState(""); // Define date state
  const [title, setTitle] = useState(""); // Define title state
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [selectedMedicineType, setSelectedMedicineType] = useState("");

  useEffect(() => {
    setSampleComplaints(Complains.medical_complaints);
    setSampleDiagnosis(DiagnosisData.DiagnosisValue);
    const medicines = {};
    const types = new Set();
    MedicineData.medicine.forEach(med => {
      const key = Object.keys(med)[0];
      medicines[key] = med[key];
      if (med[key].Type) {
        types.add(med[key].Type);
      }
      if (med[key].Category) {
        types.add(med[key].Category);
      }
    });
    setSampleMedicines(medicines);
    setMedicineTypes(Array.from(types).sort());
  }, []);

  const getRandomComplaints = () => {
    let shuffled = [...sampleComplaints].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  const handleFocus = () => {
    if (!inputValue) {
      setFilteredComplaints(getRandomComplaints());
    }
  };

  const handleChange = (event) => {
    const query = event.target.value.toLowerCase();
    setInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = sampleComplaints.filter((complaint) =>
        complaint.toLowerCase().includes(query)
      );
      setFilteredComplaints(filtered);
    } else {
      setFilteredComplaints(getRandomComplaints());
    }
  };

  const handleDiagnosisFocus = () => {
    if (!diagnosisInputValue) {
      setFilteredDiagnosis(sampleDiagnosis);
    }
  };

  const handleDiagnosisChange = (event) => {
    const query = event.target.value.toLowerCase();
    setDiagnosisInputValue(event.target.value);

    if (query.length > 0) {
      const filtered = sampleDiagnosis.filter((diag) =>
        diag.toLowerCase().includes(query)
      );
      setFilteredDiagnosis(filtered);
    } else {
      setFilteredDiagnosis(sampleDiagnosis);
    }
  };

  const addVital = () => {
    setVitals([...vitals, { id: Date.now(), name: "", value: "" }]);
  };

  const removeVital = (id) => {
    setVitals(vitals.filter((v) => v.id !== id));
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", when: "", duration: "", Qty: "", Note: "" },
    ]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = medicines.map((m, i) => {
      if (i === index) {
        const updatedMedicine = { ...m, [field]: value };
        if (field === "name" && sampleMedicines[value]) {
          const { when, duration, Qty, Note } = sampleMedicines[value];
          return { ...updatedMedicine, when, duration, Qty, Note };
        }
        return updatedMedicine;
      }
      return m;
    });
    setMedicines(updatedMedicines);
  };

  const handleMedicineTypeChange = (value) => {
    setSelectedMedicineType(value);
    
    if (value) {
      // Debug the medicine filtering
      console.log("Filtering by type:", value);
      console.log("Medicine data:", sampleMedicines);
      
      // Filter medicines by the selected type more explicitly
      const filteredMeds = Object.entries(sampleMedicines)
        .filter(([_, medicineData]) => {
          // Check if the type or category matches (case insensitive)
          const typeMatches = medicineData.Type && 
            medicineData.Type.toLowerCase() === value.toLowerCase();
          const categoryMatches = medicineData.Category && 
            medicineData.Category.toLowerCase() === value.toLowerCase();
          
          return typeMatches || categoryMatches;
        })
        .map(([name]) => name);
      
      console.log("Filtered medicines:", filteredMeds);
      setFilteredMedicines(filteredMeds);
    } else {
      // When no filter is selected, show all medicines
      setFilteredMedicines(Object.keys(sampleMedicines));
    }
  };

  const handleMedicineFocus = (index) => {
    if (selectedMedicineType) {
      // Apply the current type filter if one is selected
      handleMedicineTypeChange(selectedMedicineType);
    } else {
      // Otherwise show all medicines
      setFilteredMedicines(Object.keys(sampleMedicines));
    }
  };

  const handleMedicineInputChange = (event, index) => {
    const query = event.target.value.toLowerCase();
    handleMedicineChange(index, "name", event.target.value);

    if (query.length > 0) {
      let filtered;
      
      if (selectedMedicineType) {
        // If a type is selected, filter by both name AND type
        filtered = Object.entries(sampleMedicines)
          .filter(([name, med]) => {
            const typeMatches = med.Type === selectedMedicineType || 
                               med.Category === selectedMedicineType;
            const nameMatches = name.toLowerCase().includes(query);
            return typeMatches && nameMatches;
          })
          .map(([name]) => name);
      } else {
        // If no type is selected, filter by name only
        filtered = Object.keys(sampleMedicines).filter(med => 
          med.toLowerCase().includes(query)
        );
      }
      
      setFilteredMedicines(filtered);
    } else {
      // When input is cleared, reapply type filter if selected
      handleMedicineTypeChange(selectedMedicineType);
    }
  };

  const handleSubmit = async () => {
      const prescriptionData = {
        vitals,
        complaints,
        diagnosis,
        medicines,
        nextVisit: date, // Use the date state
        title, // Include the title in the prescription data
      };

      // Reset form data after saving
      setVitals([
        { id: 1, name: "BP", value: "" },
        { id: 2, name: "Pulse", value: "" },
        { id: 3, name: "Temperature", value: "" },
        { id: 4, name: "SpO2", value: "" },
        { id: 5, name: "Height", value: "" },
      ]);
      setComplaints([]);
      setDiagnosis([]);
      setMedicines([]);
      setDate(""); // Reset the date input
      setTitle(""); // Reset the title input

    try {
      const response = await axios.post('http://localhost:8081/prescriptions', prescriptionData);
      console.log('Prescription saved successfully:', response.data.message);

      // Handle success (e.g., show a success message, reset form, etc.)
    } catch (error) {
      console.error('Error saving prescription:', error.response ? error.response.data : error.message);

      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="container">
      <h1>New Prescription</h1>
      <div className="section">
        <h2>Title</h2>
        <input
          type="text"
          placeholder="Prescription Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="vitals-section">
        <h2>Vitals</h2>
        {vitals.map((vital) => (
          <div key={vital.id} className="vital-item">
            <input
              type="text"
              placeholder={vital.name || "New vital name"}
              value={vital.name}
              onChange={(e) =>
                setVitals(
                  vitals.map((v) =>
                    v.id === vital.id ? { ...v, name: e.target.value } : v
                  )
                )
              }
            />
            <input
              type="text"
              placeholder="Value"
              value={vital.value}
              onChange={(e) =>
                setVitals(
                  vitals.map((v) =>
                    v.id === vital.id ? { ...v, value: e.target.value } : v
                  )
                )
              }
            />
            <button onClick={() => removeVital(vital.id)}>🗑️</button>
          </div>
        ))}
        <button onClick={addVital}>+ Add Vital</button>
      </div>
      <div className="section">
        <h2>Complaints</h2>
        <input
          type="text"
          placeholder="Type to add complaints..."
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue) {
              setComplaints([...complaints, inputValue]);
              setInputValue("");
            }
          }}
          list="complaints-suggestions"
          style={{ position: 'relative' }}
        />
        <datalist id="complaints-suggestions" style={{ position: 'absolute', top: '100%' }}>
          {filteredComplaints.map((complaint, index) => (
            <option key={index} value={complaint} />
          ))}
        </datalist>
        <div className="tags">
          {complaints.map((c, index) => (
            <span key={index} className="tag">
              {c} <button onClick={() => setComplaints(complaints.filter((_, i) => i !== index))}>x</button>
            </span>
          ))}
        </div>
      </div>
      <div className="section">
        <h2>Diagnosis</h2>
        <input
          type="text"
          placeholder="Type to add diagnosis..."
          value={diagnosisInputValue}
          onChange={handleDiagnosisChange}
          onFocus={handleDiagnosisFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" && diagnosisInputValue) {
              setDiagnosis([...diagnosis, diagnosisInputValue]);
              setDiagnosisInputValue("");
            }
          }}
          list="diagnosis-suggestions"
          style={{ position: 'relative' }}
        />
        <datalist id="diagnosis-suggestions" style={{ position: 'absolute', top: '100%' }}>
          {filteredDiagnosis.map((diag, index) => (
            <option key={index} value={diag} />
          ))}
        </datalist>
        <div className="tags">
          {diagnosis.map((d, index) => (
            <span key={index} className="tag">
              {d} <button onClick={() => setDiagnosis(diagnosis.filter((_, i) => i !== index))}>x</button>
            </span>
          ))}
        </div>
      </div>
      <div className="section">
        <h2>Medicines</h2>
        <div className="medicine-filter">
          <label>Filter by Medicine Type:</label>
          <select 
            value={selectedMedicineType}
            onChange={(e) => handleMedicineTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            {medicineTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          {selectedMedicineType && (
            <span className="filter-indicator">
              Filtering by: {selectedMedicineType} 
              ({filteredMedicines.length} medicines)
            </span>
          )}
        </div>
        <div className="medicine-titles">
          <span>Medicine</span>
          <span>When</span>
          <span>Duration</span>
          <span>Qty</span>
          <span>Note</span>
          <span>Delete</span>
        </div>
        {medicines.map((medicine, index) => (
          <div key={index} className="medicine-item">
            <input
            className="medicine_input"
              type="text"
              placeholder="Medicine"
              value={medicine.name}
              onChange={(e) => handleMedicineInputChange(e, index)}
              onFocus={() => handleMedicineFocus(index)}
              list={`medicine-suggestions-${index}`}
              autoComplete="off" // Add this to prevent browser autocomplete interference
            />
            <datalist id={`medicine-suggestions-${index}`} style={{ position: 'absolute', top: '100%' }}>
              {filteredMedicines.map((med, idx) => (
                <option key={idx} value={med} />
              ))}
            </datalist>
            <input
              type="text"
              placeholder="When"
              value={medicine.when}
              onChange={(e) => handleMedicineChange(index, "when", e.target.value)}
            />
            <input
              type="text"
              placeholder="Duration"
              value={medicine.duration}
              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
            />
            <input
              type="number"
              placeholder="Qty"
              value={medicine.Qty}
              onChange={(e) => handleMedicineChange(index, "Qty", e.target.value)}
            />
            <textarea
              type="text"
              placeholder="Note"
              value={medicine.Note}
              onChange={(e) => handleMedicineChange(index, "Note", e.target.value)}
            />
            <button onClick={() => removeMedicine(index)}>🗑️</button>
          </div>
        ))}
        <button onClick={addMedicine}>+ Add Medicine</button>
      </div>
      <div className="section">
        <label>Next Visit</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /> {/* Added date input */}
      </div>
      <button className="save-button" onClick={handleSubmit}>Save Prescription</button>
    </div>
  );
};

export default NewPrescription;