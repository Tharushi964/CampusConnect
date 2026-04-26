import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const isTokenExpired = (token) => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));

    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem("token");
  const hasValidToken = !!token && !isTokenExpired(token);

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
  if (!hasValidToken) {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    return <Navigate to="/campusconnect/login" replace />;
  }

  return children;
};

export default ProtectedRoute;