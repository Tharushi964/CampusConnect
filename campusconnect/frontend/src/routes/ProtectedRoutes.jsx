import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {

  const { token, role } = useAuth();
  const location = useLocation();

  /* ========= LOGIN CHECK ========= */
  if (!token) {
    return (
      <Navigate
        to="/campusconnect/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* ========= ROLE CHECK ========= */
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;