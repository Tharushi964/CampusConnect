import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { colors } from "../../contexts/ColorContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../contexts/AuthContext";
import { getDefaultRoute } from "../../utils/getDefaultRoutes";
import Loading from "../../components/Loading";
import NotificationBanner from "../../components/NotificationBanner";

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
  if (notification.show) {
    console.log("Notification updated:", notification);
  }
}, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ show: false, type: "", message: "" });
    setLoading(true);

    try {
      const user = await login(username, password);
      console.log("Login successful:", user);
      setLoading(false);
      setNotification({ show: true, type: "success", message: "Login Successful" });
      console.log(notification)
      setTimeout(() => {
      if (user?.role) {
        navigate(getDefaultRoute(user.role), { replace: true });
      }
    }, 1500);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setNotification({
        show: true,
        type: "error",
        message: error?.response?.data?.message ?? "Login Failed",
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme.background}`}>

      {/* Full-screen overlay — must be at root level to cover everything */}
      {loading && <Loading loading={loading} message="Loading..." />}

      <NavBar
        isDark={isDark}
        toggleTheme={toggleTheme}
        activeSection={null}
        setActiveSection={() => {}}
      />

      <div className="flex items-center justify-center min-h-screen pt-16">
        
        <form
          onSubmit={handleSubmit}
          className={`${theme.cardBg} p-8 rounded-2xl shadow-md w-80 border ${theme.border}`}
        >
          {notification && 
            <NotificationBanner
              show={notification.show}
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ show: false, type: "", message: "" })}
            />
            }
          <h2 className={`text-2xl font-bold mb-1 text-center ${theme.text}`}>
            Welcome back
          </h2>

          <p className={`text-sm text-center mb-6 ${theme.textSecondary}`}>
            Sign in to your account
          </p>

          <div className="mb-4">
            <label className={`block text-xs font-medium mb-1.5 ${theme.textSecondary}`}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]
                ${theme.inputBg} ${theme.border} ${theme.text}`}
            />
          </div>

          <div className="mb-6">
            <label className={`block text-xs font-medium mb-1.5 ${theme.textSecondary}`}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5478FF]
                ${theme.inputBg} ${theme.border} ${theme.text}`}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-gradient-to-r ${theme.gradientPrimary} text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}