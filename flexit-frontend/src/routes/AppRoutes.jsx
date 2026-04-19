import { BrowserRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import TechnicianLayout from "../layouts/TechnicianLayout";
import AdminDashboard from "../pages/admin_dashboard/admin_dashboard";
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

import UserDashboardPage from "../pages/user/UserDashboardPage";
import UserDashboard from "../pages/user_dashboard/UserDashboard";
import UserResourcesPage from "../pages/user/UserResourcesPage";
import BookingsFormPage from "../pages/bookings/BookingsFormPage";
import MyBookingsPage from "../pages/bookings/MyBookingsPage";
import AdminBookingsPage from "../pages/bookings/AdminBookingsPage";

import TechnicianDashboard from "../pages/technician_dashboard/TechnicianDashboard";
import Login from "../pages/Login";
import { getSessionUser, isAuthenticated } from "../utils/sessionUser";

function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ role }) {
  const sessionUser = getSessionUser();

  if (sessionUser.role !== role) {
    if (sessionUser.role === "TECHNICIAN") {
      return <Navigate to="/technician/dashboard" replace />;
    }

    if (sessionUser.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  const landingPage = <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/report-ticket" element={<PublicCreateTicketPage />} />
        <Route path="/report-ticket/manage/:id" element={<TicketEditPage />} />
        <Route path="/" element={landingPage} />

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole role="USER" />}>
            <Route element={<UserLayout />}>
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
              <Route path="/user/tickets-dashboard" element={<UserDashboard />} />
              <Route path="/user/resources" element={<UserResourcesPage />} />
              <Route path="/book-resource" element={<BookingsFormPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              
              <Route path="/user/tickets/create" element={<CreateTicketPage />} />
              <Route path="/user/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/user/tickets/edit/:id" element={<TicketEditPage />} />
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
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Resource Routes - both /resources and /admin/resources work */}
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

              {/* Ticket Routes - admin management table */}
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
