import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../contexts/ColorContext";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const NotificationBanner = ({
  show,
  type = "info",
  message,
  onClose,
  autoClose = true,
  duration = 3000,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  useEffect(() => {
    if (!show || !autoClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  const Icon = ICONS[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-3 shadow-md border
        ${theme.notification?.[type] || theme.notification?.info}`}
    >
      <Icon size={20} className="mt-0.5" />

      <p className="flex-1 text-sm font-medium">
        {message}
      </p>

      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationBanner;
