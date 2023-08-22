import { BrowserRouter as Router, Routes, Route, Link, useLocation} from "react-router-dom";
import Navbar from "./components/navbar_components/Navbar";
import HealthLog from "./components/healthlog_components/Healthlog";
import Visualization from "./components/visualization_components/Visualization";
import Oa from "./components/home_components/Oa";
import Home from "./components/home_components/Home";
import Forcast from "./components/forcast_components/Forcast";
import Chat from "./components/chat_components/Chat";
import LoginForm from "./components/login-component/LoginForm";
import Logout from "./components/login-component/Logout";
import AccessDenied from "./components/login-component/AccessDenied";
import Topbar from "./components/navbar_components/Topbar";
import { useState } from "react";


function App() {
  const [isLogin, setLogin] = useState(false); // define hook to trace login status
  const [userInfo, setUserInfo] = useState(null); // define hook to save userinfo through session
 
  console.log(isLogin);
  if (userInfo != null){
     console.log("username is ", userInfo.name, "password is", userInfo.password, "email is", userInfo.email)
  }

  const displayPaths = ["/home", "/healthlog", "/visualization", "/forcast", "/chat"];
  const location = useLocation();
  const { pathname } = location;


  return (
    <div>
      {pathname === "/" ? (
        <Oa />
      ) : (
        <div className="d-flex">
          {!pathname.includes('/login') && displayPaths.includes(pathname) && <Navbar />}
          <div style={{ flexGrow: 1 }}>
            {!pathname.includes('/login') && displayPaths.includes(pathname) && (isLogin ? <Topbar><Logout setLogin={setLogin} setUserInfo={setUserInfo}/></Topbar> : <Topbar><Link to='/login'>Log in</Link></Topbar>)}
            <Routes>
              <Route path="/home" element={isLogin ? <Home userInfo={userInfo}/> : <AccessDenied />} />
              <Route path="/healthlog" element={isLogin ? <HealthLog userInfo={userInfo}/> : <AccessDenied />} />
              <Route path="/visualization" element={isLogin ? <Visualization userInfo={userInfo}/> : <AccessDenied />} />
              <Route path="/forcast" element={isLogin ? <Forcast userInfo={userInfo}/> : <AccessDenied />} />
              <Route path="/chat" element={isLogin ? <Chat /> : <AccessDenied />} />
              <Route path="/login" element={<LoginForm isLogin={isLogin} setLogin={setLogin} userInfo={userInfo} setUserInfo={setUserInfo}/>} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
