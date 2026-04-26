export const getDefaultRoute = (roles) => {
  const roleStr = Array.isArray(roles) ? roles[0] : roles;
  const normalizedRole = (roleStr || "").toLowerCase();
 
  switch (normalizedRole) {
    case "admin":
      return "/campusconnect/admin-dashboard";

    case "batchrep":
      return "/campusconnect/student-dashboard";

    case "student":
      return "/campusconnect/student-dashboard";

    default:
      return "/campusconnect/login";
  }
};
