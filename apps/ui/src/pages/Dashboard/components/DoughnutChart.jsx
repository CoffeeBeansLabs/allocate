import { useHandleClickOutside } from "@allocate-core/util-hooks";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { element } from "prop-types";
import React, { useCallback, useRef, useState } from "react";
import { Doughnut, Pie } from "react-chartjs-2";

import styles from "./components.module.css";

Chart.register(ArcElement, Legend, Tooltip);

const DoughnutChart = ({ labels, doughnutColors, data }) => {
  let selectedDataIndex;
  let selectedIndex;

  const [pieChartData, setPieChartData] = useState({});
  const pieChartRef = useRef(null);

  useHandleClickOutside({
    onOutSideClick: () => {
      setPieChartData({});
      selectedDataIndex = undefined;
      selectedIndex = undefined;
    },
    wrapperRef: pieChartRef,
  });

  const doughnutChartData = {
    labels,
    datasets: [
      {
        labels,
        data: data,
        backgroundColor: doughnutColors,
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 4,
        cutout: "85%",
        borderRadius: 30,
        radius: 110,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    onHover: (event, element) => {
      event.native.target.style.cursor = element.length ? "pointer" : "default";
    },
    onClick: useCallback(
      (click, element, chart) => {
        if (element[0]) {
          selectedDataIndex = element[0].datasetIndex;
          selectedIndex = element[0].index;
          setPieChartData({
            labels,
            datasets: [
              {
                data: chart._metasets[0]._parsed,
                backgroundColor: chart._metasets[0]._dataset.backgroundColor.map(
                  (val, i) =>
                    i !== selectedIndex
                      ? "rgba(255, 255, 255, .5)"
                      : val.replace(/[^,]+(?=\))/, "0.5"),
                ),
                borderWidth: 0,
                radius: 90,
              },
            ],
          });
        }
      },
      [element[0]],
    ),

    plugins: {
      legend: {
        position: "bottom",
        onClick: (e) => e.stopPropagation(),
        labels: {
          usePointStyle: true,
          pointStyle: "rounded",
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const doughnutPlugins = [
    {
      afterDraw: (chart) => {
        const {
          ctx,
          chartArea: { width, height },
        } = chart;
        if (selectedDataIndex >= 0) {
          const value = chart._metasets[selectedDataIndex]._parsed[selectedIndex];
          ctx.save();
          ctx.font = "bold 40px Montserrat";
          ctx.fillStyle =
            chart.data.datasets[selectedDataIndex].backgroundColor[selectedIndex];
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(value, width / 2, height / 2);
          ctx.restore();
        }
      },
    },
  ];

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  return (
    <div className={styles.card}>
      <div className={`${styles.chartWrapper}`}>
        <div className={styles.doughnutChart}>
          <Doughnut
            data={doughnutChartData}
            options={doughnutOptions}
            plugins={doughnutPlugins}
          />
        </div>
        <div className={styles.pieChart} ref={pieChartRef}>
          {pieChartData.labels && <Pie data={pieChartData} options={pieChartOptions} />}
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;
