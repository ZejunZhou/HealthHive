import Calendar from "./Calendar"

/**
 * This function renders the HealthLog components
 * 
 */
function HealthLog({userInfo}){
    console.log(userInfo)
    return (<div>
        {/* <h1>Welcome to health log {(userInfo.name).toLowerCase()}, your email is {(userInfo.email)}</h1> */}
        <Calendar userInfo={userInfo}/>
        </div>)
}

export default HealthLog