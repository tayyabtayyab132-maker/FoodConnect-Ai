import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import OrganizationDashboard from "./organization/Dashboard";
import OrganizationDonations from "./organization/Donations";
import OrganizationDonationDetails from "./organization/DonationDetails";
import OrganizationRequests from "./organization/Requests";
import OrganizationRequestDetails from "./organization/RequestDetails";
import OrganizationProfile from "./organization/Profile";
import OrganizationCompleted from "./organization/Completed";


import DonorDashboard from "./donor/Dashboard";
import DonorDonations from "./donor/Donations";
import CreateDonation from "./donor/CreateDonation";
import DonorDonationDetails from "./donor/DonationDetails";
import DonorOrganizations from "./donor/Organizations";
import DonorRequests from "./donor/Requests";
import DonorRequestDetails from "./donor/RequestDetails";
import DonorProfile from "./donor/Profile";

import AdminDashboard from "./admin/Dashboard";
import AdminUsers from "./admin/Users";
import AdminDonations from "./admin/Donations";
import AdminRequests from "./admin/Requests";
import AdminAuditLogs from "./admin/AuditLogs";


function DashboardRedirect() {
  return <Navigate to="/" replace />;
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ========================= */}
          {/* Public Routes */}
          {/* ========================= */}

          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* ========================= */}
          {/* Generic Protected Route */}
          {/* ========================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />


          {/* ========================= */}
          {/* Organization Routes */}
          {/* ========================= */}

          <Route
            path="/organization/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={["organization"]}
              >
                <OrganizationDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/organization/donations"
            element={
              <RoleProtectedRoute
                allowedRoles={["organization"]}
              >
                <OrganizationDonations />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/organization/donations/:donationId"
            element={
              <RoleProtectedRoute
                allowedRoles={["organization"]}
              >
                <OrganizationDonationDetails />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/organization/requests"
            element={
              <RoleProtectedRoute
                allowedRoles={["organization"]}
              >
                <OrganizationRequests />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/organization/requests/:requestId"
            element={
              <RoleProtectedRoute
                allowedRoles={["organization"]}
              >
                <OrganizationRequestDetails />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/organization/profile"
            element={
              <RoleProtectedRoute
                allowedRoles={["organization"]}
              >
                <OrganizationProfile />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/organization/completed"
            element={
              <RoleProtectedRoute allowedRoles={["organization"]}>
                <OrganizationCompleted />
              </RoleProtectedRoute>
            }
          />


          {/* ========================= */}
          {/* Donor Routes */}
          {/* ========================= */}

          <Route
            path="/donor/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/donations"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorDonations />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/donations/create"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <CreateDonation />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/donations/:donationId"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorDonationDetails />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/organizations"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorOrganizations />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/requests"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorRequests />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/requests/:requestId"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorRequestDetails />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/donor/profile"
            element={
              <RoleProtectedRoute
                allowedRoles={["donor"]}
              >
                <DonorProfile />
              </RoleProtectedRoute>
            }
          />


          {/* ========================= */}
          {/* Admin Routes */}
          {/* ========================= */}

          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/donations"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminDonations />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/requests"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminRequests />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/audit-logs"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminAuditLogs />
              </RoleProtectedRoute>
            }
          />


          {/* ========================= */}
          {/* Unknown Route */}
          {/* ========================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;