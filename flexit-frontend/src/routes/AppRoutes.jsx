import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin_dashboard/admin_dashboard";
import ResourcesPage from "../pages/resources/ResourcesPage";
import CreateResourcePage from "../pages/resources/CreateResourcePage";
import EditResourcePage from "../pages/resources/EditResourcePage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import ResourceDashboardPage from "../pages/resources/ResourceDashboardPage";
import UserDashboardPage from "../pages/user/UserDashboardPage";
import UserResourcesPage from "../pages/user/UserResourcesPage";

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
          <Route path="/admin/resources/dashboard" element={<ResourceDashboardPage />} />
          <Route path="/admin/resources/create" element={<CreateResourcePage />} />
          <Route path="/admin/resources/edit/:id" element={<EditResourcePage />} />
          <Route path="/admin/resources/:id" element={<ResourceDetailsPage />} />
        </Route>

        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserDashboardPage />} />
        <Route path="/user/resources" element={<UserResourcesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;