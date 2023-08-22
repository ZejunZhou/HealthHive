import { useNavigate } from 'react-router-dom';

const Logout = ({setLogin, setUserInfo, setUsername, setPassword, setEmail}) => {

    const navigate = useNavigate();

    const logout = () => {
        setLogin(false);
        setUserInfo(null);
        console.log("successful log out")
        navigate("/")
    }

    return(<a onClick={logout}>Logout</a>)
}

export default Logout