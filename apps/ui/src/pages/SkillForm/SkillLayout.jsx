import React from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Logo from "/images/logo.svg";

import styles from "./skillForm.module.css";

const SkillLayout = () => {
  return (
    <main>
      <header className={styles.navbar}>
        <Link to="/skill-form">
          <img src={Logo} alt="logo" />
        </Link>
      </header>
      <section className={`${styles.mainSection} bootstrap-wrapper app-layout`}>
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
      </section>
    </main>
  );
};

export default SkillLayout;
