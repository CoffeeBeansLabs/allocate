import { Text, Tooltip } from "@allocate-core/ui-components";
import React from "react";

import StatusIcons from "../../../constants/status";
import styles from "./components.module.css";

const StatusLegends = () => {
  return (
    <div className={`${styles.legend} flex`}>
      {StatusIcons.map((status, idx) => (
        <Tooltip
          key={`${status.type}_${idx}`}
          content={
            <Text size="b3" fontWeight="medium">
              {status.description}
            </Text>
          }
          direction="bottom"
        >
          <img src={status.icon} alt={status.description} />
        </Tooltip>
      ))}
    </div>
  );
};

export default StatusLegends;
