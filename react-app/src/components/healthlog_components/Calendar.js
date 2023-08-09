import React, { useEffect, useState } from "react";
import "./Calendar.css";
import axios from 'axios';

function Calendar({userInfo}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [healthStatus, setHealthStatus] = useState({});
  const [showHealthStatusForm, setShowHealthStatusForm] = useState(false);
  const [healthStatusInput, setHealthStatusInput] = useState({
    email: "",
    username: "",
    heart_rate: "",
    weight: "",
    blood_pressure: "",
    body_temperature: "",
    hours_of_sleep: "",
    stress_level: "",
    water_intake: "",
    diet: "",
    exercise_minutes: "",
    mood: "",
    weather_condition: "",
  });

  const [healthStatus_db, setHealthStatus_db] = useState({}) // hooks to stores data from database

  useEffect(() => {
    axios
      .get("http://localhost:4001/get_logs", {params:{email:userInfo.email}})
      .then((response) => {
        setHealthStatus_db(response.data)
      }) 
      .catch((error) => {
        console.log(error)
      })
  }, [userInfo.email])

  const handleDateClick = (date) => {
    // if the form is open, not allow to select anymore date from calandar
    if (!showHealthStatusForm){
      setSelectedDate(date);
    }
  };

  const handleHealthStatusInputChange = (e) => {
    setHealthStatusInput({
      ...healthStatusInput,
      [e.target.name]: e.target.value,
    });
  };

  const handleReportHealthStatus = () => {
    console.log(selectedDate)
    setShowHealthStatusForm(true);
  };

  const handleModifyRecord = () => {
    console.log(selectedDate)
    setShowHealthStatusForm(true);
  };
  /**function delete data from database and frontend input*/
  const handleDeleteRecord = async() =>{

    console.log("Selected date is", selectedDate);

    const updatedHealthStatus = {...healthStatus} // shallow copy the healthStatus for deletion
    delete updatedHealthStatus[selectedDate.toDateString()] // delete the object based on key
    
    // delete from db
    await axios
    .delete("http://localhost:4001/delete_logs", {params: {email:userInfo.email, date:selectedDate.toDateString()}})
    .then((response) => {console.log("successfully delete from db")})
    .catch((error) => {console.log(error)})

    // get update HealthStatus_db
    await axios
    .get("http://localhost:4001/get_logs", {params:{email:userInfo.email}})
    .then((response) => {setHealthStatus_db(response.data)})
    .catch((error) =>{console.log(error)})

    setHealthStatus(updatedHealthStatus) // update the status
  }
  
  /**
   * This function is invoked when user submit their health status
   */
  const handleSubmitHealthStatus = (e) => {
    e.preventDefault();

    if (selectedDate) {
      const updatedHealthStatus = {
        ...healthStatus,
        [selectedDate.toDateString()]: {
          ...healthStatusInput,
        },
      };

      // console.log(healthStatus)
      // console.log(updatedHealthStatus)

      const requestData = {
        email: userInfo.email,
        username: (userInfo.name).toLowerCase(),
        date: selectedDate.toDateString(),
        heart_rate: healthStatusInput.heart_rate,
        weight: healthStatusInput.weight,
        blood_pressure: healthStatusInput.blood_pressure,
        body_temperature: healthStatusInput.body_temperature,
        hours_of_sleep: healthStatusInput.hours_of_sleep,
        stress_level: healthStatusInput.stress_level,
        water_intake: healthStatusInput.water_intake,
        diet: healthStatusInput.diet,
        exercise_minutes: healthStatusInput.exercise_minutes,
        mood: healthStatusInput.mood,
        weather_condition: healthStatusInput.weather_condition,
    };
      
       axios.post('http://localhost:4001/logs_insertion', requestData)
      .then(response => {
        console.log(requestData);
        console.log('Data inserted successfully!');
      })
      .catch(error => {
        console.error('Error:', error);
      });

      setHealthStatus(updatedHealthStatus);
      //setSelectedDate(null);
      setHealthStatusInput({
        email: "",
        username: "",
        heart_rate: "",
        weight: "",
        blood_pressure: "",
        body_temperature: "",
        hours_of_sleep: "",
        stress_level: "",
        water_intake: "",
        diet: "",
        exercise_minutes: "",
        mood: "",
        weather_condition: "",
      });
      setShowHealthStatusForm(false);
    }
  };
  
  /**
   * This function is invoked when user go to the previous page of calandar
   */
  const handlePreviousMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // console.log(currentMonth)
    // console.log(currentYear)

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1; // if current month is January, the previous month is December, else, decrement based on current value
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const newDate = new Date(previousYear, previousMonth);
    // console.log(newDate)
    setCurrentDate(newDate); 
  };
  
  /**
   * This function is invoked when user go to next page of canlandar
   */
  const handleNextMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1; // if current month is December, next month is January
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const newDate = new Date(nextYear, nextMonth);
    setCurrentDate(newDate);
  };

  const generateCalendarDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const calendarDates = [];

    // Generate the previous month's days
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevLastDayOfMonth = new Date(prevMonthYear, prevMonth + 1, 0);
    const prevDaysAfterMonth = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = prevLastDayOfMonth.getDate() - prevDaysAfterMonth + 1; i <= prevLastDayOfMonth.getDate(); i++) {
      const prevDate = new Date(prevMonthYear, prevMonth, i);
      calendarDates.push(prevDate);
    }

    // Generate the current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      calendarDates.push(currentDate);
    }

    // Generate the next month's days
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextDaysBeforeMonth = 35 - calendarDates.length; // display 35 dates on calandar
    for (let i = 1; i <= nextDaysBeforeMonth; i++) {
      const nextDate = new Date(nextMonthYear, nextMonth, i);
      calendarDates.push(nextDate);
    }

    return calendarDates;
  };

  const calendarDates = generateCalendarDates();

  return (
    <div className="calendar-container">
      <h1>Calendar</h1>
      <div className="calendar">
        <div className="calendar-header">
          <button className="today-btn" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <h2 className="current-month">
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="calendar-navigation">
          <button className="prev-btn" onClick={handlePreviousMonth}>
            &lt;
          </button>
          <button className="next-btn" onClick={handleNextMonth}>
            &gt;
          </button>
        </div>
        <div className="calendar-dates">
          {calendarDates.map((date) => {
            const dateStr = date.toDateString();
            const healthStatusReport =  healthStatus[dateStr] || healthStatus_db[dateStr];

            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`calendar-date${isToday ? " today" : ""}${isSelected ? " selected" : ""}`}
              >
                <div className="date">{date.getDate()}</div>
                {healthStatusReport && (
                  <div className="health-status">
                    <p>Heart Rate: {healthStatusReport.heart_rate}</p>
                    <p>Weight: {healthStatusReport.weight}</p>
                    <p>Blood Pressure: {healthStatusReport.blood_pressure}</p>
                    <p>Body Temperature: {healthStatusReport.body_temperature}</p>
                    <p>Hour of Sleep: {healthStatusReport.hours_of_sleep}</p>
                    <p>Stress Level: {healthStatusReport.stress_level}</p>
                    <p>Water Intake: {healthStatusReport.water_intake}</p>
                    <p>Diet: {healthStatusReport.diet}</p>
                    <p>Exercise Minutes: {healthStatusReport.exercise_minutes}</p>
                    <p>Mood: {healthStatusReport.mood}</p>
                    <p>Weather: {healthStatusReport.weather_condition}</p>
                  </div>
                )}
                {!healthStatusReport && (
                  <button
                    className="report-health-btn"
                    onClick={() => handleReportHealthStatus()}
                  >
                    Report Health
                  </button>
                )}
                {healthStatusReport && (
                  <button
                    className="modify-record-btn"
                    onClick={() => handleModifyRecord()}
                  >
                    Modify Record
                  </button>
                )}
                {healthStatusReport && selectedDate && date.toDateString() === selectedDate.toDateString() && (
                  <button
                    className="modify-record-btn"
                    onClick={() => handleDeleteRecord()}
                  >
                    Delete Record
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {showHealthStatusForm && (
        <div className="health-status-form">
          {healthStatus[selectedDate.toDateString()] ? (
          <h2>Modify your record</h2> )
          : (<h2>Record your health</h2> )
          }
         <form onSubmit={handleSubmitHealthStatus}>
            <label>
              Heart Rate:
              <input
                type="number"
                name="heart_rate"
                value={healthStatusInput.heart_rate}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Weight:
              <input
                type="number"
                name="weight"
                value={healthStatusInput.weight}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Blood Pressure:
              <input
                type="text"
                name="blood_pressure"
                value={healthStatusInput.blood_pressure}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Body Temperature:
              <input
                type="number"
                name="body_temperature"
                value={healthStatusInput.body_temperature}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Hours of Sleep:
              <input
                type="number"
                name="hours_of_sleep"
                value={healthStatusInput.hours_of_sleep}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Stress Level:
              <input
                type="number"
                name="stress_level"
                value={healthStatusInput.stress_level}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Water Intake:
              <input
                type="number"
                name="water_intake"
                value={healthStatusInput.water_intake}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Diet:
              <select
                name="diet"
                value={healthStatusInput.diet}
                onChange={handleHealthStatusInputChange}
              > 
                <option>Choose Your Diet Type</option>
                <option value="only meat">Only Meat</option>
                <option value="only vegetables">Only Vegetables</option>
                <option value="meat and vegetables">Meat and Vegetables</option>
              </select>
            </label>
            <label>
              Exercise Minutes:
              <input
                type="number"
                name="exercise_minutes"
                value={healthStatusInput.exercise_minutes}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Mood:
              <input
                type="text"
                name="mood"
                value={healthStatusInput.mood}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            <label>
              Weather Condition:
              <input
                type="text"
                name="weather_condition"
                value={healthStatusInput.weather_condition}
                onChange={handleHealthStatusInputChange}
              />
            </label>
            {healthStatus[selectedDate.toDateString()] ? (
              <button type="submit">Modify</button>
            ) : (
              <button type="submit">Record</button>
            )}
            <button onClick={() => setShowHealthStatusForm(false)}>Close</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Calendar;
