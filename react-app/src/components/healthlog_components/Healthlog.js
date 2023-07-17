import Calendar from "./Calendar"

/**
 * This function renders the HealthLog components
 * 
 */
function HealthLog({userInfo}){
    return (<div>
        <h1>Welcome to health log {(userInfo.name).toLowerCase()}</h1>
        <Calendar />
        </div>)
}

export default HealthLog