import { Text } from "@allocate-core/ui-components";
import React from "react";

import StatusIcons from "../../../constants/status";
import styles from "./components.module.css";

const StatusOptions = StatusIcons.map((status) => ({
  value: status.type.toUpperCase(),
  label: (
    <div className={`flex align-center ${styles.customLabel}`}>
      <img src={status.icon} alt="status icon" className={styles.iconImage} />
      <Text size="b2">{status.uiString}</Text>
    </div>
  ),
}));

export default StatusOptions;
