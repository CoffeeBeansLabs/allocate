import PropTypes from "prop-types";
import React from "react";

import styles from "./tooltip.module.css";

const Tooltip = ({ direction, content, children }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className={`${styles.tooltipWrapper}`}
    >
      {children}
      <div
        className={`${styles.tooltip} ${styles[direction]}`}
        style={show ? { visibility: "visible" } : { visibility: "hidden" }}
      >
        {content}
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  direction: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  content: PropTypes.object || PropTypes.string,
  children: PropTypes.object || PropTypes.string,
};

export { Tooltip };
