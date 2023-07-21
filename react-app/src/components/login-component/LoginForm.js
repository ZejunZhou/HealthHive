import React, { useRef } from 'react';
import styles from './LoginForm.module.css';
import GoogleLogin from './GoogleLogin';

const LoginPage = ({ isLogin, setLogin, userInfo, setUserInfo }) => {
  const containerRef = useRef(null);

  const handleSignUpButtonClick = () => {
    containerRef.current.classList.add(styles.rightPanelActive);
  };

  const handleSignInButtonClick = () => {
    containerRef.current.classList.remove(styles.rightPanelActive);
  };

  return (
    <div className={styles.loginFormOuterbox}>
      <div ref={containerRef} className={styles.box}>
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form>
            <h1>Sign up</h1>
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <input type="email" placeholder="Email" required />
            <button className={`${styles.containerButton} btn btn-light`}>Sign up</button>
          </form>
        </div>

        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form>
            <h1>Sign in</h1>
            <input type="text" placeholder="Username" required autoFocus />
            <input type="password" placeholder="Password" required />
            <button className={`${styles.containerButton} btn btn-light`}>Sign in</button>
            <GoogleLogin isLogin={isLogin} setLogin={setLogin} userInfo={userInfo} setUserInfo={setUserInfo} />
          </form>
        </div>

        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1>Let's get started!</h1>
              <p>Already have an account?</p>
              <button id="sign-in-button" className={`btn btn-light`} onClick={handleSignInButtonClick}>
                Sign in
              </button>
            </div>

            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1>No Account Yet?</h1>
              <p>Join us right now!</p>
              <button id="sign-up-button" className={`btn btn-light`} onClick={handleSignUpButtonClick}>
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
