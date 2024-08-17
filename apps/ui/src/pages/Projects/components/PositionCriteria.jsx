import { Text } from "@allocate-core/ui-components";
import { format } from "date-fns";
import PropTypes from "prop-types";
import React from "react";

import styles from "./components.module.css";

const PositionCriteria = ({ criteria }) => {
  const {
    role,
    skills,
    startDate,
    endDate,
    utilization,
    experienceRangeStart,
    experienceRangeEnd,
    isBillable,
  } = criteria;

  return (
    <ul className={styles.positionInfoList}>
      <li>
        <Text as="div" size="b3">
          {role || "--"}
        </Text>
      </li>
      <li>
        <Text as="div" size="b3">
          {skills?.map((skill) => skill?.name || `Skill ${skill}`).join(", ")}.
        </Text>
      </li>
      <li>
        <Text as="div" size="b3">
          {`${experienceRangeStart} yrs - ${experienceRangeEnd} yrs`}
        </Text>
      </li>
      <li>
        <Text as="div" size="b3">
          {`${startDate ? format(new Date(startDate), "PP") : "--"} - ${
            endDate ? format(new Date(endDate), "PP") : "--"
          }`}
        </Text>
      </li>
      <li>
        <Text as="div" size="b3">
          {`${utilization}% Utilisation`}
        </Text>
      </li>
      <li>
        <Text as="div" size="b3">
          {isBillable ? "Billable" : "Non Billable"}
        </Text>
      </li>
    </ul>
  );
};

PositionCriteria.defaultProps = {
  criteria: {
    endDate: null,
    utilization: 0,
    startDate: null,
    experienceRangeEnd: 0,
    experienceRangeStart: 0,
    skills: [],
  },
};

PositionCriteria.propTypes = {
  criteria: PropTypes.shape({
    endDate: PropTypes.string,
    utilization: PropTypes.number,
    startDate: PropTypes.string,
    experienceRangeEnd: PropTypes.number,
    experienceRangeStart: PropTypes.number,
    skills: PropTypes.array,
  }),
};

export default React.memo(PositionCriteria);
