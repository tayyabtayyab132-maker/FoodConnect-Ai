import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function RoleProtectedRoute({
  allowedRoles,
  children,
}) {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();


  /*
   * Wait until AuthContext has finished
   * determining the current user.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--text-secondary)]">
          Loading...
        </div>
      </div>
    );
  }


  /*
   * User is not authenticated.
   */
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /*
   * User is authenticated but does not have
   * permission for this section.
   */
  if (!allowedRoles.includes(user.role)) {

    if (user.role === "organization") {
      return (
        <Navigate
          to="/organization/dashboard"
          replace
        />
      );
    }


    if (user.role === "donor") {
      return (
        <Navigate
          to="/donor/dashboard"
          replace
        />
      );
    }


    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }


    /*
     * Unknown role.
     *
     * Do not allow access to any protected
     * application area.
     */
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}


export default RoleProtectedRoute;