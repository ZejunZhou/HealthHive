import axios from "axios"
import { useEffect, useState } from "react";
import HealthIndexChart from "./HomeChart";
import styles from './home.module.css'

function Home({userInfo}){
   
   const [health_index, setHealth_index] = useState([])
   const [avgIndex, setAvgIndex] = useState(0)
   const [pastWeekIndex, setPastWeekIndex] = useState(0)
   const [totalDays, setTotalDays] = useState(0)

   function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }


   useEffect(() => {
        // get generated health_index
        axios.get("http://localhost:4001/get_health_index_by_range", {params:{email:userInfo.email, date:formatDate(new Date().toDateString())}})
        .then((response) => {
            setHealth_index(response.data)
        })
        .catch((error) => {
            if (error.response && error.response.status === 400 && error.response.data.message === "No index has generated") {
                setHealth_index([])
            }else{
                console.log(error)
            }
        })

        // get today dates
        axios.get("http://localhost:4001/get_logs", {params:{email:userInfo.email}})
        .then((response) => {
            setTotalDays(Object.keys(response.data).length);
        })
        .catch((error) => {
            console.log(error)
        })
   }, [])


    useEffect(() => {
        let totalHealthIndex = 0;
        let totalPastWeekHealthIndex = 0;
        let pastWeekCount = 0;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        for (let i = 0; i < health_index.length; i++) {
            totalHealthIndex += Number(health_index[i].health_index);

            if (new Date(health_index[i].date) >= oneWeekAgo) {
                totalPastWeekHealthIndex += Number(health_index[i].health_index);
                pastWeekCount++;
            }
        }

        const avgHealthIndex = health_index.length > 0 ? totalHealthIndex / health_index.length : 0;
        const avgPastWeekHealthIndex = pastWeekCount > 0 ? totalPastWeekHealthIndex / pastWeekCount : 0;

        setAvgIndex(avgHealthIndex);
        setPastWeekIndex(avgPastWeekHealthIndex);
}, [health_index]);

   
    console.log(totalDays)

    return (
        <div className={`container mt-4 ${styles['title']}`}>
            <h1 className={`mb-4 ${styles['header']}`}>Dashboard</h1>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Days Reported on Logs</h5>
                            <p className="card-text">{totalDays}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Average Health Index</h5>
                            <p className="card-text">{avgIndex}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Weekly Health Index</h5>
                            <p className="card-text">{pastWeekIndex}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['chart-container']}>
            <HealthIndexChart data={health_index}/>
            </div>
        </div>
    );
}


export default Home