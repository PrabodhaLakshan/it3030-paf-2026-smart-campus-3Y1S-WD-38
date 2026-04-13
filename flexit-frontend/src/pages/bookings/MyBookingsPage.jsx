import React from "react";

function MyBookingsPage() {
  return (
    <section className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">
          Review the bookings created by the current user.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-700">
          Booking history content can be added here next.
        </p>
      </div>
    </section>
  );
}

export default MyBookingsPage;
