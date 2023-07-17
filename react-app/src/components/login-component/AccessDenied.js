import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5); // initial waiting countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000); // countdown minus1 every sec

    // function clear time interval and back to homepage
    const timeout = setTimeout(() => {
      clearInterval(timer);
      navigate("/");
    }, 5000); // back to homepage in 5 sec, matched with countdown display on page

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []); 

  return (
    <div>
      <h1>You should log in to access your data.</h1>
      <p>Redirecting to homepage in {countdown} seconds...</p>
    </div>
  );
};

export default AccessDenied;

