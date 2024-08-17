import { ReactSelect } from "@allocate-core/ui-components";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import BlueArrow from "/icons/blueArrowIcon.svg";

import { isMobile } from "../../../common/common";
import styles from "./components.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const sortOptions = [
  { label: "A-Z", value: "asc" },
  { label: "Z-A", value: "desc" },
];

const findFirstNonZerothIndex = (arr) => {
  return arr?.findIndex((val) => val !== 0);
};

const splitter = (str, l) => {
  let strs = [];
  while (str.length > l) {
    let pos = str.substring(0, l).lastIndexOf(" ");
    pos = pos <= 0 ? l : pos;
    strs.push(str.substring(0, pos));
    let i = str.indexOf(" ", pos) + 1;
    if (i < pos || i > pos + l) i = pos;
    str = str.substring(i);
  }
  strs.push(str);
  return strs;
};

const getMaxStringLength = (arr) => {
  let maxLen = 0;
  arr.map((a) => (maxLen = Math.max(maxLen, a.length)));
  return maxLen;
};

const getDatasetFormat = (labels, dataset, graphConfig) => {
  return {
    labels,
    datasets: graphConfig?.map((config, idx) => ({
      label: config.label,
      data: dataset?.reduce((acc, currentVal) => {
        return acc.concat(
          currentVal[idx]
            ? currentVal[idx].length
              ? [...currentVal[idx]]
              : [currentVal[idx]]
            : [null],
        );
      }, []),
      backgroundColor: config.color,
      maxBarThickness: 15,
      minBarLength: 5,
      skipNull: true,
    })),
  };
};

const BarGraph = ({
  labels,
  dataValues,
  showLegend = false,
  showTitle = false,
  graphConfig = [],
  isAscendingOrder,
  updateSortOrder = () => {},
  showSorting = false,
  showExperienceGraph = false,
  projectTooltip,
  roleTooltip,
}) => {
  const MAX_XAXIS_VALUES = isMobile ? 6 : showExperienceGraph ? 10 : 15;
  const INCREMENT_VALUE = isMobile ? 6 : 10;
  const [dataset, setDataset] = useState([]);
  const [datasetLabels, setDatasetLabels] = useState([]);
  const [currentDataMaxIndex, setCurrentDataMaxIndex] = useState(MAX_XAXIS_VALUES);
  const [currentDataMinIndex, setCurrentDataMinIndex] = useState(0);
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });
  const [sortValue, setSortValue] = useState(
    sortOptions.find((option) =>
      isAscendingOrder ? option.value === "asc" : option.value === "desc",
    ),
  );

  const dataCount = dataValues?.length;

  useEffect(() => {
    setDataset(dataValues?.slice(currentDataMinIndex, currentDataMaxIndex + 1));
    setDatasetLabels(labels?.slice(currentDataMinIndex, currentDataMaxIndex + 1));
  }, [currentDataMaxIndex, currentDataMinIndex]);

  const options = {
    type: "stacked",
    interaction: {
      mode: "point",
      intersect: true,
    },
    onHover: (event, element) => {
      event.native.target.style.cursor = element.length ? "pointer" : "default";
    },
    plugins: {
      tooltip: {
        enabled: true,
        boxPadding: 5,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
      },
      legend: {
        display: showLegend,
        align: "end",
        labels: {
          padding: 25,
          color: "#252733",
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "rounded",
          font: {
            family: "Montserrat",
            size: 12,
            weight: 500,
          },
        },
      },
      title: {
        display: showTitle,
        text: "No. of Open Positions",
        color: "#252733",
        font: {
          family: "Montserrat",
          size: 16,
          weight: 500,
        },
      },
    },
    maintainAspectRatio: !isMobile,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        max: MAX_XAXIS_VALUES - 1,
        ticks: {
          beginAtZero: true,
          color: "#AFAFAF",
          minRotation: 90,
          maxRotation: 90,
          callback: function (value) {
            const label = this.getLabelForValue(value);

            if (/\s/.test(label)) {
              return splitter(label, getMaxStringLength(datasetLabels) / 2 + 5);
            } else {
              return label;
            }
          },
          font: {
            family: "Montserrat",
            size: 16,
            weight: 500,
          },
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        ticks: {
          min: 0,
          stepSize: 1,
          color: "#AFAFAF",
          font: {
            family: "Montserrat",
            size: 16,
            weight: 500,
          },
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderWidth: 1.2,
        borderColor: "#FFFFFF",
        borderRadius: (context) => {
          const bottomStackBorder = {
            topLeft: 0,
            topRight: 0,
            bottomLeft: 10,
            bottomRight: 10,
          };
          const topStackBorder = {
            topLeft: 10,
            topRight: 10,
            bottomLeft: 0,
            bottomRight: 0,
          };
          const endsOfStackBorder = {
            topLeft: 10,
            topRight: 10,
            bottomLeft: 10,
            bottomRight: 10,
          };

          if (context.dataIndex >= 0) {
            const reverseDataValue =
              dataset[context.dataIndex] && [...dataset[context.dataIndex]].reverse();
            const firstNonZeroIndex = findFirstNonZerothIndex(dataset[context.dataIndex]);
            const lastNonZeroIndex =
              context.chart.data.datasets.length -
              1 -
              findFirstNonZerothIndex(reverseDataValue);

            if (
              firstNonZeroIndex === lastNonZeroIndex &&
              context.datasetIndex === firstNonZeroIndex
            )
              return endsOfStackBorder;
            else if (context.datasetIndex === firstNonZeroIndex) return bottomStackBorder;
            else if (context.datasetIndex === lastNonZeroIndex) return topStackBorder;
          }
          return 0;
        },
        borderSkipped: false,
      },
    },
  };

  const experienceGraphOptions = {
    ...options,
    type: "bar",
    plugins: {
      ...options.plugins,
      tooltip: {
        ...options.plugins.tooltip,
        displayColors: false,
        callbacks: {
          title: () => null,
          label: (context) => {
            const label = context.label;
            const count = context.dataset.label;
            const experience = `${context.raw?.y[0]}-${context.raw.y[1]}`;
            return [
              `Project: ${projectTooltip || label}`,
              `Role: ${roleTooltip || label}`,
              `Exp: ${experience} years`,
              `Count: ${count}`,
            ];
          },
        },
      },
    },
    scales: {
      ...options.scales,
      x: {
        ...options.scales.x,
        stacked: false,
      },
      y: {
        ...options.scales.y,
        stacked: false,
      },
    },
    elements: {
      bar: {
        ...options.elements.bar,
        borderRadius: 10,
      },
    },
  };

  const plugin = {
    beforeInit(chart) {
      const originalFit = chart.legend.fit;
      chart.legend.fit = function fit() {
        originalFit.bind(chart.legend)();
        this.height += 20;
      };
    },
  };

  useEffect(() => {
    setData({ ...getDatasetFormat(datasetLabels, dataset, graphConfig) });
  }, [dataset, datasetLabels]);

  if (!dataValues?.length)
    return (
      <div className={`${styles.card} flex-center ${styles.graphWrapper}`}>No data</div>
    );

  return (
    <div className={styles.card}>
      <div className={`col-xl-3 ml-auto ${showSorting ? "show" : "hide"}`}>
        <ReactSelect
          value={sortValue}
          onChange={(option) => {
            setSortValue(option);
            updateSortOrder(option.value === "asc");
          }}
          options={sortOptions}
        />
      </div>
      <div className={styles.graphWrapper}>
        <Bar
          options={showExperienceGraph ? experienceGraphOptions : options}
          data={data}
          plugins={[plugin]}
        />

        {dataCount > MAX_XAXIS_VALUES && (
          <div className={`row ${styles.scrollBar}`}>
            <div
              className={`${styles.scrollArrowButton} ${
                currentDataMinIndex === 0 ? "hide" : "show"
              }`}
              role="presentation"
              onClick={() => {
                setCurrentDataMinIndex((prevValue) =>
                  Math.max(prevValue - INCREMENT_VALUE, 0),
                );
                setCurrentDataMaxIndex((prevValue) =>
                  Math.max(currentDataMinIndex, 0) > 0
                    ? Math.max(currentDataMinIndex - INCREMENT_VALUE, 0) === 0
                      ? prevValue - currentDataMinIndex
                      : prevValue - INCREMENT_VALUE
                    : prevValue,
                );
              }}
            >
              <img
                src={BlueArrow}
                alt="blue left arrow"
                style={{ transform: "rotate(180deg)" }}
              />
            </div>
            <div
              className={`${styles.scrollArrowButton} ml-auto ${
                currentDataMaxIndex === dataCount ? "hide" : "show"
              }`}
              role="presentation"
              onClick={() => {
                setCurrentDataMaxIndex((prevValue) =>
                  Math.min(prevValue + INCREMENT_VALUE, dataCount),
                );

                setCurrentDataMinIndex((prevValue) =>
                  Math.min(currentDataMaxIndex, dataCount) < dataCount
                    ? Math.min(currentDataMaxIndex + INCREMENT_VALUE, dataCount) ===
                      dataCount
                      ? prevValue + (dataCount - currentDataMaxIndex)
                      : prevValue + INCREMENT_VALUE
                    : prevValue,
                );
              }}
            >
              <img src={BlueArrow} alt="blue right arrow" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarGraph;
