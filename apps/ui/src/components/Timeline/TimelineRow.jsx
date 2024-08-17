import "react-tippy/dist/tippy.css";

import { View } from "@allocate-core/ui-components";
import { getHeightValues } from "@allocate-core/util-data-values";
import React from "react";
import { Tooltip } from "react-tippy";

import { TRANSPARENT } from "../../constants/timelineColors";
import styles from "./timeline.module.css";
import TimelineTooltip from "./TimelineTooltip";

const TimelineRow = (props) => {
  const {
    cols,
    startCol,
    available,
    projectData,
    zIndexDiff = 0,
    backgroundColor,
    hideTooltip = false,
    backgroundImage = "none",
    style,
  } = props;
  const heightValues = getHeightValues(projectData.utilization);

  return (
    <View
      className={styles.timelineIndicatorBar}
      style={{
        ...heightValues,
        backgroundImage,
        zIndex: Math.abs(20 - zIndexDiff),
        display: cols > 0 && heightValues.minHeight ? "block" : "none",
        gridColumnStart: cols > 0 ? startCol + 1 : "none",
        gridColumnEnd: cols > 0 ? startCol + cols + 1 : "none",
        backgroundColor:
          available || projectData.utilization ? backgroundColor : TRANSPARENT,
        ...style,
      }}
    >
      <Tooltip
        disabled={hideTooltip}
        trigger="mouseenter"
        followCursor={true}
        arrow={true}
        position="bottom"
        instant
        html={<TimelineTooltip hideTooltip={hideTooltip} projectData={projectData} />}
      >
        <View
          className={styles.timelineIndicatorBar}
          style={{
            ...heightValues,
            backgroundImage,
            zIndex: Math.abs(20 - zIndexDiff) || null,
            backgroundColor:
              available || projectData.utilization ? backgroundColor : TRANSPARENT,
          }}
        ></View>
        {/* set true/false for debugging, don't forget to hide before deplyment */}
        <View hide className={styles.debugValue}>{`${startCol} - ${cols}`}</View>
      </Tooltip>
    </View>
  );
};

export default TimelineRow;
