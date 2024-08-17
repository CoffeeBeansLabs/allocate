import "vitest-canvas-mock";

import { getFormatedDate } from "@allocate-core/util-formatting";
import { render, screen } from "@testing-library/react";
import { addDays, format, subYears } from "date-fns";
import { BrowserRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { useAuthStore } from "../../store/authStore";
import Dashboard from ".";
import Assets from "./Assets";
import Cafe from "./Cafe";
import ClientProject from "./ClientProject";
import CurrentAllocation from "./CurrentAllocation";
import People from "./People";

afterEach(() => {
  vi.clearAllMocks();
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const originalResizeObserver = window.ResizeObserver;
const originalWindowScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.ResizeObserver = ResizeObserver;
});

afterAll(() => {
  window.ResizeObserver = originalResizeObserver;
  window.HTMLElement.prototype.scrollIntoView = originalWindowScrollIntoView;
});

describe("Dashboard", () => {
  useAuthStore.setState({ user: { roles: ["admin"] } });
  vi.mock("../../api/dashboard", async () => {
    const actual = await vi.importActual("../../api/dashboard");
    const mockLastWorkingDayResults = {
      employeeLastWorkingDay: [
        {
          fullName: "Test Name",
          id: 1,
          lastWorkingDay: addDays(new Date(), 2),
          roleName: "Test Role",
        },
      ],
    };
    const mockAnniversaryResults = {
      employeeAnniversary: [
        { years: 2, dateOfJoining: subYears(new Date(), 2), fullName: "Test B" },
        { years: 1, dateOfJoining: subYears(new Date(), 1), fullName: "Test A" },
        { years: 10, dateOfJoining: subYears(new Date(), 10), fullName: "Test C" },
      ],
    };
    const mockPeopleResults = {
      overallEmployeeSkills: { employeeSkillCount: [] },
      overallEmployeeSkillsExperience: { employeeSkillExperience: [] },
      industryExperienceEmployee: [],
    };
    const mockCurrentAllocationResults = {
      clientAllocation: [],
      roleBreakup: [],
      overallEmployeeSkills: { employeeSkillCount: [] },
    };
    const mockDashboardResults = {
      employeeData: [],
      openPositions: [],
      cafeEmployeeSkills: { employeeSkillCount: [] },
    };
    const mockClientProjectResults = {
      clients: [],
      industryCount: [],
    };
    const mockCafeResults = {
      cafeEmployeeSkills: { employeeSkillCount: [] },
      potentialCafeEmployeeSkills: { employeeSkillCount: [] },
    };
    return {
      ...actual,
      getAnniversaries: vi.fn().mockResolvedValue(mockAnniversaryResults),
      getLWDEmployees: vi.fn().mockResolvedValue(mockLastWorkingDayResults),
      getPeopleData: vi.fn().mockResolvedValue(mockPeopleResults),
      getCurrentAllocationData: vi.fn().mockResolvedValue(mockCurrentAllocationResults),
      getDashboardData: vi.fn().mockResolvedValue(mockDashboardResults),
      getClientAndProjectlData: vi.fn().mockResolvedValue(mockClientProjectResults),
      getCafeAndPotentialData: vi.fn().mockResolvedValue(mockCafeResults),
    };
  });

  test("should render dashboard", async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );
    expect(
      await screen.findByRole("heading", {
        name: /employee details/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/total strength/i)).toBeInTheDocument();
    expect(await screen.findByText(/employees/i)).toBeInTheDocument();
    expect(await screen.findByText(/contractors/i)).toBeInTheDocument();
    expect(await screen.findByText(/interns/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /overall gender split/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /project allocation/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /billing strength/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(/billing strength/i)).toHaveLength(2);
    expect(await screen.findByText(/cafe strength/i)).toBeInTheDocument();
    expect(await screen.findByText(/potential cafe/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /cafe - skills & proficiency/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /open positions/i,
      }),
    ).toBeInTheDocument();
  });

  test("should render current allocation tab", async () => {
    render(
      <BrowserRouter>
        <CurrentAllocation />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("heading", {
        name: /project allocation/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /role breakup/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /overall - skills & proficiency/i,
      }),
    ).toBeInTheDocument();
  });

  test("should render cafe and potential tab", async () => {
    render(
      <BrowserRouter>
        <Cafe />
      </BrowserRouter>,
    );
    expect(
      await screen.findAllByRole("heading", {
        name: /cafe - skills & proficiency/i,
      }),
    ).toHaveLength(2);
    expect(
      await screen.findByRole("heading", {
        name: /potential cafe - skills & proficiency/i,
      }),
    ).toBeInTheDocument();

    expect(await screen.findAllByAltText(/show report icon/i)).toHaveLength(2);
  });

  test("should render people tab", async () => {
    render(
      <BrowserRouter>
        <People />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /overall - skills & proficiency/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /overall - skills & experience/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /overall - industries/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /location split/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /anniversaries/i })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /name joining date/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /last working day/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("row", { name: /name last working day role/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByAltText(/show report icon/i)).toHaveLength(3);
  });

  test("should have monthly filter in people", async () => {
    render(
      <BrowserRouter>
        <People />
      </BrowserRouter>,
    );
    const filter = format(new Date(), "MMMM yyyy");
    expect(await screen.findAllByText(filter)).toHaveLength(2);
    expect(screen.queryAllByAltText(/click to toggle dropdown menu/i)).toHaveLength(2);
  });

  test("should render anniversary table", async () => {
    render(
      <BrowserRouter>
        <People />
      </BrowserRouter>,
    );

    expect(await screen.findByRole("cell", { name: /test a/i })).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: /test b/i })).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: getFormatedDate(subYears(new Date(), 1)) }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: getFormatedDate(subYears(new Date(), 2)) }),
    ).toBeInTheDocument();
    expect(await screen.findByAltText(/1 numbericon/i)).toBeInTheDocument();
    expect(await screen.findByAltText(/2 numbericon/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/10 numbericon/i)).toBeNull();
    expect(await screen.findByText(10)).toBeInTheDocument();
  });

  test("should render last working day table", async () => {
    render(
      <BrowserRouter>
        <People />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("row", { name: /name last working day role/i }),
    ).toBeInTheDocument();

    expect(await screen.findByRole("cell", { name: /test name/i })).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: getFormatedDate(addDays(new Date(), 2)) }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: /test role/i })).toBeInTheDocument();
  });

  test("should render client and projects tab", async () => {
    render(
      <BrowserRouter>
        <ClientProject />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /client industries/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /client allocation/i }),
    ).toBeInTheDocument();
    expect(await screen.findAllByAltText(/show report icon/i)).toHaveLength(1);
  });

  test("should render assets tab", async () => {
    render(
      <BrowserRouter>
        <Assets />
      </BrowserRouter>,
    );

    expect(await screen.findByText(/assets/i)).toBeInTheDocument();
  });
});
