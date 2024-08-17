import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { useAuthStore } from "../../store/authStore";
import Header from "../Header";

const Layout = ({ allowedRoles, fullLayout = false }) => {
  const auth = useAuthStore();
  const location = useLocation();

  const currentUserAllowed = allowedRoles.some((role) =>
    auth?.user?.roles.includes(role),
  );

  return currentUserAllowed ? (
    <div className={`bootstrap-wrapper ${fullLayout ? "app-layout-full" : "app-layout"}`}>
      <Header />
      <main>
        <Outlet />
        <ToastContainer
          style={{ fontFamily: "var(--font-secondary)" }}
          theme="light"
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          pauseOnHover={true}
          closeOnClick={true}
        />
      </main>
    </div>
  ) : auth?.isAuthenticated ? (
    <Navigate to="/" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default Layout;
