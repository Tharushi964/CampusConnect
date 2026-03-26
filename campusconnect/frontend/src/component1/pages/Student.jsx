/**
 * StudentPortal.jsx — Fixed root
 * - Sidebar + header always visible via StudentLayout
 * - All navigation (dashboard sub-pages) uses setActive to switch top-level pages
 * - DashboardPage gets onNavigate to go to resources page with subject context
 */

import { useState } from "react";
import StudentLayout  from "../components/StudentLayout";
import DashboardPage  from "../../component1/pages/DashboardPage";
import ResourcesPage  from "../../component1/pages/ResourcesPage";
import RequestsPage   from "../../component1/pagesRequestsPage";
import ProfilePage    from "../../component1/pages/ProfilePage";

export default function StudentPortal() {
  const [active, setActive]         = useState("dashboard");
  const [subjectContext, setSubjectContext] = useState(null); // for navigating to resources with subject pre-selected

  const handleNavigate = (page, context = null) => {
    if (context) setSubjectContext(context);
    setActive(page);
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <DashboardPage setActive={setActive} onNavigate={handleNavigate}/>;
      case "resources": return <ResourcesPage subjectContext={subjectContext} setSubjectContext={setSubjectContext}/>;
      case "requests":  return <RequestsPage />;
      case "profile":   return <ProfilePage  />;
      default:          return <DashboardPage setActive={setActive} onNavigate={handleNavigate}/>;
    }
  };

  return (
    <StudentLayout active={active} setActive={(p) => { setSubjectContext(null); setActive(p); }}>
      {renderPage()}
    </StudentLayout>
  );
}