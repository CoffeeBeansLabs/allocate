import { Image } from "@allocate-core/ui-components";
import { Heading, Text } from "@allocate-core/ui-components";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SCOPES } from "../../constants/roles";
import PermissionGate from "../PermissionGate";
import styles from "./header.module.css";

const Profile = ({ user, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useHandleClickOutside({
    onOutSideClick: () => {
      setIsMenuOpen(false);
    },
    wrapperRef: menuRef,
  });

  const profileNavItems = [
    {
      id: "skillPortal",
      label: "Skill Portal Access",
      linkUrl: "/skill-portal",
      scopes: [SCOPES.canAccessSkillPortal],
    },
    {
      id: "userManagement",
      label: "User Management",
      linkUrl: "/user-management",
      scopes: [SCOPES.canAccessUserManagement],
    },
  ];

  const handleNavigationClick = (navURL) => {
    navigate(navURL);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.profile} ref={menuRef}>
      <Image
        alt="Profile picture of User"
        src={user?.picture}
        fallbackSrc="https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
        onClick={() => setIsMenuOpen((current) => !current)}
      />
      {isMenuOpen && (
        <div className={`card-1 ${styles.profileMenu}`}>
          <div className={`flex-col gap-10 ${styles.userInfo}`}>
            <Heading size="h6" fontWeight="semibold">
              Signed In As:
            </Heading>
            <Text size="b2" fontWeight="regular">
              {user.firstName + " " + user.lastName}
            </Text>
            <Text size="b2" fontWeight="regular">
              {user.email}
            </Text>
          </div>
          {profileNavItems.map((item) => (
            <PermissionGate
              key={item.id}
              scopes={item.scopes}
              permittedElement={() => (
                <div
                  className={styles.menuItem}
                  role="button"
                  onClick={() => handleNavigationClick(item.linkUrl)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleNavigationClick(item.linkUrl)
                  }
                  tabIndex={0}
                >
                  <Text size="b2" fontWeight="regular">
                    {item.label}
                  </Text>
                </div>
              )}
            />
          ))}
          <div
            className={styles.menuItem}
            role="button"
            onClick={handleLogout}
            onKeyDown={handleLogout}
            tabIndex={0}
          >
            <Text size="b2" fontWeight="regular" className="error">
              Logout
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
