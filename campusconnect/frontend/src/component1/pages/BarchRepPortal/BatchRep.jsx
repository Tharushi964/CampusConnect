/**
 * StudentPortal.jsx — Fixed root
 * - Sidebar + header always visible via StudentLayout
 * - All navigation (dashboard sub-pages) uses setActive to switch top-level pages
 * - DashboardPage gets onNavigate to go to resources page with subject context
 */

import { useState } from "react";
import BatchRepLayout  from "../../components/BatchRepLayout";
import DashboardPage  from "./DashboardPage";
import ResourcesPage  from "../../../component2/pages/ResourcesPage";
import SectionEntities from "../../../component2/pages/BatchRepSectionEntities";
import RequestsPage   from "./RequestsPage";
import ProfilePage    from "./ProfilePage";
import Recommendations from "../../../Component4/pages/Recommendations";
import { T } from "../../components/AdminUiComponents";
import { useTheme } from "../../../contexts/ThemeContext";

export default function BatchRepPortal() {
  const [active, setActive]         = useState("dashboard");
  const [subjectContext, setSubjectContext] = useState(null);
  const { isDark, toggleTheme } = useTheme();
  const t=T(isDark);

  const handleNavigate = (page, context = null) => {
    if (context) setSubjectContext(context);
    setActive(page);
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <DashboardPage setActive={setActive} onNavigate={handleNavigate}/>;
      case "entities": return <SectionEntities isDark={isDark}/>;
      case "requests":  return <RequestsPage />;
      case "recomandations":   return <Recommendations  />;
      case "profile":   return <ProfilePage  />;
      
      default:          return <DashboardPage setActive={setActive} onNavigate={handleNavigate}/>;
    }
  };

  return (
    <BatchRepLayout active={active} setActive={(p) => { setSubjectContext(null); setActive(p); }}>
      {renderPage()}
    </BatchRepLayout>
  );
}