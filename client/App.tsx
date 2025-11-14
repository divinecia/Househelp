import "./global.css";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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
          <Route path="/worker/forgot-password" element={<WorkerForgotPassword />} />
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />

          {/* Homeowner Routes */}
          <Route path="/homeowner/register" element={<HomeownerRegister />} />
          <Route path="/homeowner/login" element={<HomeownerLogin />} />
          <Route path="/homeowner/forgot-password" element={<HomeownerForgotPassword />} />
          <Route path="/homeowner/dashboard" element={<HomeownerDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if user has seen splash screen before
    const splashShown = sessionStorage.getItem("splash_shown");
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("splash_shown", "true");
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} duration={3000} />}
      <AppContent />
    </>
  );
};

export default App;
