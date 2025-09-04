import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dash from "./pages/Dash/Dash";
import Statistics from "./pages/Statistics/Statistics";
import ProtectedRoute from "./components/ProtectedRoute";
import { getCurrent } from "./redux/auth/operations";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrent());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dash />
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Login />} />
    </Routes>
  );
}
