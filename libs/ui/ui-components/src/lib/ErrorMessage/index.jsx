import React from "react";

import { Text } from "../Typography";
import styles from "./errorMessage.module.css";

const ErrorMessage = ({ message }) => {
  return (
    <Text size="b2" className={styles.message}>
      {message}
    </Text>
  );
};

export { ErrorMessage };
