import { render, screen } from "@testing-library/react";
import { format } from "date-fns";
import React from "react";

import TimelineTooltip from "./TimelineTooltip";

describe("TimelineTooltip", () => {
  const projectData = {
    projectName: "Project Alpha",
    startDate: "2024-07-01",
    endDate: "2024-07-31",
    utilization: 75,
  };

  test("renders correctly when available is true", () => {
    render(
      <TimelineTooltip hideTooltip={false} projectData={projectData} available={true} />,
    );

    expect(screen.getByText("From:")).toBeInTheDocument();
    expect(screen.getByText("To:")).toBeInTheDocument();
    expect(screen.getByText("Availability:")).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date(projectData.startDate), "PP")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date(projectData.endDate), "PP")),
    ).toBeInTheDocument();
    expect(screen.getByText(`${projectData.utilization}%`)).toBeInTheDocument();
  });

  test("renders correctly when available is false", () => {
    render(
      <TimelineTooltip hideTooltip={false} projectData={projectData} available={false} />,
    );

    expect(screen.getByText("Project Name:")).toBeInTheDocument();
    expect(screen.getByText("Allocated on:")).toBeInTheDocument();
    expect(screen.getByText("Allocation:")).toBeInTheDocument();
    expect(screen.getByText(projectData.projectName)).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date(projectData.startDate), "PP")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${projectData.utilization}% till ${format(new Date(projectData.endDate), "PP")}`,
      ),
    ).toBeInTheDocument();
  });

  test("renders correctly when dates are missing", () => {
    const projectDataWithoutDates = {
      projectName: "Project Alpha",
      startDate: null,
      endDate: null,
      utilization: 75,
    };

    render(
      <TimelineTooltip
        hideTooltip={false}
        projectData={projectDataWithoutDates}
        available={true}
      />,
    );

    expect(screen.getByText("From:")).toBeInTheDocument();
    expect(screen.getByText("To:")).toBeInTheDocument();
    expect(screen.getByText("Availability:")).toBeInTheDocument();

    const missingDateElements = screen.getAllByText("--");
    expect(missingDateElements).toHaveLength(2);

    expect(
      screen.getByText(`${projectDataWithoutDates.utilization}%`),
    ).toBeInTheDocument();
  });

  test("renders correctly when utilization is missing", () => {
    const projectDataWithoutUtilization = {
      projectName: "Project Alpha",
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      utilization: null,
    };

    render(
      <TimelineTooltip
        hideTooltip={false}
        projectData={projectDataWithoutUtilization}
        available={false}
      />,
    );

    expect(screen.getByText("Project Name:")).toBeInTheDocument();
    expect(screen.getByText("Allocated on:")).toBeInTheDocument();
    expect(screen.getByText("Allocation:")).toBeInTheDocument();
    expect(
      screen.getByText(projectDataWithoutUtilization.projectName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date(projectDataWithoutUtilization.startDate), "PP")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `--% till ${format(new Date(projectDataWithoutUtilization.endDate), "PP")}`,
      ),
    ).toBeInTheDocument();
  });
});
