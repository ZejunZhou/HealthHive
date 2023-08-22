import React from 'react';
import styles from './oa.module.css';
import healthImage from './images/health.png';

function CombinedSection() {
  return (
    <div>
      {/* Title Section */}
      <section id={styles.title}>
        <div className={styles.container}>
          <nav className={`navbar navbar-expand-lg navbar-light ${styles.navbar}`}>
            <a className={styles['navbar-brand']} href="/">HealthHive</a>
            <button className={`navbar-toggler ${styles.toggler}`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${styles.collapse}`} id="navbarNavDropdown">
              <ul className={`navbar-nav ms-auto ${styles.nav}`}>
                <li className={`nav-item ${styles['nav-item']}`}>
                    <a className={`nav-link ${styles['nav-link']}`} href="mailto:zhouzejun1812@icloud.com">Contact</a>
                </li>
                <li className={`nav-item ${styles['nav-item']}`}>
                  <a className={`nav-link ${styles['nav-link']}`} href="/login">Sign in</a>
                </li>
                <li className={`nav-item ${styles['nav-item']}`}>
                  <a className={`nav-link ${styles['nav-link']}`} href="/login">Sign up</a>
                </li>
              </ul>
            </div>
          </nav>
          
        <div className='row'>
          <div className="col-lg-6 col-md-12">
            <h1>Unlock Personalized Health Insights with HealthHive.</h1>
            <button type="button" className={`btn btn-light btn-lg ${styles['download-button']}`}>
                <a className={styles['download-link']} href='/login'>Get Start Now</a>
            </button>
          </div>
          <div className="col-lg-6 col-md-12">
            <img className={styles['title-img']} src={healthImage} alt="health.png" />
          </div>
        </div>
      </div>
      </section>

      {/* Features Section */}
      <section id={styles.features}>
        <div className={styles.container}>
          <div className='row'>
            <div className={`col-lg-3 col-md-6 col-sm-12 ${styles['feature-content']}`}>
              <i className={`fa-regular fa-calendar-days fa-4x ${styles['feature-icon']}`}></i>
              <h3 className={styles['feature-heading']}>Health Logs</h3>
              <p className={styles['feature-paragraph']}>Log and monitor your daily health metrics.</p>
            </div>
            <div className={`col-lg-3 col-md-6 col-sm-12 ${styles['feature-content']}`}>
              <i className={`fa-solid fa-chart-simple fa-4x ${styles['feature-icon']}`}></i>
              <h3 className={styles['feature-heading']}>Visualization</h3>
              <p className={styles['feature-paragraph']}>Interactive charts for health insights.</p>
            </div>
            <div className={`col-lg-3 col-md-6 col-sm-12 ${styles['feature-content']}`}>
              <i className={`fa-solid fa-heart fa-4x ${styles['feature-icon']}`}></i>
              <h3 className={styles['feature-heading']}>Wellness Forecast</h3>
              <p className={styles['feature-paragraph']}>Personalized health forecasts based on your health data</p>
            </div>
            <div className={`col-lg-3 col-md-6 col-sm-12 ${styles['feature-content']}`}>
              <i className={`fa-solid fa-circle-check fa-4x ${styles['feature-icon']}`}></i>
              <h3 className={styles['feature-heading']}>Chat Assistant</h3>
              <p className={styles['feature-paragraph']}>AI-driven health advice and tips.</p>
            </div>
          </div>
        </div>
      </section>

    <footer id={styles["footer"]}>
        <p>© Copyright Zejun Zhou @ 2023</p>
    </footer>

    </div>
  );
}

export default CombinedSection;

