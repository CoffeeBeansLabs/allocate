import React, { useState } from "react";

import ChevronDown from "../../assets/chevron.svg";
import { Button } from "../Button";
import styles from "./accordion.module.css";

const Accordion = ({ header, children }) => {
  const [isVisible, setVisibility] = useState(false);

  return (
    <div>
      <Button
        variant="plain"
        className={styles.accordionHeader}
        onClick={() => setVisibility((visible) => !visible)}
      >
        {header}
        <img
          src={ChevronDown}
          className={isVisible ? styles.chevronUp : ""}
          alt="Chevron down, toggle to collapse content"
        />
      </Button>
      {isVisible ? children : null}
    </div>
  );
};

Accordion.displayName = "Accordion";

export { Accordion };
