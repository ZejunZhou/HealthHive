import axios from "axios"
import { useState } from "react";

function Home(){
    const [dataArray, setDataArray] = useState(null);
     const [selectedMetric, setSelectedMetric] = useState("health_index"); // default metric is heart_rate

    return(<div><h1>Dashbord</h1></div>)
}

export default Home