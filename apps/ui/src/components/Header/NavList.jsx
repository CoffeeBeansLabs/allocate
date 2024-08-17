import { Text } from "@allocate-core/ui-components";
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import ChevronIcon from "/icons/chevron.svg";

import { isMobile } from "../../common/common";
import navigations from "../../constants/navigations";
import { useClientStore } from "../../store/clientStore";
import { useCommonStore } from "../../store/commonStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { useProjectStore } from "../../store/projectStore";
import { useRecommendationStore } from "../../store/recommendationStore";
import { useSearchStore } from "../../store/searchStore";
import { useTalentStore } from "../../store/talentStore";
import PermissionGate from "../PermissionGate";
import styles from "./header.module.css";

const NavListItem = ({ navItem }) => {
  const location = useLocation();
  const [subNavOpen, setSubNavOpen] = useState(false);

  const resetClientStore = useClientStore((state) => state.resetStore);
  const resetProjectStore = useProjectStore((state) => state.resetStore);
  const resetRecommendationStore = useRecommendationStore((state) => state.resetStore);
  const resetDashboardStore = useDashboardStore((state) => state.resetStore);
  const resetTalentStore = useTalentStore((state) => state.resetStore);
  const setResetFromSamePage = useTalentStore((state) => state.setResetFromSamePage);
  const resetSearchStore = useSearchStore((state) => state.resetStore);
  const resetCommonStore = useCommonStore((state) => state.resetStore);
  const setResetQuickSearchForm = useCommonStore(
    (state) => state.setResetQuickSearchForm,
  );

  const handleNavigationClick = () => {
    window.sessionStorage.clear();
    if (location.pathname.includes("/people")) setResetFromSamePage(true);
    if (location.pathname.includes("/quick-search")) setResetQuickSearchForm(true);

    resetClientStore();
    resetProjectStore();

    if (!location.pathname.includes("/")) resetDashboardStore();

    if (!location.pathname.includes("/people/details/")) {
      resetRecommendationStore();
      resetSearchStore();
      resetTalentStore();
    }
    resetCommonStore();
  };

  return (
    <li
      className={`${navItem.subNav ? "relative " + styles.dropdownHover : ""}`}
      key={navItem.text}
    >
      <div className="flex">
        <NavLink to={navItem.linkTo} onClick={handleNavigationClick}>
          {({ isActive }) => (
            <div
              className={`${styles.navLink} ${
                isActive || location.pathname.includes(navItem.activeLinks)
                  ? styles.active
                  : ""
              }`}
            >
              <Text size="b1" fontWeight="medium" className={styles.navigationItem}>
                {navItem.text}
              </Text>
            </div>
          )}
        </NavLink>
        {navItem.subNav && isMobile ? (
          <img
            src={ChevronIcon}
            alt="chevron icon"
            className={`ml-auto ${subNavOpen ? styles.rotate180 : undefined}`}
            role="presentation"
            onClick={() => setSubNavOpen((prevValue) => !prevValue)}
          />
        ) : null}
      </div>
      {navItem.subNav ? (
        isMobile ? (
          <ul className={subNavOpen ? "show" : "hide"}>
            {navItem.subNav.map((subNav) => (
              <li key={subNav.text}>
                <NavLink reloadDocument to={subNav.linkTo}>
                  {({ isActive }) => (
                    <div className={`${styles.navLink} ${isActive ? styles.active : ""}`}>
                      <Text size="b2" fontWeight="medium">
                        {subNav.text}
                      </Text>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={`card-1 absolute ${styles.navDropdown}`} aria-label="dropdown">
            {navItem.subNav.map((subNavItem) => (
              <li
                className={`${styles.menuItem} ${subNavItem.disabled ? "disabled" : ""}`}
                key={subNavItem.text}
              >
                <NavLink className="d-block" to={subNavItem.linkTo}>
                  {subNavItem.text}
                </NavLink>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </li>
  );
};

const NavList = () => {
  return (
    <nav className={styles.navList}>
      <ul>
        {navigations().map((navItem) => (
          <PermissionGate
            key={navItem.text}
            permittedElement={() => <NavListItem navItem={navItem} />}
            scopes={navItem.scope}
          />
        ))}
      </ul>
    </nav>
  );
};

export default NavList;
