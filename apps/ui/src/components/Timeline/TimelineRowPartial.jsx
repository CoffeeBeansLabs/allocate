import "react-tippy/dist/tippy.css";

import { View } from "@allocate-core/ui-components";
import { getHeightValues } from "@allocate-core/util-data-values";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "react-tippy";

import {
  OVER_ALLOCATION_COLOR,
  TALENT_AVAILABLE,
  TRANSPARENT,
} from "../../constants/timelineColors";
import styles from "./timeline.module.css";
import TimelineTooltip from "./TimelineTooltip";

const TimelineRowPartial = (props) => {
  const {
    zIndexDiff = 0,
    projectData,
    backgroundColor,
    backgroundImage = "none",
    hideTooltip,
    available,
    isOverAllocated,
  } = props;

  const heightValues = getHeightValues(projectData?.utilization, available);

  const BG_COLOR = available || projectData?.utilization ? backgroundColor : TRANSPARENT;

  const backgroundColorMap = {
    isOverAllocated: OVER_ALLOCATION_COLOR,
    available: TALENT_AVAILABLE,
    default: BG_COLOR,
  };

  let finalBackgroundColor = backgroundColorMap.default;

  if (isOverAllocated) {
    finalBackgroundColor = backgroundColorMap.isOverAllocated;
  } else if (available) {
    finalBackgroundColor = backgroundColorMap.available;
  }

  return (
    <Tooltip
      disabled={hideTooltip}
      trigger="mouseenter"
      followCursor={true}
      arrow={true}
      position="bottom"
      instant
      html={
        <TimelineTooltip
          hideTooltip={hideTooltip}
          projectData={projectData}
          available={available}
        />
      }
    >
      <View
        data-testid={available ? "available" : `${projectData.type}`}
        className={`${styles.timelineIndicatorBar} ${isOverAllocated ? styles.overAllocated : ""}`}
        style={{
          ...heightValues,
          backgroundImage,
          zIndex: Math.abs(20 - zIndexDiff) || null,
          backgroundColor: finalBackgroundColor,
        }}
      >
        {isOverAllocated && <View className={styles.overAllocationIndicator} />}
      </View>
    </Tooltip>
  );
};

TimelineRowPartial.propTypes = {
  zIndexDiff: PropTypes.number,
  projectData: PropTypes.shape({
    utilization: PropTypes.number,
    type: PropTypes.oneOf(["KT_PERIOD", "REQUEST", "PROJECT"]),
  }),
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.string,
  hideTooltip: PropTypes.bool,
  available: PropTypes.bool,
  isOverAllocated: PropTypes.bool,
};

export default TimelineRowPartial;
