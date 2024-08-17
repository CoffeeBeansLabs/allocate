import React from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "/images/logo.svg";

import { isMobile } from "../../common/common";
import { SCOPES } from "../../constants/roles";
import { useAuthStore } from "../../store/authStore";
import PermissionGate from "../PermissionGate";
import styles from "./header.module.css";
import NavList from "./NavList";
import Notification from "./Notification";
import Profile from "./Profile";
import UniversalSearch from "./UniversalSearch";

const Header = ({ children }) => {
  const navigate = useNavigate();

  const auth = useAuthStore();

  const handleLogout = () => {
    auth.signOut(() => {
      navigate("/login");
    });
  };

  return isMobile ? (
    <header className={styles.navbar}>{children}</header>
  ) : (
    <header className={styles.navbar}>
      <Link to="/">
        <img src={Logo} alt="logo" />
      </Link>
      <NavList />
      <div className="flex align-center gap-40">
        <UniversalSearch />
        <PermissionGate
          permittedElement={() => <Notification />}
          scopes={[SCOPES.canViewNotifications]}
        />
        <Profile user={auth?.user} handleLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;
