import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useEffect } from 'react';
import styles from "./LoginForm.module.css"


const GoogleLogin = ({isLogin, setLogin, userInfo, setUserInfo}) => {

  const navigate = useNavigate();

  /**
   * when authentication is success, use the token to get userInfo 
   * @param {*} codeResponse 
   */
  const handleSuccess = async(codeResponse) => {
    const accessToken = codeResponse.access_token;
    await fetchUserInfo(accessToken);
    //console.log("Login success:", codeResponse);
  }
  /**
   * asyc function get userInfo object by using Google access token
   * @param {*} accessToken 
   */
  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleFailure = (error) => {
    //console.log("Failure", error);
  }
  
  /**
   * Built in function from @react-oauth/google library to enable google authentication
   * reference to https://www.npmjs.com/package/@react-oauth/google
   */
  const login = useGoogleLogin({
    onSuccess: handleSuccess,
    onFailure: handleFailure,
  });
  
  /**
   * hooks that monitor userinfo, is there is userinfo obj, navigate to healthlog
   */
  useEffect(() => {
    //console.log("login verfify is ", userInfo, isLogin)
    if (userInfo && !isLogin) {
      setLogin(true);
      navigate("/healthlog");
    }
    //console.log("userinfo is", userInfo);
  }, [userInfo, isLogin, navigate]);


  return (
   <button type="button" className={`btn btn-light`} onClick={login}> 
      <img className={styles.googleImg} src="https://img.icons8.com/color/16/000000/google-logo.png" alt="google"/>
      <span>Continue with Google</span>
   </button>
  );
};

export default GoogleLogin;
