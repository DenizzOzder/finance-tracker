import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
  const loc = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}
