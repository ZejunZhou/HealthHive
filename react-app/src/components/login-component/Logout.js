import { useNavigate } from 'react-router-dom';

const Logout = ({setLogin, setUserInfo, setUsername, setPassword, setEmail}) => {

    const navigate = useNavigate();

    const logout = () => {
        setLogin(false);
        setUserInfo(null);
        console.log("successful log out")
        navigate("/")
    }

    return(<button onClick={logout}>Logout</button>)
}

export default Logout