import { Heading, Text } from "@allocate-core/ui-components";
import React, { useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import MenuIcon from "/icons/menuIcon.svg";

import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import navigations from "../../constants/navigations.js";
import { useAuthStore } from "../../store/authStore";
import styles from "./dashboard.module.css";

const DashboardLayout = ({ allowedRoles }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const auth = useAuthStore();
  const location = useLocation();

  const currentUserAllowed = allowedRoles.some((role) =>
    auth?.user?.roles.includes(role),
  );

  return currentUserAllowed ? (
    <div className="bootstrap-wrapper app-layout-full">
      <Header />
      <div className={`hidden-md-up ${isNavOpen ? "show" : "hide"}`}>
        <MobileNav
          onClose={() => {
            setIsNavOpen(false);
          }}
        />
      </div>
      <header className="row hidden-md-up">
        <Header>
          <div className="flex justify-between gap-30" style={{ flexBasis: "35%" }}>
            <img
              src={MenuIcon}
              alt="toggle navigation menu"
              role="presentation"
              onClick={() => setIsNavOpen(true)}
            />

            <Heading size="h6" fontWeight="medium">
              Dashboard
            </Heading>
          </div>
        </Header>
      </header>
      <main className="flex">
        <nav className={styles.navList}>
          <ul className="flex-col gap-30">
            {navigations()
              .find((nav) => nav.id === "dashboard")
              .subNav.map((navItem) => (
                <li key={navItem.text}>
                  <NavLink to={navItem.linkTo}>
                    {({ isActive }) => (
                      <div
                        className={`${styles.navLink} ${
                          isActive ? styles.active : ""
                        } flex gap-20`}
                      >
                        <img
                          src={isActive ? navItem.activeIcon : navItem.inactiveIcon}
                          alt=""
                        />
                        <Text
                          size="b1"
                          fontWeight="medium"
                          className={styles.navigationItem}
                        >
                          {navItem.text}
                        </Text>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>
        <div className={styles.mainSection}>
          <Outlet />
        </div>
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

export default DashboardLayout;
