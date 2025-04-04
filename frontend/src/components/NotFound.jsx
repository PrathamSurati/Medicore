import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">Return to Home</Link>
          <Link to="/dashboard" className="btn-secondary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
