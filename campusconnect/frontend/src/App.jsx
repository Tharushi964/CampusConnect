import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./component1/pages/Homepage.jsx";
import Login from "./component1/pages/Login.jsx"; // your login page
import SignUp from "./component1/pages/SignUp.jsx";
import Verify from "./component1/pages/Verify.jsx";
import Admin from "./component1/pages/Admin.jsx";
import StudentPortal from "./component1/pages/StudentPortal/Student.jsx";
import BatchRepPortal from "./component1/pages/BarchRepPortal/BatchRep.jsx";
import StudyGroups from "./component3/pages/StudyGroups.jsx";
import SectionFeedbacks from "./component1/pages/Sectionfeedbacks.jsx";
function App() {
  // function to check if user is logged in
  const isAuthenticated = () => {
    return !!localStorage.getItem("token"); // returns true if token exists
  };

  return (
    <ThemeProvider>
      <AuthProvider>
      <Router >
      <Routes>

        {/* Home Page route */}
        <Route path="/" element={<HomePage />} />

        {/* Login route */}
        <Route path="/campusconnect/login" element={<Login />} />
        <Route path="/campusconnect/signup" element={<SignUp />} />
        <Route path="/campusconnect/verify" element={<Verify />} />

        {/* Default route redirects to login */}
        <Route path="/" element={<HomePage />} />

        {/* Admin rote*/}
        <Route path="/campusconnect/admin-dashboard" element={<Admin />} />

         {/* Student rote*/}
        <Route path="/campusconnect/student-dashboard" element={<StudentPortal />} />
        <Route path="/campusconnect/batchrep-dashboard" element={<BatchRepPortal />} />

        <Route path="/feedbacks" element={<SectionFeedbacks/>}/>

        
      </Routes>
    </Router>
     </AuthProvider>
    </ThemeProvider>
    
  );
}

export default App;