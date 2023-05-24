import React, { useState } from 'react';
import axios from 'axios';

function Dateform() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [temperature, setTemperature] = useState(0);
  const [message, setMessage] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const requestData = {
      id: id,
      name: name,
      temperature: temperature,
      date: date
    };

    axios.post('http://localhost:4001/insert-data', requestData)
      .then(response => {
        setMessage('Data inserted successfully!');
      })
      .catch(error => {
        setMessage('Error inserting data.');
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <h1>Data Insertion</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>id:</label>
          <input type="text" value={id} onChange={e => setId(e.target.value)} />
        </div>
        <div>
          <label>date:</label>
          <input type="text" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Temperature:</label>
          <input type="number" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
        </div>
        <button type="submit">Insert Data</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Dateform;
