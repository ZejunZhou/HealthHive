import React, { useRef } from 'react';
import styles from './LoginForm.module.css';
import GoogleLogin from './GoogleLogin';
import axios from 'axios';

const LoginPage = ({ isLogin, setLogin, userInfo, setUserInfo}) => {

  const containerRef = useRef(null);

  const signInEmailRef = useRef(null); // reference to signin email
  const signInPasswordRef = useRef(null); // reference to signin password
  const signUpUsernameRef = useRef(null); // reference to signup username
  const signUpPasswordRef = useRef(null); // reference to signup password
  const signUpConfirmRef = useRef(null); // reference to signup confirm password
  const signUpEmailRef = useRef(null); // reference to signup email

  const handleSignUpButtonClick = () => {
    containerRef.current.classList.add(styles.rightPanelActive);
  };

  const handleSignInButtonClick = () => {
    containerRef.current.classList.remove(styles.rightPanelActive);
  };

  const MIN_USERNAME_LENGTH = 3;
  const MIN_PASSWORD_LENGTH = 8;

  const signIn = () => {
    const email = (signInEmailRef.current.value).trim();
    const password = (signInPasswordRef.current.value).trim();
    // check email, password's logics
    if (email === '') {
        alert('Please enter an email address.');
        return;
    }

    // Use a simple regular expression to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        alert(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        return;
    }
    //once pass the verfication, setUserInfo with valid value
    if (email.trim() === '' || password.trim() === ''){
        alert('Please enter both username and password.');
    }else{
        axios.get("http://localhost:4001/get_user", {params:{email:email}})
        .then((response) => {
          const server_password = response.data.password
          const server_email = response.data.email
          // case success, successfully log in
          if (password === server_password && email === server_email) {
            setUserInfo({name: response.data.username, password:response.data.password, email:response.data.email})
          } else {
            alert("your password does not match your account")
            return; 
          }
        })
        .catch((error) => {// case not reqister
            if (error.response && error.response.data.message === "Account not registered") {
                alert("your account has not been registered")
                return;
            } else { // case fetch data error
                console.log(error, "something wrong with fetch db")
            }
        })
    }
  }

  const signUp = () => {
    const username = signUpUsernameRef.current.value
    const password = signUpPasswordRef.current.value
    const confirm = signUpConfirmRef.current.value
    const email = signUpEmailRef.current.value

    // check if username, password, email logics
     if (username === '') {
        alert('Please enter a username.');
        return;
    }

    if (username.length < MIN_USERNAME_LENGTH) {
        alert(`Username must be at least ${MIN_USERNAME_LENGTH} characters long.`);
        return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        alert('Username can only contain letters and numbers.');
        return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        alert(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        return;
    }

    if (confirm !== password){
        alert("Your confirm password does not match your password")
        return;
    }

    if (email === '') {
        alert('Please enter an email address.');
        return;
    }

    // Use a simple regular expression to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // check if username, password email is non-empty
    if (username.trim() === '' || password.trim() === '' || email.trim() === ''){
        alert('Please enter your username, password and email to sign up')
    }else{
         axios.get("http://localhost:4001/get_user", {params:{email:email}})
         .then((response) => {
          // case if we have email in our database
          if (response.data){
            alert("your account has been registered, please do not register more than once")
            return;
          }
         })
         .catch((error) => {
             // case not reqister, get start to register
            if (error.response && error.response.data.message === "Account not registered") {
                 axios.post("http://localhost:4001/user_insertion", {email: email, username: username, password: password})
                .then((response) => {
                  console.log("user data insert successfully")
                  // make sure user info in database and then set to login
                  setUserInfo({name: username, password: password, email:email})
                  })
                .catch((error) => console.log(error, "something wrong with post to db"))
            } else { // case fetch data error
                console.log(error, "something wrong with fetch from db")
            }
        })
    } 
  }

  return (
    <div className={styles.loginFormOuterbox}>
      <div ref={containerRef} className={styles.box}>
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form>
            <h1>Sign up</h1>
            <input type="email" placeholder="Email" ref={signUpEmailRef} />
            <input type="text" placeholder="Username" ref={signUpUsernameRef}/>
            <input type="password" placeholder="Password" ref={signUpPasswordRef} />
            <input type="password" placeholder='Confirm Password' ref={signUpConfirmRef}/>
            <button type="button" className={`${styles.containerButton} btn btn-light`} onClick={signUp}>Sign up</button>
          </form>
        </div>

        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form>
            <h1>Sign in</h1>
            <input type="email" placeholder="Email" autoFocus ref={signInEmailRef}/>
            <input type="password" placeholder="Password" ref={signInPasswordRef}/>
            <button type="button" className={`${styles.containerButton} btn btn-light`} onClick={signIn}>Sign in</button>
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
