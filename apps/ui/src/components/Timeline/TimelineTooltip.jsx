import { Text, View } from "@allocate-core/ui-components";
import { format } from "date-fns";
import PropTypes from "prop-types";
import React from "react";

const TimelineTooltip = (props) => {
  const {
    hideTooltip,
    projectData: { projectName, startDate, endDate, utilization },
    available,
  } = props;

  if (available) {
    return (
      <View hide={hideTooltip}>
        <Text className="flex gap-20 justify-between" size="b3">
          <span>From:</span>
          <span>{startDate ? format(new Date(startDate), "PP") : "--"}</span>
        </Text>
        <Text className="flex gap-20 justify-between" size="b3">
          <span>To:</span>
          <span>{endDate ? format(new Date(endDate), "PP") : "--"}</span>
        </Text>
        <Text className="flex gap-20 justify-between" size="b3">
          <span>Availability:</span>
          <span>{utilization}%</span>
        </Text>
      </View>
    );
  }

  return (
    <View hide={hideTooltip}>
      <Text className="flex gap-20 justify-between" size="b3">
        <span>Project Name:</span>
        <span>{projectName}</span>
      </Text>
      <Text className="flex gap-20 justify-between" size="b3">
        <span>Allocated on:</span>
        <span>{startDate ? format(new Date(startDate), "PP") : "--"}</span>
      </Text>
      <Text className="flex gap-20 justify-between" size="b3">
        <span>Allocation:</span>
        <span>{`${utilization || "--"}% till ${
          endDate ? format(new Date(endDate), "PP") : "--"
        }`}</span>
      </Text>
    </View>
  );
};

TimelineTooltip.propTypes = {
  hideTooltip: PropTypes.bool,
  projectData: PropTypes.shape({
    projectName: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    utilization: PropTypes.number,
  }).isRequired,
  available: PropTypes.bool,
};

export default TimelineTooltip;
