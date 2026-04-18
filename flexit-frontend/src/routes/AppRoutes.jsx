import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin_dashboard/admin_dashboard";
import ResourcesPage from "../pages/resources/ResourcesPage";
import CreateResourcePage from "../pages/resources/CreateResourcePage";
import EditResourcePage from "../pages/resources/EditResourcePage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import ResourceDashboardPage from "../pages/resources/ResourceDashboardPage";
import UserDashboardPage from "../pages/user/UserDashboardPage";
import UserResourcesPage from "../pages/user/UserResourcesPage";
import BookingsFormPage from "../pages/bookings/BookingsFormPage";
import MyBookingsPage from "../pages/bookings/MyBookingsPage";
import AdminBookingsPage from "../pages/bookings/AdminBookingsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Resource Routes */}
        <Route path="/admin/resources" element={<ResourcesPage />} />
        <Route path="/admin/resources/dashboard" element={<ResourceDashboardPage />} />
        <Route path="/admin/resources/create" element={<CreateResourcePage />} />
        <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />
        <Route path="/admin/resources/:id" element={<ResourceDetailsPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      </Route>

      {/* User Routes */}
      <Route path="/user/dashboard" element={<UserDashboardPage />} />
      <Route path="/user/resources" element={<UserResourcesPage />} />
      <Route path="/book-resource" element={<BookingsFormPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
    </Routes>
  );
}

export default AppRoutes;
