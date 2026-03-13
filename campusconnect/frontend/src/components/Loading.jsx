import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../contexts/ColorContext";

const Loading = ({ loading, message }) => {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className={`${theme.cardBg} rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4`}>
        
        {/* Spinner */}
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent"></div>

        {/* Message */}
        <p className={`text-sm font-medium ${theme.text}`}>
          {message || "Please wait..."}
        </p>

      </div>
    </div>
  );
};

export default Loading;
