// src/components/NavBar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Sun, Moon, Menu, X } from 'lucide-react';
import { colors } from '../contexts/ColorContext';

const NavBar = ({ isDark, toggleTheme, activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const theme = isDark ? colors.dark : colors.light;
  const location = useLocation();
  const isQrPage = location.pathname === "/qr/login";

  // Determine the current page
  const pathname = location.pathname;

  // Set button text and target route dynamically
  let buttonText = "Admin Login";
  let buttonTarget = "/admin/login";

  if (pathname === "/admin/login") {
    buttonText = "QR Login";
    buttonTarget = "/qr/login";
  } else if (pathname === "/qr/login") {
    buttonText = "Admin Login";
    buttonTarget = "/admin/login";
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 
        ${theme.background} ${theme.border} border-b backdrop-blur-md bg-opacity-95`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <div
              className={`h-10 w-10 bg-gradient-to-r ${theme.gradientPrimary} rounded-xl flex items-center justify-center mr-3`}
            >
              <span className="text-white font-bold">Cc</span>
            </div>
            <span
              className={`text-xl font-bold bg-gradient-to-r ${theme.gradientPrimary} bg-clip-text text-transparent`}
            >
              CampusConnect
            </span>
          </div>
          
          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme.buttonSecondary}`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
           {/*} <button
              onClick={() => navigate(buttonTarget)}
              className={`p-2 rounded-lg ${theme.buttonPrimary}`}
            >
              {buttonText}
            </button>*/}


          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${theme.buttonSecondary}`}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${theme.border} ${theme.cardBg}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">

            <div className="pt-4 space-y-2">
              <Link
                to={isQrPage ? "/admin/login" : "/qr/login"}
                className={`block px-3 py-2 rounded-md transition-colors ${theme.link}`}
              >
                {isQrPage ? "Admin Login" : "QR Admin Login"}
              </Link>

            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
