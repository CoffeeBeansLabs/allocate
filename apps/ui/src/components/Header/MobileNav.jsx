import { useHandleClickOutside } from "@allocate-core/util-hooks";
import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import MenuIcon from "/icons/menuIcon.svg";
import Logo from "/images/logo.svg";

import { isMobile } from "../../common/common";
import { useAuthStore } from "../../store/authStore";
import styles from "./header.module.css";
import NavList from "./NavList";
import Notification from "./Notification";
import Profile from "./Profile";
import UniversalSearch from "./UniversalSearch";

const MobileNav = ({ onClose }) => {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const mobileNavRef = useRef(null);

  useHandleClickOutside({
    onOutSideClick: () => {
      onClose();
    },
    wrapperRef: mobileNavRef,
  });

  const handleLogout = () => {
    auth.signOut(() => {
      navigate("/login");
    });
  };

  return (
    <div className={`${isMobile ? "show" : "hide"} ${styles.mobileMenuView}`}>
      <section className={styles.mobileNav} ref={mobileNavRef}>
        <div className="flex align-center">
          <img
            src={MenuIcon}
            alt="toggle navigation menu icon"
            role="presentation"
            onClick={onClose}
          />
          <div className="ml-auto flex-center gap-20">
            <UniversalSearch />
            <Profile user={auth.user} handleLogout={handleLogout} />
            <Notification />
          </div>
        </div>
        <NavList />
        <div className={styles.mobileFooter}>
          <Link to="/">
            <img src={Logo} alt="logo" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MobileNav;
