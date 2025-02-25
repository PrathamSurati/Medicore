import './Title.css'; 
import PropTypes from 'prop-types';

const TitleComponent = ({ title, setTitle }) => {
  return (
    <div className="section">
      <h2>Title</h2>
      <input
        type="text"
        placeholder="Prescription Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
  );
};

TitleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired
};

export default TitleComponent;