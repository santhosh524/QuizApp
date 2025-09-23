import "./css/App.css";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import User from "./User";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        {/* <Route path = "/user" element = {<User/>}/> */}
      </Routes>
    </Router>
  );
}

export default App;
