import PropTypes from "prop-types";
import React from "react";

import { Text } from "../Typography";
import styles from "./logoPlaceholder.module.css";

const LogoPlaceholder = ({ text, theme }) => {
  const getAbbreviation = (projectName) => {
    const letters = projectName.split(" ");
    return letters.length > 1
      ? (letters[0][0] + letters[1][0]).toUpperCase()
      : projectName.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`${styles.wrapper} ${styles[theme]}`}>
      <Text size="b2" fontWeight="medium">
        {getAbbreviation(text)}
      </Text>
    </div>
  );
};

LogoPlaceholder.propTypes = {
  text: PropTypes.string,
  theme: PropTypes.oneOf(["light", "dark"]),
};

export { LogoPlaceholder };
