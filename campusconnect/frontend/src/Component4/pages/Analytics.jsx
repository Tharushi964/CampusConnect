import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import Chatbot from '../components/Chatbot';  // ← Add this

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AnalyticsDashboard />
      <Chatbot />  {/* ← Add this */}
    </div>
  );
};

export default Analytics;