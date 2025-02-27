import PropTypes from 'prop-types';
import './PatientDetailsNavbar.css';

const PatientDetailsNavbar = ({ patientCount, onTemplateSelect }) => {
  return (
    <div className="patient-details-navbar">
      <div className="patient-info">
        <span>Total Patients: {patientCount}</span>
      </div>
      <div className="template-dropdown">
        <select onChange={(e) => onTemplateSelect(e.target.value)}>
          <option value="">Select Template</option>
          {/* Add options for saved templates here */}
        </select>
      </div>
    </div>
  );
};

PatientDetailsNavbar.propTypes = {
  patientCount: PropTypes.number.isRequired,
  onTemplateSelect: PropTypes.func.isRequired,
};

export default PatientDetailsNavbar;
