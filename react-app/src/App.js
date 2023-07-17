import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar_components/Navbar";
import HealthLog from "./components/healthlog_components/Healthlog";
import Visualization from "./components/visualization_components/Visualization";
import Home from "./components/home_components/Home";
import Forcast from "./components/forcast_components/Forcast";
import Chat from "./components/chat_components/Chat";
import Login from "./components/login-component/Login";
import Logout from "./components/login-component/Logout";
import AccessDenied from "./components/login-component/AccessDenied";
import { useState } from "react";


function App() {
  const [isLogin, setLogin] = useState(false); // define hook to trace login status
  const [userInfo, setUserInfo] = useState(null); // define hook to save userinfo through session

  console.log(isLogin);

  return (
    <div>
      <Navbar>
        {isLogin ? <Logout setLogin={setLogin} setUserInfo={setUserInfo} /> : <Login isLogin={isLogin} setLogin={setLogin} userInfo={userInfo} setUserInfo={setUserInfo} />}
      </Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/healthlog" element={isLogin ? <HealthLog userInfo={userInfo}/> : <AccessDenied />} />
        <Route path="/visualization" element={isLogin ? <Visualization /> : <AccessDenied />} />
        <Route path="/forcast" element={isLogin ? <Forcast /> : <AccessDenied />} />
        <Route path="/chat" element={isLogin ? <Chat /> : <AccessDenied />} />
      </Routes>
    </div>
  );
}

export default App;
