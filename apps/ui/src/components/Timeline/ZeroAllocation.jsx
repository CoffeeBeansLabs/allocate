import { MAX_UTILIZATION } from "@allocate-core/util-data-values";
import React from "react";

import { NOT_ACTIVE_BG_IMAGE, TALENT_AVAILABLE } from "../../constants/timelineColors";
import TimelineRow from "./TimelineRow";

const ZeroAllocation = ({ isNotActive = false }) => (
  <TimelineRow
    available
    hideTooltip
    startCol={0}
    cols={32}
    zIndexDiff={20}
    projectData={{ utilization: MAX_UTILIZATION }}
    backgroundImage={isNotActive ? NOT_ACTIVE_BG_IMAGE : "none"}
    backgroundColor={isNotActive ? "none" : TALENT_AVAILABLE}
  />
);

export default ZeroAllocation;
