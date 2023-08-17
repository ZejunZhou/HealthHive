import RiskPrediction from "./Risk-Prediction"
import TestSpark from "./Test-Spark"

/**
 * 
 * This function render the Forcast components
 */
function Forcast({userInfo}){
    return <div>
        <h1>Welcome to the Forcast page!</h1>
        <TestSpark />
        <RiskPrediction userInfo={userInfo}/>
    </div>
}

export default Forcast