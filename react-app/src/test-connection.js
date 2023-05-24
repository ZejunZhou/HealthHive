import React, { useState } from 'react';
import axios from 'axios';

function Calculator() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [result, setResult] = useState(0);

  const performCalculation = (e) => {
    e.preventDefault();

    // Make the API request to your Flask backend
    axios.get('http://localhost:4001/calculate', {
      params: {
        num1: num1,
        num2: num2
      }
    })
    .then(response => {
      // Handle the response from the backend
      const result = response.data.result;
      setResult(result);
    })
    .catch(error => {
      // Handle any errors that occurred during the API request
      console.error('Error:', error);
      // Display an error message to the user or handle the error in an appropriate way
    });
  };

  return (
    <div>
      <p>Testing flask connection in test-connection.js</p>
      <form onSubmit={performCalculation}>
        <input type="number" value={num1} onChange={e => setNum1(e.target.value)} />
        <input type="number" value={num2} onChange={e => setNum2(e.target.value)} />
        <button type="submit">Perform Calculation</button>
      </form>
      <p>Result: {result}</p>
    </div>
  );
}

export default Calculator;
