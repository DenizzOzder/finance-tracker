import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsLoggedIn, selectIsRefreshing } from "../redux/auth/selectors";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isRefreshing = useSelector(selectIsRefreshing);
  const loc = useLocation();
  
  // Auth durumu yükleniyorsa loading göster
  if (isRefreshing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #101010 0%, #0E0D12 50%, #0A0A0A 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}
