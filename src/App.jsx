import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dash from "./pages/Dash/Dash";
import StatisticsDashboard from "./pages/Statistics/StatisticsDashboard/StatisticsDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { getCurrent } from "./redux/auth/operations";

import { lazy } from "react";
import CurrencyLayout from "./components/Currency/CurrencyLayout/CurrencyLayout";

const CurrencyTab = lazy(() => import("./components/Currency/CurrencyLayout/CurrencyLayout"));


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
            <StatisticsDashboard />
          </ProtectedRoute>
        }
      />

        <Route
  path="/currency"
  element={
    <ProtectedRoute>
      <CurrencyLayout />
    </ProtectedRoute>
  }
></Route>

      <Route path="*" element={<Login />} />
    </Routes>
  );
}
