import { View } from "@allocate-core/ui-components";
import {
  getAllocationsRange,
  getDateStartCol,
  getLeavesRange,
  MAX_UTILIZATION,
} from "@allocate-core/util-data-values";
import { isEqual, isSameMonth, setMonth, startOfMonth } from "date-fns";
import PropTypes from "prop-types";
import React from "react";

import {
  CURRENT_PROJECT,
  KT_PERIOD_BG_IMAGE,
  NOT_ACTIVE_BG_IMAGE,
  ON_LEAVE,
  OTHER_PROJECT,
  OVER_ALLOCATION_COLOR,
  REQUEST_BG_IMAGE,
  TALENT_AVAILABLE,
} from "../../constants/timelineColors";
import TimelineRow from "./TimelineRow";
import TimelineRowPartial from "./TimelineRowPartial";
import ZeroAllocation from "./ZeroAllocation";

const UserAllocation = ({
  user,
  month,
  userIdx,
  posIndex,
  numberOfColumns,
  type = "projects",
}) => {
  const lwdMonth = startOfMonth(new Date(user?.lastWorkingDay));
  const currentMonthStartDate = startOfMonth(setMonth(new Date(), month));
  const lwdStartCol = getLwdStartCol(user, month, currentMonthStartDate);
  const leaveInRange = getLeavesRange(user.leavePlans || user.leaves, month);

  if (isUserInactive(user, month)) {
    return renderInactiveUser(leaveInRange);
  }

  if (isUserAvailable(user, type)) {
    return renderZeroAllocation(leaveInRange);
  }

  const consolidatedProjects = getConsolidatedProjects(user, type);
  const projectsTotalUtilization = getProjectsTotalUtilization(consolidatedProjects);

  if (isUserUnassigned(projectsTotalUtilization, consolidatedProjects, user)) {
    return renderZeroAllocation(leaveInRange);
  }

  const allocationsInRange = getAllocationsRange(consolidatedProjects, month);
  const { rows, rowStart, rowsEnd } = generateAllocationRows({
    allocationsInRange,
    user,
    userIdx,
    posIndex,
    numberOfColumns,
    lwdMonth,
    currentMonthStartDate,
    lwdStartCol,
  });

  return renderFinalOutput({
    rows,
    rowStart,
    rowsEnd,
    leaveInRange,
    user,
    lwdMonth,
    currentMonthStartDate,
  });
};

const getLwdStartCol = (user, month, currentMonthStartDate) => {
  return user?.lastWorkingDay &&
    isSameMonth(new Date(user?.lastWorkingDay), currentMonthStartDate)
    ? getDateStartCol(user?.lastWorkingDay, month)
    : null;
};

const isUserInactive = (user, month) => {
  return (
    user?.lastWorkingDay &&
    new Date(user?.lastWorkingDay) < startOfMonth(setMonth(new Date(), month))
  );
};

const isUserAvailable = (user, type) => {
  return !(user?.requests?.length || user[type]?.length) && !user?.lastWorkingDay;
};

const getConsolidatedProjects = (user, type) => {
  const userRequests = user.requests?.length
    ? user.requests.map((request) => ({
        ...request,
        requestId: request.id,
        isSameProject: false,
        isRequest: true,
        projectName: request?.projectName,
      }))
    : [];
  return [...(Array.isArray(user[type]) ? user[type] : []), ...userRequests];
};

const getProjectsTotalUtilization = (projects) => {
  return projects?.reduce((acc, project) => acc + project.utilization, 0);
};

const isUserUnassigned = (totalUtilization, projects, user) => {
  return (!totalUtilization || !projects?.length) && !user?.lastWorkingDay;
};

const generateAllocationRows = ({
  allocationsInRange,
  user,
  userIdx,
  posIndex,
  numberOfColumns,
  lwdMonth,
  currentMonthStartDate,
  lwdStartCol,
}) => {
  let rows = [];
  let rowStart = null;
  let rowsEnd = null;
  let minColumnCovered = numberOfColumns + 1;
  let maxColumnCovered = 0;

  Object.entries(allocationsInRange).forEach(([timeRange, allocation]) => {
    const [startCol, cols] = timeRange.split("_").map(Number);
    const timelineStart = startCol;
    const timelineEnd = timelineStart + cols;
    minColumnCovered = Math.min(minColumnCovered, timelineStart);
    maxColumnCovered = Math.max(maxColumnCovered, timelineEnd);

    const allocationRows = generateAllocationRowsForTimeRange({
      allocation,
      user,
      userIdx,
      posIndex,
      startCol,
      cols,
    });

    if (Array.isArray(allocationRows) && allocationRows.length) {
      rows.push(
        <View
          key={`${timeRange}_after_kt_period`}
          hide={timelineEnd - timelineStart < 1}
          className="relative"
          style={{
            borderRadius: 3,
            padding: "0 2px",
            gridColumnStart: timelineStart + 1,
            gridColumnEnd: timelineEnd + 1,
            zIndex: 2,
          }}
        >
          {allocationRows}
        </View>,
      );
    } else {
      rows.push(
        <TimelineRow
          key={`${user?.id}_available}`}
          hideTooltip
          startCol={startCol}
          cols={cols}
          zIndexDiff={15}
          projectData={{
            utilization: allocation?.available,
          }}
          backgroundColor={TALENT_AVAILABLE}
        />,
      );
    }
  });

  ({ rowStart, rowsEnd } = generateStartEndRows({
    user,
    lwdMonth,
    currentMonthStartDate,
    lwdStartCol,
    minColumnCovered,
    maxColumnCovered,
    numberOfColumns,
  }));

  return { rows, rowStart, rowsEnd };
};

const getBackgroundColor = (isSameProject, overallAllocation) => {
  if (overallAllocation > 100) return OVER_ALLOCATION_COLOR;
  return isSameProject ? CURRENT_PROJECT : OTHER_PROJECT;
};

const generateAllocationRowsForTimeRange = ({
  allocation,
  user,
  userIdx,
  posIndex,
  startCol,
  cols,
}) => {
  if (!allocation?.projects?.length) return [];

  const overallAllocation = allocation.allocation;

  const createRow = (project, proIdx, rowType) => {
    const zIndexDiff = userIdx - posIndex + proIdx;
    const key = `${rowType}_${user?.id}_${project.id}_${cols}_${startCol}`;

    switch (rowType) {
      case "KT_PERIOD":
        return (
          <TimelineRowPartial
            key={key}
            backgroundColor="none"
            backgroundImage={KT_PERIOD_BG_IMAGE}
            projectData={project}
            hideTooltip={false}
            available={false}
            zIndexDiff={zIndexDiff}
          />
        );
      case "REQUEST":
        return (
          <TimelineRowPartial
            key={key}
            backgroundColor="none"
            backgroundImage={REQUEST_BG_IMAGE}
            projectData={project}
            hideTooltip={false}
            available={false}
            zIndexDiff={zIndexDiff}
          />
        );
      case "PROJECT":
        return (
          <TimelineRowPartial
            key={key}
            backgroundColor={getBackgroundColor(project.isSameProject, overallAllocation)}
            projectData={project}
            hideTooltip={false}
            available={false}
            zIndexDiff={zIndexDiff}
            isOverAllocated={overallAllocation > 100}
          />
        );
      case "UNALLOCATED":
        return (
          <TimelineRowPartial
            key={key}
            backgroundColor={TALENT_AVAILABLE}
            projectData={{
              ...project,
              utilization: MAX_UTILIZATION - overallAllocation,
            }}
            hideTooltip={false}
            available={true}
            zIndexDiff={zIndexDiff - 1}
          />
        );
    }
  };
  let currentTotalAllocation = 0;

  return allocation.projects.flatMap((project, proIdx) => {
    const rows = [];

    if (project.utilization && project.startDate) {
      currentTotalAllocation += project.utilization;

      if (project.type) {
        rows.push([createRow(project, proIdx, project.type)]);
      }

      if (
        overallAllocation < MAX_UTILIZATION &&
        currentTotalAllocation === overallAllocation
      ) {
        rows.push(createRow(project, proIdx, "UNALLOCATED"));
      }
    }

    return rows;
  });
};

const generateStartEndRows = ({
  user,
  lwdMonth,
  currentMonthStartDate,
  lwdStartCol,
  minColumnCovered,
  maxColumnCovered,
  numberOfColumns,
}) => {
  let rowStart = null;
  let rowsEnd = null;

  if (minColumnCovered > 0 && minColumnCovered < numberOfColumns) {
    rowStart = (
      <TimelineRow
        available
        hideTooltip
        startCol={0}
        cols={minColumnCovered}
        zIndexDiff={19}
        projectData={{ utilization: MAX_UTILIZATION }}
        backgroundColor={TALENT_AVAILABLE}
        key={`${user?.id}_start_available`}
      />
    );
  }

  if (
    (maxColumnCovered > 0 || user?.lastWorkingDay) &&
    maxColumnCovered < numberOfColumns
  ) {
    if (user?.lastWorkingDay && isEqual(lwdMonth, currentMonthStartDate)) {
      if (lwdStartCol + 1 > maxColumnCovered) {
        rowsEnd = [
          <TimelineRow
            available
            hideTooltip
            zIndexDiff={19}
            startCol={maxColumnCovered}
            cols={lwdStartCol - maxColumnCovered + 1}
            projectData={{ utilization: MAX_UTILIZATION }}
            backgroundColor={TALENT_AVAILABLE}
            key={`${user?.id}_end_available`}
          />,
          <TimelineRow
            available
            hideTooltip
            zIndexDiff={19}
            startCol={lwdStartCol + 1}
            cols={numberOfColumns - lwdStartCol}
            projectData={{ utilization: MAX_UTILIZATION }}
            backgroundColor="none"
            backgroundImage={NOT_ACTIVE_BG_IMAGE}
            key={`${user?.id}_end_inactive`}
          />,
        ];
      } else {
        rowsEnd = (
          <TimelineRow
            available
            hideTooltip
            zIndexDiff={19}
            startCol={lwdStartCol + 1}
            cols={numberOfColumns - lwdStartCol}
            projectData={{ utilization: MAX_UTILIZATION }}
            backgroundColor="none"
            backgroundImage={NOT_ACTIVE_BG_IMAGE}
            key={`${user?.id}_end_inactive`}
          />
        );
      }
    } else {
      rowsEnd = (
        <TimelineRow
          available
          hideTooltip
          zIndexDiff={19}
          startCol={maxColumnCovered}
          cols={numberOfColumns - maxColumnCovered}
          projectData={{ utilization: MAX_UTILIZATION }}
          backgroundColor={TALENT_AVAILABLE}
          key={`${user?.id}_end_available`}
        />
      );
    }
  }

  return { rowStart, rowsEnd };
};

const renderInactiveUser = (leaveInRange) => {
  return [
    <>
      <ZeroAllocation isNotActive />
      {leaveInRange.length ? renderLeaveRows(leaveInRange) : null}
    </>,
  ];
};

const renderZeroAllocation = (leaveInRange) => {
  return [
    <>
      <ZeroAllocation />
      {leaveInRange.length ? renderLeaveRows(leaveInRange) : null}
    </>,
  ];
};

const renderLeaveRows = (leaveInRange) => {
  return leaveInRange.map((leave) => (
    <TimelineRow
      hideTooltip
      startCol={leave.startCol}
      cols={leave.cols}
      zIndexDiff={15}
      projectData={{ utilization: 15 }}
      backgroundColor={ON_LEAVE}
      key={`leave_${leave.startCol}_${leave.cols}`}
      style={{ marginTop: "3px" }}
    />
  ));
};

const renderFinalOutput = ({
  rows,
  rowStart,
  rowsEnd,
  leaveInRange,
  user,
  lwdMonth,
  currentMonthStartDate,
}) => {
  if (rows.length) {
    return [rowStart, rows, rowsEnd, renderLeaveRows(leaveInRange)];
  } else if (user?.lastWorkingDay && isEqual(lwdMonth, currentMonthStartDate)) {
    return [rowStart, rowsEnd];
  }

  return renderZeroAllocation(leaveInRange);
};

UserAllocation.propTypes = {
  user: PropTypes.object.isRequired,
  month: PropTypes.number.isRequired,
  userIdx: PropTypes.number.isRequired,
  posIndex: PropTypes.number.isRequired,
  numberOfColumns: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["projects", "allocation"]),
};

export default UserAllocation;
