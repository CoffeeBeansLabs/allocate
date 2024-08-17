import { Text } from "@allocate-core/ui-components";
import { isSameDay } from "date-fns";
import React from "react";

import Chevron from "/icons/chevron.svg";
import ViewOptions from "/icons/viewOptionsIcon.svg";

import styles from "./components.module.css";

const TimelineHeader = ({ currentTimeline, currentDate }) => {
  return (
    <div className={`row no-gutters flex-center ${styles.timelineHeaderContainer}`}>
      <Text className="col-xl-2" as="div" size="b1" fontWeight="medium">
        Timeline
      </Text>
      <div className={`col-xl-10 ${styles.timelineHeader1} flex`}>
        <img src={Chevron} alt="Chevron left" className={styles.chevronLeft} />
        <div className={styles.timelineHeader}>
          {currentTimeline.map((week, idx) => {
            return (
              <WeekRow key={`week_${idx}`} dates={[...week]} currentDate={currentDate} />
            );
          })}
        </div>
        <img src={Chevron} alt="Chevron right" className={styles.chevronRight} />
        <img src={ViewOptions} alt="View more information of talent" />
        <div className={styles.timelineOptions} />
      </div>
    </div>
  );
};

const WeekRow = ({ dates, currentDate }) => {
  return (
    <div className={`${styles.weekRow} ${styles.talentWeekTimeline}`}>
      {dates.map((day) => (
        <Text
          key={`${day.date}_${day.month}_${day.year}`}
          size="b1"
          fontWeight="regular"
          className={`${styles.date} ${
            isSameDay(currentDate, day.dateInstance) ? styles.activeDate : ""
          }`}
        >
          {day.date}
        </Text>
      ))}
    </div>
  );
};

export default TimelineHeader;
