import { Text, Tooltip } from "@allocate-core/ui-components";
import React from "react";

import styles from "./legends.module.css";

const legendData = [
  {
    text: "Other Project",
    color: "yellow",
  },
  {
    text: "Available",
    color: "green",
  },
  {
    text: "On Leave",
    color: "black",
  },
  {
    text: "Proposed",
    color: "pink",
  },
  {
    text: "KT Period",
    color: "gray",
  },
  {
    text: "0% Allocation",
    color: "yellowBorder",
  },
  {
    text: "Not Active",
    color: "inactiveRed",
  },
  {
    text: "Allocation > 100%",
    color: "fleshPink",
  },
];

const Legends = (props) => {
  return (
    <div className="hidden-sm-down row no-gutters" style={props.style}>
      <Tooltip
        content={
          <Text size="b3" fontWeight="medium">
            {props.currentProject || "Current Project"}
          </Text>
        }
        direction="top"
      >
        <div className={`flex align-center ${styles.legendItem}`}>
          <span className={`${styles.colorCode} ${styles.red}`} />
        </div>
      </Tooltip>
      {legendData.map((legend) => (
        <Tooltip
          key={legend.color}
          content={
            <Text size="b3" fontWeight="medium">
              {legend.text}
            </Text>
          }
          direction="top"
        >
          <div className={`flex align-center ${styles.legendItem}`}>
            <span
              className={`${styles.colorCode} ${styles[legend.color]}`}
              title={legend.text}
            />
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default Legends;
