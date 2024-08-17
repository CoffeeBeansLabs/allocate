import React from "react";

import ArrowDown from "/icons/arrow-down.svg";
import ArrowUp from "/icons/arrow-up.svg";

import { clientSortOptions } from "../../../constants/clientSorting";
import styles from "../clients.module.css";

const ClientSortDropDown = clientSortOptions.map((option) => ({
  value: option.value,
  label: (
    <div className={styles.clientSortDropdown}>
      <div>{option.label}</div>
      {option.sortBy === "Ascending" ? (
        <img src={ArrowUp} alt="Arrow Up" className={styles.arrowStyles} />
      ) : (
        <img src={ArrowDown} alt="Arrow Down" className={styles.arrowStyles} />
      )}
    </div>
  ),
}));

export default ClientSortDropDown;
