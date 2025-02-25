import './NextVisit.css'; // Import the CSS file
import PropTypes from 'prop-types';

const NextVisitComponent = ({ date, setDate }) => {
  return (
    <div className="section">
      <label>Next Visit</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
    </div>
  );
};

NextVisitComponent.propTypes = {
    date: PropTypes.string.isRequired,
    setDate: PropTypes.func.isRequired
};


export default NextVisitComponent;