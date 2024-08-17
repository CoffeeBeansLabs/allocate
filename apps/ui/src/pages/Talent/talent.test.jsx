import "vitest-canvas-mock";

import { getFormatedDate } from "@allocate-core/util-formatting";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { addDays, addMonths, format, subDays, subMonths } from "date-fns";
import { BrowserRouter } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import AuthenticatedAPI from "../../api/API";
import { useAuthStore } from "../../store/authStore";
import Talent from ".";
import TalentDetails from "./TalentDetails";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const originalResizeObserver = window.ResizeObserver;
const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

beforeAll(() => {
  const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.ResizeObserver = ResizeObserver;
});

afterAll(() => {
  vi.unstubAllGlobals();
  window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  window.ResizeObserver = originalResizeObserver;
});

describe("Talent", () => {
  const user = userEvent.setup();
  let authenticatedMock;
  const mockTalents = {
    count: 1,
    users: [
      {
        id: 1,
        employeeId: "221",
        fullNameWithExpBand: "Test name - l1",
        skills: [],
        experienceMonths: 32,
        lastWorkingDay: null,
        role: { id: 1, name: "Test role" },
        isOverUtilized: true,
        projects: [
          {
            projectId: "4",
            projectName: "Test Project",
            utilization: 50,
            startDate: subDays(new Date(), 2),
            endDate: addDays(new Date(), 3),
          },
        ],
        leaves: [],
        requests: [],
      },
    ],
  };

  beforeEach(() => {
    authenticatedMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedMock.reset();
    authenticatedMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render talent landing layout", async () => {
    render(
      <BrowserRouter>
        <Talent />
      </BrowserRouter>,
    );

    expect(await screen.findByRole("heading", { name: /people/i })).toBeInTheDocument();
    expect(screen.queryByText(/current project/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/other project/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/available/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/on leave/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/proposed/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/kt period/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/0% allocation/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/not active/i)).toBeInTheDocument();
  });

  test("should render talent data", async () => {
    authenticatedMock.onPost("/user/").reply(200, mockTalents);

    render(
      <BrowserRouter>
        <Talent />
      </BrowserRouter>,
    );

    expect(await screen.findByText(/name \(count: 1\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/test name - l1/i)).toBeInTheDocument();
    expect(screen.queryByText(/exp - 2 years 8 months/i)).toBeInTheDocument();
  });

  test("should change month view", async () => {
    render(
      <BrowserRouter>
        <Talent />
      </BrowserRouter>,
    );

    const leftButton = await screen.findByRole("img", {
      name: /view previous month/i,
    });
    const rightButton = await screen.findByRole("img", {
      name: /view next month/i,
    });

    expect(
      screen.queryByText(`${format(new Date(), "MMMM")}, ${format(new Date(), "yyyy")}`),
    ).toBeInTheDocument();

    await user.click(rightButton);
    expect(
      screen.queryByText(
        `${format(addMonths(new Date(), 1), "MMMM")}, ${format(
          addMonths(new Date(), 1),
          "yyyy",
        )}`,
      ),
    ).toBeInTheDocument();

    await user.dblClick(leftButton);
    expect(
      screen.queryByText(
        `${format(subMonths(new Date(), 1), "MMMM")}, ${format(
          subMonths(new Date(), 1),
          "yyyy",
        )}`,
      ),
    ).toBeInTheDocument();
  });

  test("should render details layout", async () => {
    render(
      <BrowserRouter>
        <TalentDetails />
      </BrowserRouter>,
    );
    expect(await screen.findByText(/people \/ view details/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /basic details/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /experience details/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /current project\(s\)/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /past project\(s\)/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /currently allocated asset\(s\)/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /past asset\(s\)/i,
      }),
    ).toBeInTheDocument();
  });

  test("should render talent details data", async () => {
    const url = new RegExp(`/user/*`);
    authenticatedMock.onGet(url).reply(200, { user: mockTalents.users[0] });

    render(
      <BrowserRouter>
        <TalentDetails />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /test name/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/221/i)).toBeInTheDocument();

    expect(screen.queryByText(/test role/i)).toBeInTheDocument();
    expect(screen.queryByText(/2 years 8 months/i)).toBeInTheDocument();
  });

  test("should render talent project data", async () => {
    const url = new RegExp(`/user/*`);
    authenticatedMock.onGet(url).reply(200, {
      user: {
        ...mockTalents.users[0],
        currentProjects: [
          {
            id: 2,
            projectId: "4",
            projectName: "Test Project",
            role: "Test role",
            startDate: subDays(new Date(), 2),
            endDate: addDays(new Date(), 3),
            client: { name: "Test client" },
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <TalentDetails />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("row", {
        name: /project name client start date end date role/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", {
        name: /test project/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", {
        name: /test client/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", {
        name: getFormatedDate(subDays(new Date(), 2)),
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", {
        name: getFormatedDate(subDays(new Date(), 2)),
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", {
        name: /test role/i,
      }),
    ).toBeInTheDocument();
  });

  test("should edit user status", async () => {
    useAuthStore.setState({ user: { roles: ["admin"] } });
    const url = new RegExp(`/user/*`);
    authenticatedMock
      .onGet(url)
      .reply(200, { user: { currentStatus: "Maternity Break" } });
    authenticatedMock.onPatch(url).reply(200);

    render(
      <BrowserRouter>
        <TalentDetails />
      </BrowserRouter>,
    );

    expect(await screen.findByText(/cafe/i)).toHaveStyle({
      color: "var(--color-Green)",
    });
    await user.click(screen.getByAltText(/click to toggle dropdown menu/i));
    await user.click(screen.queryByText(/paternity break/i));
    expect(authenticatedMock.history.patch.length).toBe(2);
    expect(authenticatedMock.history.patch[1].data).toBe('{"status":"Paternity Break"}');
  });
});
