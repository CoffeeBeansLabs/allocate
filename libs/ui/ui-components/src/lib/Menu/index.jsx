import React from "react";

import ViewOptionsIcon from "../../assets/viewOptionsIcon.svg";
import styles from "./menu.module.css";

const Menu = ({ icon, menuWrapperClassName, menuClassName, children }) => {
  return (
    <div className={`relative ${styles.menu} ${menuWrapperClassName}`}>
      <img src={icon} alt="Expand more options menu" />
      <div className={`card-1 absolute ${styles.menuOptions} ${menuClassName}`}>
        {children}
      </div>
    </div>
  );
};

Menu.defaultProps = {
  menuClassName: "",
  icon: ViewOptionsIcon,
  menuWrapperClassName: "",
};

export { Menu };
