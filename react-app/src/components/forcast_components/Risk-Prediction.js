import axios from "axios";
import { useState, useEffect } from "react";
import styles from './RiskPrediction.module.css';

const RiskPrediction = ({userInfo}) => {

    const [todayInput, setTodayInput] = useState(null) // object hold user today's input
    const [riskPrediction, setRiskPrediction] = useState({diabetes_risk:'37',
                    hypertension_risk:'26',
                    fever_risk:'45',
                    depression_risk:'59',
                    health_index:'80'}) // object hold risk prediction
    const [isButtonDisabled, setIsButtonDisabled] = useState(true); // not allow to click generate report unless user fill all field
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
       setModalVisible(!isModalVisible);
    };



    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // function handle special case of blood pressure 
    const isBloodPressureValid = (bp) => {
        if (!bp) {
            return false;
        }
        const parts = bp.split('/');
        if (parts[0] === "" || parts[1] === "") {
            return false;
        }
        return true;
    }


    // calculate today's string in format year-month-day
    const today = formatDate(new Date().toDateString())

    const generateReport = () => {
        if (todayInput !== null) {
            axios.post("http://localhost:4002/risk_prediction", todayInput[today])
            .then((response) => {
                setRiskPrediction(response.data)
                 // store the prediction result into database
                const request_data = {
                    email:userInfo.email,
                    date:today,
                    diabetes_risk:response.data.diabetes_risk,
                    hypertension_risk:response.data.hypertension_risk,
                    fever_risk:response.data.fever_risk,
                    depression_risk:response.data.depression_risk,
                    health_index:response.data.health_index
                }
                axios.post("http://localhost:4001/insert_prediction", request_data)
                .catch((error) => console.log("insert prediction to db error"))
                    })
                    .catch((error) => console.log(error))
                }
    }

    // when load the component, get user's input
    useEffect(() => {
        axios.get("http://localhost:4001/get_logs_by_date", {params:{email:userInfo.email, date:today}})
        .then((response) => {
            setTodayInput(response.data);
            // check if report filled has filled
            const isAnyFieldEmpty = Object.values(response.data[today]).some(field => field === "") || !isBloodPressureValid(response.data[today].blood_pressure);
            setIsButtonDisabled(isAnyFieldEmpty);
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
    }, [today, userInfo.email])


    // // check if database has today's input
    // useEffect(() => {
    //     axios.get("http://localhost:4001/get_prediction_metrics_by_date", {params:{email:userInfo.email, date:today}})
    //     .then((response) => {
    //         setRiskPrediction(response.data)
    //     })
    //     .catch((error) => {
    //         if (error.response && error.response.data.message === "No Report has generated") {
    //             setRiskPrediction(null)
    //         }else{
    //             console.log(error)
    //         }
    //     })
    // }, [today, userInfo.email])

    const renderProgressBar = (riskValue) => {
        const widthPercentage = `${riskValue}%`;

        let fillerClass; // decide what color to render

        if (riskValue <= 50) {
            fillerClass = styles.healthy;
        } else if (riskValue <= 70) {
            fillerClass = styles.moderate;
        } else {
            fillerClass = styles.risk;
        }

        return (
        <div className={styles.progressBar}>
            <div className={fillerClass} style={{ width: widthPercentage }}></div>
        </div>
        );
  };
    
    

    return (
    <div className={styles.riskPredictionContainer}>
        {!riskPrediction ? (
        <>  
            <h1 className={styles['title']}>Daily Wellness Forcast</h1>
            <div className={styles['initial-container']}>
                <button onClick={generateReport} disabled={isButtonDisabled} className={`btn btn-large ${styles['initial-button']}`}>Generate my report</button>
            </div>
             {isButtonDisabled && <p className={styles['initial-text']}>Please input all health log fields of today to get accurate health report prediction.</p>}
        </>
        ) : (
        <>
            <h1 className={styles['title']}>Your overall today's Health Index is {riskPrediction.health_index}</h1>
            <a onClick={toggleModal} className={styles['modal-link']}>Learn about Your Health Index</a>
            {/*Interpret health index section*/}
            {isModalVisible && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.closeButton} onClick={toggleModal}>&times;</span>
                        <h5>Your Health Index provides an overview of your health status based on your daily health log you have entered. Here's a brief explanation:</h5>
                        <ul>
                            <li>if your health index is above 85, it indicates that your health activities are largely in a healhy range.</li>
                            <li>if your health index is between 70 - 85, it indicates that you need to do can do more work to improve your health activities </li>
                            <li>if your health index is below 70, it indicates that you may need attention on your health activities</li>
                        </ul>
                    </div>
                </div>
            )}
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className={styles.riskItem}>
                        <span>Diabetes Risk</span>
                        {renderProgressBar(riskPrediction.diabetes_risk)}
                        <span>{riskPrediction.diabetes_risk}%</span>
                        </div>
                    </div>
                    <div className="col">
                        <div className={styles.riskItem}>
                        <span>Hypertension Risk</span>
                        {renderProgressBar(riskPrediction.hypertension_risk)}
                        <span>{riskPrediction.hypertension_risk}%</span>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <div className={styles.riskItem}>
                        <span>Fever Risk</span>
                        {renderProgressBar(riskPrediction.fever_risk)}
                        <span>{riskPrediction.fever_risk}%</span>
                        </div>
                    </div>
                    <div className="col">
                        <div className={styles.riskItem}>
                        <span>Depression Risk</span>
                        {renderProgressBar(riskPrediction.depression_risk)}
                        <span>{riskPrediction.depression_risk}%</span>
                        </div>
                    </div>
                </div>
                <div className={`${styles['label-container']}`}>
                    <div className={`row mt-4`} style={{width:'100%'}}>
                        <div className="col">
                            <span>Healthy (0-50%) </span>
                            <div className={`${styles['label-healthy']}`}></div>
                        </div>
                        <div className="col">
                            <span>Moderate (50-70%)</span>
                            <div className={`${styles['label-moderate']}`}></div>
                        </div>
                        <div className="col">
                            <span>Risky (71-100%)</span>
                            <div className={`${styles['label-risky']}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
        )}
    </div>
    );


}

export default RiskPrediction