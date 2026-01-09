import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TodoDetail from "./pages/TodoDetail";
import VerifyOtpPage from "./pages/VerifyOtp";
import { getAccessToken } from "./lib/auth-store";
import type { JSX } from "react";
import { Toaster } from "./components/ui/toaster";

function PrivateRoute({ children }: { children: JSX.Element }) {
  return getAccessToken() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/todos/:id" element={<PrivateRoute><TodoDetail /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </HashRouter>
  );
}