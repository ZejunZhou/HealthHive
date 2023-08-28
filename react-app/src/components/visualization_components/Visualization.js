import axios from "axios";
import { useState, useEffect } from "react";
import HealthDataChart from "./HealthDataChart";
import styles from './HealthDataChart.module.css'

function Visualization({ userInfo }) {
    const [dataArray, setDataArray] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState("heart_rate"); // default metric is heart_rate
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("daily"); 
    const [displayedData, setDisplayedData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("")
    const [userInputStartDate, setUserInputStartDate] = useState("")
    const [userInputEndDate, setUserInputEndDate] = useState("")

    const getAllData = () => {
        setLoading(true);
        setError(null);

        axios.get("http://localhost:4001/get_single_logs", {
            params: { email: userInfo.email, metric: selectedMetric }
        })
        .then((response) => {
            const data = response.data;
            const dataArray = Object.keys(data).map(date => ({
                date,
                ...data[date]
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
            setDataArray(dataArray);
            if (dataArray.length > 0) {
                setStartDate(dataArray[0].date);
                setEndDate(dataArray[dataArray.length - 1].date);
                setUserInputStartDate(dataArray[0].date)
                setUserInputEndDate(dataArray[dataArray.length - 1].date)
            }
        })
        .catch((error) => {
            console.log("visualization fetch data error from db");
            setError("Failed to fetch data. Please try again.");
        })
        .finally(() => {
            setLoading(false);
        });
    };

const getDateByDateRange = () => {
     setLoading(true);
     setError(null);
     axios.get("http://localhost:4001/get_single_logs_by_date", {params:{ email: userInfo.email, metric: selectedMetric, startDate:userInputStartDate, endDate:userInputEndDate}})
     .then((response) => {
        const data = response.data;
        const dataArray = Object.keys(data).map(date => ({
                date,
                ...data[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        setDataArray(dataArray);
        if (dataArray.length > 0) {
            setUserInputStartDate(dataArray[0].date)
            setUserInputEndDate(dataArray[dataArray.length - 1].date)
        }
     })
     .catch((error) => {
        console.log("visualization fetch data error from db");
        setError("Failed to fetch data. Please try again.");
    })
    .finally(() => {
        setLoading(false);
    });
}

const aggregateDataCalculation = (data, range) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (range === "daily") return data;
    const aggregatedData = {};

    data.forEach(entry => {
        const date = new Date(entry.date);
        let key;
        if (range === "monthly") {
            key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        } else if (range === "yearly") {
            key = date.getFullYear().toString();
        }

        if (!aggregatedData[key]) {
            aggregatedData[key] = { date: key, count: 0 }; // Initialize with count 0
        }

        Object.keys(entry).forEach(metric => {
            if (metric !== "date") {
                if (metric === "blood_pressure") {
                    const [high, low] = entry[metric].split("/").map(Number);
                    aggregatedData[key].high = (aggregatedData[key].high || 0) + high;
                    aggregatedData[key].low = (aggregatedData[key].low || 0) + low;
                } else {
                    const value = Number(entry[metric]);
                    if (!isNaN(value)) {
                        aggregatedData[key][metric] = (aggregatedData[key][metric] || 0) + value;
                    }
                }
            }
        });
        aggregatedData[key].count += 1;
    });

    return Object.keys(aggregatedData).map(key => {
        const entry = aggregatedData[key];
        Object.keys(entry).forEach(metric => {
            if (metric !== "date" && metric !== "count" && metric !== "high" && metric !== "low" && typeof entry[metric] === 'number') {
                entry[metric] = Math.round(entry[metric] / entry.count);
            }
        });

        if (entry.high && entry.low) {
            entry.blood_pressure = `${Math.round(entry.high / entry.count)}/${Math.round(entry.low / entry.count)}`;
            delete entry.high;
            delete entry.low;
        }

        return { date: key, ...entry };
    });
}

    // Use useEffect to load heart rate data by default 
    useEffect(() => {
        getAllData();
    }, [selectedMetric]); 

    useEffect(() => {
        getDateByDateRange();
    }, [userInputStartDate, userInputEndDate])

    useEffect(() => {
        const result = aggregateDataCalculation(dataArray, timeRange);
        setDisplayedData(result)
        console.log("the display data is ", displayedData)
    }, [timeRange, dataArray])

    useEffect(() => {
    if (userInputStartDate && userInputEndDate) {
        const start = new Date(userInputStartDate);
        const end = new Date(userInputEndDate);
        if (end < start) {
            alert("End date should be after start date!");
            setUserInputEndDate(""); // Reset end date
        }
    }
}, [userInputStartDate, userInputEndDate]);



    //console.log(displayedData)

    const checkDate = (inputDateStr, startDateStr, endDateStr) => {
        if (inputDateStr !== null && startDateStr !== null ) {
            const inputDate = new Date(inputDateStr);
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr)
            // make sure input date is between start date and endDate
            if (inputDate >= startDate && inputDate <= endDate)  {
                return true;
            }else{
                alert("your input date is not valid")
                return false;
            }
        }else{
            alert("an error has occurred when you input your date")
            return false;
        }
    }



    return (
        <div>
        <h1 className={styles['header']}>Health Visualization</h1>
        <div className={styles['search-bar']}>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className={`${styles['visual-select']}`}>
                <option value="heart_rate">Heart Rate</option>
                <option value="weight">Weight</option>
                <option value="blood_pressure">Blood Pressure</option>
                <option value="body_temperature">Body Temperature</option>
                <option value="hours_of_sleep">Hours of Sleep</option>
                <option value="stress_level">Stress Level</option>
                <option value="water_intake">Water Intake</option>
                <option value="exercise_minutes">Exercise Minutes</option>
            </select>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={styles['visual-select']}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
            <span className={styles['from-label']}>From</span>
            <input 
                type="date" 
                value={userInputStartDate} 
                onChange={(e) => {
                    const valid = checkDate(e.target.value, startDate, endDate);
                    if (valid) {
                        setUserInputStartDate(e.target.value);
                    }
                }} 
            />
            <span className={styles['to-label']}>to</span>
            <input 
                type="date" 
                value={userInputEndDate} 
                onChange={(e) => {
                    const valid = checkDate(e.target.value, startDate, endDate);
                    if (valid) {
                        setUserInputEndDate(e.target.value);
                    }
                }} 
            />
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <HealthDataChart data={displayedData} metric={selectedMetric}/>
        </div>
    );
}

export default Visualization;
