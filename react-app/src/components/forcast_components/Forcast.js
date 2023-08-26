import RiskPrediction from "./Risk-Prediction"
import TestSpark from "./Test-Spark"
// import styles from './Forcast.module.css'

/**
 * 
 * This function render the Forcast components
 */
function Forcast({userInfo}){
    return <div>
        {/* <TestSpark /> */}
        <RiskPrediction userInfo={userInfo}/>
    </div>
}

export default Forcast