import React from 'react';
import { Link } from "react-router-dom";
import styles from './navbar.module.css';

function Navbar({ children }) {
  return (
    <div>
      {/* Sidebar */}
      <div id={styles['sidebar-wrapper']}>
        <div className={styles['sidebar-heading']}>HealthHive</div>
        <div>
          <div><Link className={styles['sidebar-link']} to="/home">Home</Link></div>
          <div><Link className={styles['sidebar-link']} to="/healthlog">Health Logs</Link></div>
          <div><Link className={styles['sidebar-link']} to="/visualization">Health Visualization</Link></div>
          <div><Link className={styles['sidebar-link']} to="/forcast">Wellness Forecast</Link></div>
          <div><Link className={styles['sidebar-link']} to="/chat">Health Assistant</Link></div>
        </div>
      </div>
      {/* /#sidebar-wrapper */}

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
}

export default Navbar;
