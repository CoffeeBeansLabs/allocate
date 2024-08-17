import { Text } from "@allocate-core/ui-components";
import React from "react";

const DatesInCurrentTimeline = ({ currentTimeline = [] }) => {
  return currentTimeline.map((item, idx) => {
    return (
      <Text
        as="div"
        size="b3"
        className="text-center"
        key={`${item.day}_${idx}`}
        style={{
          backgroundColor: item.isWeekend ? "var(--color-Platinum)" : "unset",
        }}
      >
        <div
          style={{
            backgroundColor: item.isWeekend
              ? "var(--color-Platinum)"
              : "var(--color-White)",
            zIndex: "10",
            position: "sticky",
            top: "45px",
            height: "20px",
          }}
        >{`${item.day} ${item.date}`}</div>
      </Text>
    );
  });
};

export default DatesInCurrentTimeline;
