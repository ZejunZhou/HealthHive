import React, { useEffect, useState } from "react";
import styles from './Calendar.module.css'
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
    stress_level: "1",
    water_intake: "",
    diet: "Healthy",
    exercise_minutes: "",
    mood: "Happy",
    weather_condition: "Sunny",
  });

  const [healthStatus_db, setHealthStatus_db] = useState({}) // hooks to stores data from database
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');


  useEffect(() => {
    axios
      .get("http://localhost:4001/get_logs", {params:{email:userInfo.email}})
      .then((response) => {
        setHealthStatus(response.data)
        setHealthStatus_db(response.data)
      }) 
      .catch((error) => {
        console.log(error)
      })
  }, [userInfo.email])

  const handleDateClick = (date) => {
    // if form is not open, allow to select date
    if (!showHealthStatusForm){
      setSelectedDate(date);
      const dateStr = formatDate(date.toDateString());
      if (healthStatus[dateStr]) {
        setHealthStatusInput(healthStatus[dateStr]);
        /**check if there is a blood pressure */
        if ((healthStatus[dateStr].blood_pressure)){
           setSystolic((healthStatus[dateStr].blood_pressure).split('/')[0])
           setDiastolic((healthStatus[dateStr].blood_pressure).split('/')[1])
        }else{
           setSystolic('')
           setDiastolic('')
        }
       
      } else {
        // Reset to default values if no record for that day
        setHealthStatusInput({
          email: "",
          username: "",
          heart_rate: "",
          weight: "",
          blood_pressure: "",
          body_temperature: "",
          hours_of_sleep: "",
          stress_level: "1",
          water_intake: "",
          diet: "Healthy",
          exercise_minutes: "",
          mood: "Happy",
          weather_condition: "Sunny",
        });
        setSystolic('')
        setDiastolic('')
      }
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

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

  /**function delete data from database and frontend input*/
  const handleDeleteRecord = async() =>{

    console.log("Selected date is", selectedDate);
    console.log("health status is", healthStatus)
    console.log("healthstatus db is ", healthStatus_db)

    const updatedHealthStatus = {...healthStatus} // shallow copy the healthStatus for deletion
    delete updatedHealthStatus[formatDate(selectedDate.toDateString())] // delete the object based on key
    
    // delete from db
    await axios
    .delete("http://localhost:4001/delete_logs", {params: {email:userInfo.email, date:formatDate(selectedDate.toDateString())}})
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
        [formatDate(selectedDate.toDateString())]: {
          ...healthStatusInput,
        },
      };

      // console.log(healthStatus)
      // console.log(updatedHealthStatus)

      const requestData = {
        email: userInfo.email,
        username: (userInfo.name).toLowerCase(),
        date: formatDate(selectedDate.toDateString()),
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
        diet: "Healthy",
        exercise_minutes: "",
        mood: "Happy",
        weather_condition: "Sunny",
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
  
  // function convert blood pressure into a string Systolic/Diatolic
  const handleSystolicChange = (e) => {
        setSystolic(e.target.value);
        if (diastolic) {
            setHealthStatusInput({
                ...healthStatusInput,
                blood_pressure: `${e.target.value}/${diastolic}`
            });
        }else{
          setHealthStatusInput({
                ...healthStatusInput,
                blood_pressure: ''
            });
        }
    };

    const handleDiastolicChange = (e) => {
        setDiastolic(e.target.value);
        if (systolic) {
            setHealthStatusInput({
                ...healthStatusInput,
                blood_pressure: `${systolic}/${e.target.value}`
            });
        }else{
          setHealthStatusInput({
                ...healthStatusInput,
                blood_pressure: ''
            });
        }
    };

  return (
    <div className={styles["calendar-container"]}>
      <h1 className={styles["calendar-title"]}>Health Calendar</h1>
      <div className={styles["calendar"]}>
        <div className={styles["calendar-header"]}>
          <button className={styles["today-btn"]} onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <h2 className={styles["current-month"]}>
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className={styles["calendar-navigation"]}>
          <button className={styles["prev-btn"]} onClick={handlePreviousMonth}>
            &lt;
          </button>
          <button className={styles["next-btn"]} onClick={handleNextMonth}>
            &gt;
          </button>
        </div>
        <div className={styles["calendar-dates"]}>
          {calendarDates.map((date) => {
            const dateStr = formatDate(date.toDateString());
            const healthStatusReport =  healthStatus[dateStr] || healthStatus_db[dateStr];

            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

             const calandar_css = [
                  styles['calendar-date'],
                  isToday ? styles.today : '',
                  isSelected ? styles.selected : ''
              ].join(' ');

            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={calandar_css}
              >
                <div className={styles["date"]}>{date.getDate()}</div>
                {healthStatusReport && (
                  <div className={styles["health-status"]}>
                    <i className={`fa-regular fa-circle-check`}></i>
                    <p>Successfully reported</p>
                  </div>
                )}
                {!healthStatusReport && (
                  <button
                    className={styles["report-health-btn"]}
                    onClick={() => handleReportHealthStatus()}
                  >
                    Report Health
                  </button>
                )}
                {healthStatusReport && (
                  <button
                    className={styles["modify-record-btn"]}
                    onClick={() => handleModifyRecord()}
                  >
                    Modify Record
                  </button>
                )}
                {healthStatusReport && selectedDate && date.toDateString() === selectedDate.toDateString() && (
                  <button
                    className={styles["modify-record-btn"]}
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
        <div className={styles["health-status-form"]}>
          {healthStatus[formatDate(selectedDate.toDateString())] ? (
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
                placeholder="e.g. 72"
              />
              <span> bpm</span> 
            </label>
            <label>
              Weight:
              <input
                type="number"
                name="weight"
                value={healthStatusInput.weight}
                onChange={handleHealthStatusInputChange}
                placeholder="e.g. 60"
              />
              <span> kg</span>
            </label>
            <label>
              Blood Pressure:
              <input
                type="number"
                placeholder="Systolic"
                value={systolic}
                onChange={handleSystolicChange}
              />
              <span> mmHg</span>
              <span> / </span>
              <input
                  type="number"
                  placeholder="Diastolic"
                  value={diastolic}
                  onChange={handleDiastolicChange}
              />
              <span> mmHg</span>
            </label>
            <label>
              Body Temperature:
              <input
                type="number"
                name="body_temperature"
                value={healthStatusInput.body_temperature}
                onChange={handleHealthStatusInputChange}
                placeholder="e.g. 37"
              />
              <span> °C</span>
            </label>
            <label>
              Hours of Sleep:
              <input
                type="number"
                name="hours_of_sleep"
                value={healthStatusInput.hours_of_sleep}
                onChange={handleHealthStatusInputChange}
                placeholder="e.g. 9"
              />
              <span> hours</span>
            </label>
            <label>
              Stress Level:
              {/* <input
                type="number"
                name="stress_level"
                value={healthStatus[formatDate(selectedDate.toDateString())] ? healthStatus[formatDate(selectedDate.toDateString())].stress_level : healthStatusInput.stress_level}
                onChange={handleHealthStatusInputChange}
                placeholder="Rate your stress level from 1 to 10"
              /> */}
               <select
                name="stress_level"
                value={healthStatusInput.stress_level}
                onChange={handleHealthStatusInputChange}
              > 
                <option disabled>Rate your stress from 1 to 10</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
              <abbr className={styles['custom-abbr']} data-title="Rate from 1 to 10, where 1 is the lowest and 10 is the highest.">How to Rate ?</abbr>
            </label>
            <label>
              Water Intake:
              <input
                type="number"
                name="water_intake"
                value={healthStatusInput.water_intake}
                onChange={handleHealthStatusInputChange}
                placeholder="e.g. 5"
              />
              <span> cups</span>
            </label>
            <label>
              Diet:
              <select
                name="diet"
                value={healthStatusInput.diet}
                onChange={handleHealthStatusInputChange}
              > 
                <option disabled>Choose Your Diet Type</option>
                <option value="healthy">Healthy</option>
                <option value="Unhealthy">Unhealthy</option>
              </select>
            </label>
            <label>
              Exercise Minutes:
              <input
                type="number"
                name="exercise_minutes"
                value={healthStatusInput.exercise_minutes}
                onChange={handleHealthStatusInputChange}
                placeholder="e.g. 60"
              />
              <span>minutes</span>
            </label>
            <label>
              Mood:
              {/* <input
                type="text"
                name="mood"
                value={healthStatusInput.mood}
                onChange={handleHealthStatusInputChange}
              /> */}
              <select
                name="mood"
                value={healthStatusInput.mood}
                onChange={handleHealthStatusInputChange}
              > 
                <option disabled>Rate your mood</option>
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Neutral">Neutral</option>
                <option value="Excited">Excited</option>
                <option value="Tired">Tired</option>
              </select>
            </label>
            <label>
              Weather Condition:
              {/* <input
                type="text"
                name="weather_condition"
                value={healthStatusInput.weather_condition}
                onChange={handleHealthStatusInputChange}
              /> */}
              <select
                name="weather_condition"
                value={healthStatusInput.weather_condition}
                onChange={handleHealthStatusInputChange}
              > 
                <option disabled>Please select your city's weather</option>
                <option value="Sunny">Sunny</option>
                <option value="Rainy">Rainy</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Windy">Windy</option>
                <option value="Snowy">Snowy</option>
              </select>
            </label>
            {healthStatus[formatDate(selectedDate.toDateString())] ? (
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