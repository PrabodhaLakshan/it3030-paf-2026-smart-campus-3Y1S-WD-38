import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home/Home";
import UserLayout from "../layouts/UserLayout";
import TechnicianLayout from "../layouts/TechnicianLayout";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import AdminDashboard from "../pages/admin_dashboard/admin_dashboard";
import UserDashboardPage from "../pages/user/UserDashboardPage";
import UserResourcesPage from "../pages/user/UserResourcesPage";
import UserResourceDetailPage from "../pages/user/UserResourceDetailPage";
import UserDashboard from "../pages/user_dashboard/UserDashboard";
import TechnicianDashboard from "../pages/technician_dashboard/TechnicianDashboard";
import ResourcesPage from "../pages/resources/ResourcesPage";
import CreateResourcePage from "../pages/resources/CreateResourcePage";
import EditResourcePage from "../pages/resources/EditResourcePage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import ResourceDashboardPage from "../pages/resources/ResourceDashboardPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import PublicCreateTicketPage from "../pages/tickets/PublicCreateTicketPage";
import TicketEditPage from "../pages/tickets/TicketEditPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import EditTicketPage from "../pages/tickets/EditTicketPage";
import BookingsFormPage from "../pages/bookings/BookingsFormPage";
import MyBookingsPage from "../pages/bookings/MyBookingsPage";
import AdminBookingsPage from "../pages/bookings/AdminBookingsPage";
import { getSessionUser, isAuthenticated } from "../utils/sessionUser";

import UpdateDetailsPage from "../pages/user/UpdateDetailsPage";
import ChangePasswordPage from "../pages/user/ChangePasswordPage";


function getDefaultRouteForRole(role) {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (role === "TECHNICIAN") {
    return "/technician/dashboard";
  }

  return "/user/dashboard";
}

function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ role }) {
  const sessionUser = getSessionUser();

  if (sessionUser.role !== role) {
    return <Navigate to={getDefaultRouteForRole(sessionUser.role)} replace />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/Home" replace />;
  }

  const sessionUser = getSessionUser();
  return <Navigate to={getDefaultRouteForRole(sessionUser.role)} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/report-ticket" element={<PublicCreateTicketPage />} />
        <Route path="/report-ticket/manage/:id" element={<TicketEditPage />} />




        <Route element={<RequireAuth />}>
          <Route element={<RequireRole role="USER" />}>
            <Route element={<UserLayout />}>
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
              <Route path="/user/tickets-dashboard" element={<UserDashboard />} />
              <Route path="/user/resources" element={<UserResourcesPage />} />
              <Route path="/user/resources/:id" element={<UserResourceDetailPage />} />
              <Route path="/book-resource" element={<BookingsFormPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/user/tickets/create" element={<CreateTicketPage />} />
              <Route path="/user/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/user/tickets/edit/:id" element={<TicketEditPage />} />
                      <Route path="/user/profile/update" element={<UpdateDetailsPage />} />
              <Route path="/user/profile/change-password" element={<ChangePasswordPage />} />
            </Route>
          </Route>

          <Route element={<RequireRole role="TECHNICIAN" />}>
            <Route element={<TechnicianLayout />}>
              <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
              <Route path="/technician/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/technician/tickets/edit/:id" element={<EditTicketPage />} />
            </Route>
          </Route>

          <Route element={<RequireRole role="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/resources/dashboard" element={<ResourceDashboardPage />} />
              <Route path="/resources/create" element={<CreateResourcePage />} />
              <Route path="/resources/edit/:id" element={<EditResourcePage />} />
              <Route path="/resources/:id" element={<ResourceDetailsPage />} />

              <Route path="/admin/resources" element={<ResourcesPage />} />
              <Route path="/admin/resources/dashboard" element={<ResourceDashboardPage />} />
              <Route path="/admin/resources/create" element={<CreateResourcePage />} />
              <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />
              <Route path="/admin/resources/:id" element={<ResourceDetailsPage />} />

              <Route path="/admin/bookings" element={<AdminBookingsPage />} />

              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/create" element={<CreateTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/tickets/edit/:id" element={<EditTicketPage />} />

              <Route path="/admin/tickets" element={<TicketsPage />} />
              <Route path="/admin/tickets/create" element={<CreateTicketPage />} />
              <Route path="/admin/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/admin/tickets/edit/:id" element={<EditTicketPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
