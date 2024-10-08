import { getCurrentTimeline } from "@allocate-core/util-data-values";
import { render, screen } from "@testing-library/react";
import { addDays, formatISO, subDays } from "date-fns";
import { describe, expect, test } from "vitest";

import UserAllocation from "./UserAllocation";

describe("User Allocation Bar", () => {
  const leaveStart = addDays(new Date(), 1);
  const leaveEnd = addDays(new Date(), 3);
  const mockTalent = {
    id: 1,
    name: "Test name",
    skills: [{ skillId: 1, skill: "Skill A", rating: 3 }],
    experienceMonths: 32,
    role: "Test role",
    isOverUtilized: false,
    totalUtilized: 0,
    allocation: [],
    leaves: [{ fromDate: leaveStart, toDate: leaveEnd }],
    requests: [],
  };
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const numberOfColumns = getCurrentTimeline(currentMonth)?.length;

  test("should show green bar for user availablity", async () => {
    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const availableBar = screen.getByTestId("available");

    expect(availableBar).toBeInTheDocument();
    expect(availableBar.style.height).toBe("12px");
    expect(availableBar.style.gridColumnStart).toBe("1");
    expect(availableBar.style.gridColumnEnd).toBe("33");
  });

  test("should show thin bar for approved leaves taken by user", async () => {
    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const leaveBar = document.querySelectorAll("div._timelineIndicatorBar_e9f258")[2];

    expect(leaveBar).toBeTruthy();
    expect(leaveBar.style.height).toBe("1.8px");
    expect(leaveBar.style.gridColumnStart).toBe(`${leaveStart.getDate()}`);
    expect(leaveBar.style.gridColumnEnd).toBe(`${leaveEnd.getDate() + 1}`);
  });

  test("should show user project request bar", async () => {
    mockTalent.requests.push({
      projectName: "Test request",
      utilization: 100,
      ktPeriod: 0,
      startDate: subDays(currentDate, 30),
      endDate: addDays(currentDate, 30),
    });
    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const requestBar = screen.getByTestId("REQUEST");

    expect(requestBar).toBeInTheDocument();
    expect(requestBar.style.height).toBe("12px");
    expect(requestBar.style.backgroundImage).toBe("");
  });

  test("should show user project allocation bar", async () => {
    mockTalent.requests = [];
    mockTalent.allocation.push({
      projectName: "Test project",
      utilization: 50,
      ktPeriod: 0,
      startDate: subDays(currentDate, 30),
      endDate: addDays(currentDate, 30),
    });
    mockTalent.allocation.push({
      projectName: "Test project2",
      utilization: 20,
      ktPeriod: 0,
      startDate: subDays(currentDate, 30),
      endDate: addDays(currentDate, 30),
    });
    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const availableBar = screen.getByTestId("available");
    const projectBar = screen.getAllByTestId("PROJECT");
    const sumOfBarHeights =
      projectBar.reduce(
        (acc, project) => acc + parseFloat(project.style.height.split("px")[0]),
        0,
      ) + parseFloat(availableBar.style.height.split("px")[0]);

    expect(availableBar).toBeInTheDocument();
    expect(projectBar).toHaveLength(2);
    expect(sumOfBarHeights).toBe(12);
  });

  test("should show user project allocation bar with kt period", async () => {
    mockTalent.requests = [];
    mockTalent.allocation = [];
    mockTalent.allocation.push({
      projectName: "Test project2",
      utilization: 50,
      ktPeriod: 3,
      startDate: currentDate,
      endDate: addDays(currentDate, 30),
    });

    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const ktPeriodBar = screen.getByTestId("KT_PERIOD");
    const projectBar = screen.getByTestId("PROJECT");

    expect(projectBar).toBeInTheDocument();
    expect(ktPeriodBar).toBeInTheDocument();
    expect(ktPeriodBar.style.height).toBe("6px");
    expect(projectBar.style.height).toBe("6px");
    expect(ktPeriodBar.style.backgroundImage).toBe("");
  });

  test("should show user project over allocation bar", async () => {
    mockTalent.requests = [];
    mockTalent.allocation = [];
    mockTalent.allocation.push({
      projectName: "Test project",
      isOverUtilized: true,
      utilization: 150,
      ktPeriod: 0,
      startDate: subDays(currentDate, 30),
      endDate: addDays(currentDate, 30),
    });

    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const overAllocatedBar = document.querySelector(
      "div._timelineIndicatorBar_e9f258._overAllocated_e9f258",
    );

    expect(overAllocatedBar).toBeTruthy();
    expect(overAllocatedBar.style.height).toBe("18px");
  });

  test("should show user not active bar if lwd is present", async () => {
    mockTalent.requests = [];
    mockTalent.allocation = [];
    mockTalent.lastWorkingDay = formatISO(subDays(currentDate, 5), {
      representation: "date",
    });

    render(
      <UserAllocation
        month={currentMonth}
        user={mockTalent}
        type="allocation"
        numberOfColumns={numberOfColumns}
      />,
    );
    const inactiveBar = screen.getByTestId("inactive");
    expect(inactiveBar).toBeInTheDocument();
    expect(inactiveBar.style.height).toBe("12px");
  });
});
