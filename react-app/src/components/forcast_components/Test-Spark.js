import axios from 'axios';
import {useState} from 'react';

const TestSpark = () => {

const [testData, setTestData] = useState(null)

const getSpeed = () => {
    axios.get("http://localhost:4002/test-spark")
    .then((response) => {
        setTestData(response.data)
    })
    .catch((error) =>[
        console.log(error)
])

}

return (<div><p>Test Spark gives data {testData}</p> <button onClick={getSpeed}>get data</button></div>)

}

export default TestSpark;

