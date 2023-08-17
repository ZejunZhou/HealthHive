import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './HealthDataChart.module.css';

const METRIC_DETAILS = {
    heart_rate: { color: "#8884d8", name: "Heart Rate" },
    weight: { color: "#82ca9d", name: "Weight (kg)" },
    blood_pressure: {color: "#8884d8", name: "Blood Pressure"},
    body_temperature: { color: "#ff7300", name: "Body Temp (°C)" },
    hours_of_sleep: { color: "#f5c542", name: "Hours of Sleep" },
    stress_level: {color: "#ff7300", name: "Stress Level"},
    water_intake: {color: "#f5c542", name:"Water Intake"},
    exercise_minutes: {color: "#82ca9d", name: "Exercise Minutes"}
};

const HealthDataChart = ({ data, metric }) => {
    const metricDetail = METRIC_DETAILS[metric];
    let maxY = 100
    let minY = 0 

    let dataKeyForMax = metric; 

    if (metric === 'blood_pressure') {
        data.forEach(item => {
        if (item.blood_pressure && typeof item.blood_pressure === 'string' && item.blood_pressure.includes('/')) {
            const [high, low] = item.blood_pressure.split('/');
            item.blood_pressure_high = high;
            item.blood_pressure_low = low;
        } else {
            //console.warn('Unexpected blood_pressure value:', item.blood_pressure);
        }
    });
    dataKeyForMax = 'blood_pressure_high';
}

    //console.log(data)
    if (!data) {
       return null
    }else{
         minY = Math.min(...data.map(item=>Number(item[dataKeyForMax])));
         maxY = Math.max(...data.map(item => Number(item[dataKeyForMax])));
    }

    return (
        <div className={styles.chartContainer}>
            <h1>Your {metricDetail.name} Data Trends</h1>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[minY, maxY]}/>
                <Tooltip />
                <Legend />
                {metric === 'blood_pressure' ? (
                    <>
                        <Line type="monotone" dataKey="blood_pressure_high" stroke="#8884d8" name="Blood Pressure High" />
                        <Line type="monotone" dataKey="blood_pressure_low" stroke="#82ca9d" name="Blood Pressure Low" />
                    </>
                ) : (
                    <Line type="monotone" dataKey={metric} stroke={metricDetail.color} name={metricDetail.name} />
                )}
            </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HealthDataChart;
