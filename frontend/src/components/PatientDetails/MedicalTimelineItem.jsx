import PropTypes from 'prop-types';
import './MedicalTimelineItem.css';

const MedicalTimelineItem = ({ visit, isActive, onClick }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div 
      className={`timeline-item ${isActive ? 'active' : ''}`} 
      onClick={() => onClick(visit._id)}
    >
      <div className="timeline-marker"></div>
      <div className="timeline-content">
        <h4 className="timeline-title">{visit.type || 'Medical Visit'}</h4>
        <div className="timeline-date">{formatDate(visit.date || visit.createdAt)}</div>
        {visit.doctor && <div className="timeline-doctor">Dr. {visit.doctor}</div>}
        {visit.summary && <p className="timeline-summary">{visit.summary}</p>}
      </div>
    </div>
  );
};

MedicalTimelineItem.propTypes = {
  visit: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    doctor: PropTypes.string,
    summary: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

MedicalTimelineItem.defaultProps = {
  isActive: false,
};

export default MedicalTimelineItem;
