import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/component1/Login.jsx"; // your login page

function App() {
  // function to check if user is logged in
  const isAuthenticated = () => {
    return !!localStorage.getItem("token"); // returns true if token exists
  };

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;