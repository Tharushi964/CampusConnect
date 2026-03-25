export const getDefaultRoute = (roles) => {
  const roleStr = Array.isArray(roles) ? roles[0] : roles;
  const normalizedRole = (roleStr || "").toLowerCase();
 
  switch (normalizedRole) {
    case "admin":
      return "/campusconnect/admin-dashboard";

    case "batchrep":
      return  `/batchrep/dashboard`;

    case "student":
      return `/student/dashboard`;

    default:
      return "/campusconnect/login";
  }
};
