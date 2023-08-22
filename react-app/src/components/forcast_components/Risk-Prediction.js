import axios from "axios";
import { useState, useEffect } from "react";

const RiskPrediction = ({userInfo}) => {

    const [todayInput, setTodayInput] = useState(null) // object hold user today's input
    const [riskPrediction, setRiskPrediction] = useState(null) // object hold risk prediction


    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const generateReport = () => {
        if (todayInput !== null) {
            axios.post("http://localhost:4002/risk_prediction", todayInput[today])
            .then((response) => {
                setRiskPrediction(response.data)
            })
            .catch((error) => console.log(error))
        }
        // store the prediction result into database
        //
    }
    
    // calculate today's string in format year-month-day
    const today = formatDate(new Date().toDateString())

    // when load the component, get user's input
    useEffect(() => {
        axios.get("http://localhost:4001/get_logs_by_date", {params:{email:userInfo.email, date:today}})
        .then((response) => {
            setTodayInput(response.data);
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                console.error("Server returned a 401 error");
                // Handle the 500 error of backend
            } else {
                console.log("not data been given for today")
            }
            setTodayInput(null);
            return;
        });
    }, [])

    useEffect(() => {
        // if (todayInput !== null) {
        //     axios.post("http://localhost:4002/risk_prediction", todayInput[today])
        //     .then((response) => {
        //         setRiskPrediction(response.data)
        //     })
        //     .catch((error) => console.log(error))
        // }
        setRiskPrediction(null) // if today's date change, user need to regenerate their report
    }, [todayInput])

    

    return (
    <div>
        {!riskPrediction ? (
            <button onClick={generateReport}>Generate my report</button>
        ) : (
            <>
                <p>diabetes risk is {riskPrediction.diabetes_risk}</p>
                <p>hypertension risk is {riskPrediction.hypertension_risk}</p>
                <p>fever risk is {riskPrediction.fever_risk}</p>
                <p>depression risk is {riskPrediction.depression_risk}</p>
                <p>health index is {riskPrediction.health_index}</p>
            </>
        )}
    </div>
);

}

export default RiskPrediction