import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsLoggedIn, selectIsRefreshing } from "../redux/auth/selectors";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isRefreshing = useSelector(selectIsRefreshing);
  const location = useLocation();

  if (isRefreshing) {
    return <div style={{ color: "white", textAlign: "center", marginTop: "40vh" }}>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
