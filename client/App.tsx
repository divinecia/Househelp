import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./lib/protected-route";

// Worker pages
import WorkerRegister from "./pages/worker/WorkerRegister";
import WorkerLogin from "./pages/worker/WorkerLogin";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerForgotPassword from "./pages/worker/WorkerForgotPassword";

// Homeowner pages
import HomeownerRegister from "./pages/homeowner/HomeownerRegister";
import HomeownerLogin from "./pages/homeowner/HomeownerLogin";
import HomeownerDashboard from "./pages/homeowner/HomeownerDashboard";
import HomeownerForgotPassword from "./pages/homeowner/HomeownerForgotPassword";
import HomeownerBooking from "./pages/homeowner/HomeownerBooking";
import HomeownerBookings from "./pages/homeowner/HomeownerBookings";
import HomeownerPayment from "./pages/homeowner/HomeownerPayment";
import HomeownerPayments from "./pages/homeowner/HomeownerPayments";

// Admin pages
import AdminRegister from "./pages/admin/AdminRegister";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminForgotPassword from "./pages/admin/AdminForgotPassword";

const queryClient = new QueryClient();

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Worker Routes */}
          <Route path="/worker/register" element={<WorkerRegister />} />
          <Route path="/worker/login" element={<WorkerLogin />} />
          <Route
            path="/worker/forgot-password"
            element={<WorkerForgotPassword />}
          />
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute
                requiredRole="worker"
                fallbackPath="/worker/login"
              >
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Homeowner Routes */}
          <Route path="/homeowner/register" element={<HomeownerRegister />} />
          <Route path="/homeowner/login" element={<HomeownerLogin />} />
          <Route
            path="/homeowner/forgot-password"
            element={<HomeownerForgotPassword />}
          />
          <Route
            path="/homeowner/dashboard"
            element={
              <ProtectedRoute
                requiredRole="homeowner"
                fallbackPath="/homeowner/login"
              >
                <HomeownerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeowner/booking"
            element={
              <ProtectedRoute
                requiredRole="homeowner"
                fallbackPath="/homeowner/login"
              >
                <HomeownerBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeowner/bookings"
            element={
              <ProtectedRoute
                requiredRole="homeowner"
                fallbackPath="/homeowner/login"
              >
                <HomeownerBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeowner/payment"
            element={
              <ProtectedRoute
                requiredRole="homeowner"
                fallbackPath="/homeowner/login"
              >
                <HomeownerPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeowner/payments"
            element={
              <ProtectedRoute
                requiredRole="homeowner"
                fallbackPath="/homeowner/login"
              >
                <HomeownerPayments />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/forgot-password"
            element={<AdminForgotPassword />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin" fallbackPath="/admin/login">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  return <AppContent />;
};

export default App;
