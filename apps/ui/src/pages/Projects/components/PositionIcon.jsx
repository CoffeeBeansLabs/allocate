import { Text, Tooltip } from "@allocate-core/ui-components";
import { ArcElement, Chart, Tooltip as tp } from "chart.js";
import { differenceInDays } from "date-fns";
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";

import { isMobile } from "../../../common/common";
import styles from "./components.module.css";

Chart.register(ArcElement, tp);

const getAllocation = (users = [], positionId) => {
  const projects = users.map((user) =>
    user.projects.filter(
      (proj) =>
        proj.isSameProject &&
        proj.positionId === positionId &&
        new Date(proj.startDate) <= new Date() &&
        (!proj.endDate || new Date() <= new Date(proj.endDate)),
    ),
  );

  let totalAllocation = 0;
  projects.map((projectPerUser) =>
    projectPerUser.map(
      (projectDetails) => (totalAllocation += projectDetails.utilization),
    ),
  );
  return totalAllocation;
};

const getFilledDays = (users = [], positionId) => {
  let filledDays = 0;
  users.map((user) => {
    let days = 0;
    user.projects.map((proj) => {
      if (proj.isSameProject && proj.positionId === positionId) {
        days += Math.max(
          differenceInDays(new Date(proj.endDate), new Date(proj.startDate)) + 1 || 0,
          days,
        );
      }
    });
    filledDays += days;
  });

  return filledDays;
};

const PositionIcon = ({ positionData }) => {
  const [tooltipInfo, setTooltipInfo] = useState("");
  const totalPositionDays =
    differenceInDays(new Date(positionData?.endDate), new Date(positionData?.startDate)) +
    1;
  const filledPositionDays = getFilledDays(positionData?.users, positionData?.id);
  const positionUnfilled = Math.ceil(
    ((totalPositionDays - filledPositionDays) / totalPositionDays) * 100,
  );

  const allocation = getAllocation(positionData?.users, positionData?.id) || 0;
  const utilization = positionData?.utilization || 0;
  const utilizationUnfilled = allocation
    ? Math.ceil(((utilization - allocation) / utilization) * 100)
    : 100;

  const doughnutChartData = {
    datasets: [
      {
        labels: ["Total Position Filled", "Position Empty"],
        data: [
          100 - positionUnfilled,
          100 - positionUnfilled > 100 ? 0 : positionUnfilled,
        ],
        backgroundColor: ["#4CBD97", "#F15858"],
        borderWidth: 0,
        cutout: "40%",
        radius: 16,
      },
      {
        labels: ["Current Allocation", "Unallocated"],
        data: [
          100 - utilizationUnfilled,
          100 - utilizationUnfilled > 100 ? 0 : utilizationUnfilled,
        ],
        backgroundColor: ["#91ECCD", "#FC8C8C"],
        borderWidth: 0,
        cutout: "30%",
        radius: 13,
      },
    ],
  };

  const options = {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: function (context) {
          const chartDataPoints = context.tooltip.dataPoints[0];
          const chartIndex = chartDataPoints.dataIndex;
          const chartLabels = chartDataPoints.dataset.labels;
          const chartData = chartDataPoints.dataset.data;

          setTooltipInfo(
            chartLabels?.[chartIndex] + ": " + chartData?.[chartIndex] + "%",
          );
        },
      },
    },
  };

  const tooltipContent = (
    <div className="flex-col">
      <div className="flex align-center gap-10">
        <span
          style={{ backgroundColor: "#4CBD97", height: "10px", width: "10px" }}
        ></span>
        <Text size="b3">Total Position Filled: {100 - positionUnfilled}%</Text>
      </div>
      <div className="flex align-center gap-10">
        <span
          style={{ backgroundColor: "#F15858", height: "10px", width: "10px" }}
        ></span>
        <Text size="b3">Position Empty: {positionUnfilled}% </Text>
      </div>
      <div className="flex align-center gap-10">
        <span
          style={{ backgroundColor: "#91ECCD", height: "10px", width: "10px" }}
        ></span>
        <Text size="b3">Current Allocation: {100 - utilizationUnfilled}% </Text>
      </div>
      <div className="flex align-center gap-10">
        <span
          style={{ backgroundColor: "#FC8C8C", height: "10px", width: "10px" }}
        ></span>
        <Text size="b3">Unallocated: {utilizationUnfilled}% </Text>
      </div>
    </div>
  );

  return (
    <Tooltip
      content={
        isMobile ? (
          tooltipContent
        ) : (
          <div>
            <Text className="flex justify-between gap-10" size="b3">
              {tooltipInfo}
            </Text>
          </div>
        )
      }
    >
      <div className={styles.positionIcon}>
        <Doughnut data={doughnutChartData} options={options} />
      </div>
    </Tooltip>
  );
};

export default PositionIcon;
