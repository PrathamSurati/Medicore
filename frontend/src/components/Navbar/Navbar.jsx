import { IoMdAddCircleOutline } from "react-icons/io";
import './Navbar.css';
import logo from "../../assets/images/logo.png";
import PropTypes from 'prop-types';

const Navbar = ({ onAddClick }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img 
          src={logo} 
          alt="Logo" 
          className="nav-logo"
        />
        <span className="brand-name">Med Reports</span>
      </div>
      <div>
        <IoMdAddCircleOutline className="Add_icon" onClick={onAddClick} />
      </div>
    </nav>
  );
};
Navbar.propTypes = {
  onAddClick: PropTypes.func.isRequired,
};

export default Navbar;
