import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin_dashboard/admin_dashboard";
import AdminBookingsPage from "../pages/bookings/AdminBookingsPage";
import BookingsFormPage from "../pages/bookings/BookingsFormPage";
import MyBookingsPage from "../pages/bookings/MyBookingsPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/book-resource" element={<BookingsFormPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
