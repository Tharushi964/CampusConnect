import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./component1/pages/Login.jsx"; // your login page
import SignUp from "./component1/pages/SignUp.jsx";
import Admin from "./component1/pages/Admin.jsx";

function App() {
  // function to check if user is logged in
  const isAuthenticated = () => {
    return !!localStorage.getItem("token"); // returns true if token exists
  };

  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
      <Routes>
        {/* Login route */}
        <Route path="/campusconnect/login" element={<Login />} />
        <Route path="/campusconnect/signup" element={<SignUp />} />

        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/campusconnect/login" />} />

        {/* Admin rote*/}
        <Route path="/campusconnect/admin-dashboard" element={<Admin />} />
      </Routes>
    </Router>
     </AuthProvider>
    </ThemeProvider>
    
  );
}

export default App;