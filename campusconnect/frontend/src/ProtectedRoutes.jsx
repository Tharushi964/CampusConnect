import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  // 1. If AuthContext is still loading the user, show a spinner 
  // This prevents the "quick redirect" back to login
  if (loading) {
    return (
      <div className="h-screen bg-[#0A0F2C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#53CBF3]"></div>
      </div>
    );
  }

  // 2. Check if both token and user session are missing
  if (!token) {
    return <Navigate to="/campusconnect/login" replace />;
  }

  return children;
};

export default ProtectedRoute;