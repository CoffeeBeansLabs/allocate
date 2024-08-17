import { Heading, Text } from "@allocate-core/ui-components";
import React from "react";

import DowntrendArrow from "/icons/downtrendArrow.svg";
import UptrendArrow from "/icons/uptrendArrow.svg";

import { isMobile } from "../../../common/common";
import styles from "./components.module.css";

const CountCard = ({ title, count, percentageChange, size, resize = false }) => {
  return (
    <div
      className={styles.card}
      style={
        resize
          ? { paddingTop: 13, paddingRight: 30, paddingBottom: 13, paddingLeft: 30 }
          : {}
      }
    >
      <Text
        size={isMobile ? "b3" : "b1"}
        fontWeight="medium"
        className={styles.countCardTitle}
      >
        {title}
      </Text>
      <div
        className={
          isMobile ? "flex-col gap-10 mt-16" : "flex justify-between align-center mt-16"
        }
      >
        <Heading size={size} fontWeight="bold">
          {count}
        </Heading>
        {percentageChange > 0 ? (
          <div className={isMobile ? "flex" : "flex-center gap-10"}>
            <img
              src={UptrendArrow}
              alt="up trend arrow in green"
              className={styles.arrowIcon}
            />
            <Text className="success" size={isMobile ? "b3" : "b1"}>
              +{percentageChange}%
            </Text>
          </div>
        ) : (
          <div className={isMobile ? "flex" : "flex-center gap-10"}>
            <img
              src={DowntrendArrow}
              alt="down trend arrow in red"
              className={styles.arrowIcon}
            />
            <Text className="error" size={isMobile ? "b3" : "b1"}>
              {percentageChange}%
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountCard;
