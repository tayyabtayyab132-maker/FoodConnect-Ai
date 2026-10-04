import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ children }) {
  const location = useLocation();

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();


  /*
   * While authentication state is being resolved,
   * don't redirect prematurely.
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
   * No valid authenticated session.
   */
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  return children;
}


export default ProtectedRoute;