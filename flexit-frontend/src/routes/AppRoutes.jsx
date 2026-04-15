import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin_dashboard/admin_dashboard";
import ResourcesPage from "../pages/resources/ResourcesPage";
import CreateResourcePage from "../pages/resources/CreateResourcePage";
import EditResourcePage from "../pages/resources/EditResourcePage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import EditTicketPage from "../pages/tickets/EditTicketPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          {/* Admin Routes */}
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Resource Routes - both /resources and /admin/resources work */}
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/create" element={<CreateResourcePage />} />
          <Route path="/resources/edit/:id" element={<EditResourcePage />} />
          <Route path="/resources/:id" element={<ResourceDetailsPage />} />

          <Route path="/admin/resources" element={<ResourcesPage />} />
          <Route path="/admin/resources/create" element={<CreateResourcePage />} />
          <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />
          <Route path="/admin/resources/:id" element={<ResourceDetailsPage />} />

          {/* Ticket Routes - both /tickets and /admin/tickets work */}
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets/edit/:id" element={<EditTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />

          <Route path="/admin/tickets" element={<TicketsPage />} />
          <Route path="/admin/tickets/create" element={<CreateTicketPage />} />
          <Route path="/admin/tickets/edit/:id" element={<EditTicketPage />} />
          <Route path="/admin/tickets/:id" element={<TicketDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;