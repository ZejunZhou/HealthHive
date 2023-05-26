import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/navbar_components/Navbar";
import HealthLog from "./components/healthlog_components/Healthlog";
import Visualization from "./components/visualization_components/Visualization";
import Home from "./components/home_components/Home";
import Forcast from "./components/forcast_components/Forcast";
import Chat from "./components/chat_components/Chat";


/**
 * This is the main component of the application.
 *
 * It Render the overall structure of the application,
 * display the navbar and routes link different pages's component.
 *
 */
function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/healthlog" element={<HealthLog />} />
        <Route path="/visualization" element={<Visualization />} />
        <Route path="forcast" element={<Forcast />} />
        <Route path="chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
