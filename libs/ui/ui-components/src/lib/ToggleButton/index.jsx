import React, { useState } from "react";
import { useEffect } from "react";

import styles from "./toggleButton.module.css";

const ToggleButton = ({ label, toggled, onClick }) => {
  const [isToggled, setIsToggled] = useState(toggled);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    onClick(!isToggled);
  };

  useEffect(() => {
    setIsToggled(toggled);
  }, [toggled]);

  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={isToggled}
        onChange={handleToggle}
        className={styles.toggleInput}
      />
      <span className={styles.toggleSpan} />
      <strong>{label}</strong>
    </label>
  );
};

export { ToggleButton };
