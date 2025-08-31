import "./App.css";
import Dash from "./pages/Dash";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { Routes, Route, Navigate } from "react-router-dom";


function App() {
  const isOnline = false;
  return (
    <>
    <Routes>
     <Route path="/dashboard" element={isOnline ? <Dash /> : <Navigate to="/" replace/>} />
     <Route path="/" element={!isOnline ? <Login/> : <Navigate to="/" replace/>} />
     <Route path="/register" element={<Register />} />
    </Routes>
    </>

  );
}

export default App;
