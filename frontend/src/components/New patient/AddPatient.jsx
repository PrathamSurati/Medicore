import  { useState } from "react";
import PropTypes from 'prop-types';
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../../utils"; // Utility functions to handle success/error
import { useNavigate } from "react-router-dom";
import './AddPatient.css'; 

const AddPatientModal = ({ isOpen, onClose }) => {
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

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name, phone, gender, age, dob, city, address, pin
    } = formData;

    if (!name || !phone || !gender || !age || !dob || !city || !address || !pin) {
      return handleError("All fields are required!");
    }

    try {
      const url = "http://localhost:8081/api/newpatient"; // Replace with your actual backend URL
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
       console.log("Server Response: ", result);
      const { success, message, error } = result;

      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/home"); //TODO: Navigate to patients list or dashboard after success
        }, 500);
      } else if (error) {
        handleError(error);
      } else {
        handleError(message);
      }
    } catch (err) {
      console.error(err);
      handleError("Failed to add patient. Please try again later.");            
    }
  };

  const handleClose = () => {
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
        <button className="close-button" onClick={handleClose}>X</button>
        <form onSubmit={handleSubmit} className="patient-form">
          <h2>Add New Patient</h2>

          {/* Patient Name */}
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

          {/* Phone Number */}
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

          {/* Gender */}
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

          {/* Age or DOB */}
          <div className="form-group">
            <label>Age and DOB *</label>
            <div className="age-dob-group">
              <input
                type="number"
                name="age"
                placeholder="Age (Years)"
                value={formData.age}
                onChange={handleInputChange}
              />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
          </div>

         

          {/* Preferred Language */}
          {/* <div className="form-group">
            <label htmlFor="language">Preferred Language</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Other">Other</option>
            </select>
          </div> */}

          {/* City */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="Enter City"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          {/* Pin */}
          <div className="form-group">
            <label htmlFor="pin">Pin</label>
            <input
              type="text"
              id="pin"
              name="pin"
              placeholder="Enter Pin"
              value={formData.pin}
              onChange={handleInputChange}
            />
          </div>

          {/* Additional Details */}
          <p>
            If you want to add more details, <a href="#">Click Here</a>        
          </p>

          {/* Form Actions */}
          <div className="form-actions">

            <button type="submit" className="btn-primary">
              Add & Create Appointment
            </button>
          </div>
        </form>
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
