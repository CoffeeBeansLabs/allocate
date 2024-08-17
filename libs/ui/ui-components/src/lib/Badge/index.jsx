import PropTypes from "prop-types";
import React from "react";

import { Text } from "../Typography";
import styles from "./badge.module.css";

const BadgeColors = ["red", "grey", "green", "charcoal"];

const Badge = ({ variant, children, isMobile }) => {
  return (
    <Text
      as="div"
      size={isMobile ? "b4" : "b2"}
      fontWeight="medium"
      className={`d-flex ${styles.badge} ${styles[variant]}`}
    >
      {children}
    </Text>
  );
};

Badge.propTypes = {
  name: PropTypes.string || PropTypes.object,
  variant: PropTypes.oneOf(BadgeColors),
};

export { Badge };
