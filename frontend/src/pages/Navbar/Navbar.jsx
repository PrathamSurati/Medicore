import { FaPlus } from "react-icons/fa"; // Replace IoMdAddCircleOutline with FaPlus
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import logo from "../../assets/images/logo.png"
import PropTypes from 'prop-types';

const Navbar = ({ onAddClick, resetActiveSection }) => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand " onClick={resetActiveSection}>
        <img 
          src={logo} 
          alt="Logo" 
          className="nav-logo"
        />
        <span className="brand-name">Med Reports</span>
      </NavLink>
      <div>
        <FaPlus className="Add_icon" onClick={onAddClick} /> {/* Replace IoMdAddCircleOutline with FaPlus */}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onAddClick: PropTypes.func.isRequired,
  resetActiveSection: PropTypes.func.isRequired,
};

export default Navbar;
