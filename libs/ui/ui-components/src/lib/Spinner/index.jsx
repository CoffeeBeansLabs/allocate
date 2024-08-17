import React from "react";

import styles from "./spinner.module.css";

const Spinner = () => (
  <div className={styles.spinnerBody}>
    <div className={styles.spinnerWrapper}>
      <div className={styles.spinnerRipple}>
        <div />
        <div />
      </div>
    </div>
  </div>
);

export { Spinner };
