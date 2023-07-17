import { Link } from "react-router-dom";

/**
 * This function renders the links of our feature components
 */
function Navbar({children }) {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/healthlog">Health Logs</Link>
          </li>
          <li>
            <Link to="/visualization">Health Visualization</Link>
          </li>
          <li>
            <Link to="/forcast">Wellness Forecast</Link>
          </li>
          <li>
            <Link to="/chat">Health Assistant</Link>
          </li>
        </ul>
        {children} 
      </nav>
    </header>
  );
}

export default Navbar;
