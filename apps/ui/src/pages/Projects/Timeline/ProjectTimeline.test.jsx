import "vitest-canvas-mock";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { addDays, format, subDays } from "date-fns";
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

import AuthenticatedAPI from "../../../api/API";
import { ROLES } from "../../../constants/roles";
import { useAuthStore } from "../../../store/authStore";
import ProjectTimeline from ".";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const originalResizeObserver = window.ResizeObserver;
const originalWindowScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

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
  window.ResizeObserver = originalResizeObserver;
  window.HTMLElement.prototype.scrollIntoView = originalWindowScrollIntoView;
});

describe("Projects", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  const mockProjectTimeline = {
    project: {
      id: 1,
      name: "Test project",
      client: { id: 1, name: "test client" },
      status: "ACTIVE",
      startDate: format(subDays(new Date(), 15), "PP"),
      totalPositions: 1,
      openPositions: 0,
      endDate: null,
      roles: [
        {
          roleName: "Test role",
          totalPositions: 1,
          openPositions: 0,
          positions: [
            {
              id: 1,
              startDate: format(subDays(new Date(), 15), "PP"),
              endDate: format(addDays(new Date(), 15), "PP"),
              skills: [],
              role: { name: "Test role" },
              utilization: 100,
              users: [
                {
                  id: 13,
                  fullNameWithExpBand: "Test employee - l1",
                  skills: [],
                  requests: [
                    {
                      id: 1,
                      projectName: "Test project",
                      isSameProject: true,
                      positionId: 1,
                      startDate: format(addDays(new Date(), 9), "PP"),
                      endDate: format(addDays(new Date(), 15), "PP"),
                      ktPeriod: 0,
                      utilization: 100,
                    },
                  ],
                  projects: [
                    {
                      id: 1,
                      positionId: 1,
                      projectName: "Test project",
                      isSameProject: true,
                      startDate: format(subDays(new Date(), 15), "PP"),
                      endDate: format(addDays(new Date(), 8), "PP"),
                      ktPeriod: 0,
                      utilization: 100,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
  });

  test("should render add roles landing", async () => {
    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );
    expect(await screen.findByText(/projects \/ timeline/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /plus icon for add add roles/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", {
        name: /a woman and a man rearranging profile cards while marking them/i,
      }),
    ).toBeInTheDocument();
  });

  test("should open add roles", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );

    await user.click(
      await screen.findByRole("button", { name: /plus icon for add add roles/i }),
    );
    expect(screen.queryByRole("heading", { name: /add roles/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /\+ add more/i })).toBeInTheDocument();

    await user.click(screen.getByRole("img", { name: /close icon/i }));
    expect(screen.queryByRole("heading", { name: /add roles/i })).not.toBeInTheDocument();
  });

  test("should render project timeline", async () => {
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/(.*)/project-timeline/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/*/`))
      .reply(200, mockProjectTimeline);

    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /test project/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByText(/test role/i)).toHaveLength(2);
    expect(screen.queryByText(/1 \/ 1 Filled/i)).toBeInTheDocument();
    expect(screen.queryByText(/test employee - l1/i)).toBeInTheDocument();
  });

  test("should open manage talent", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/(.*)/project-timeline/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/*/`))
      .reply(200, mockProjectTimeline);

    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );
    await user.hover(await screen.findByText(/position 1/i));
    await user.click(screen.getByRole("button", { name: /manage talent/i }));
    expect(
      screen.queryByRole("heading", { name: /manage talents/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByText(/test employee/i)).toHaveLength(2);
    expect(
      screen.queryByRole("button", {
        name: /request changes/i,
      }),
    ).toBeInTheDocument();
    await user.click(screen.queryByRole("img", { name: /close icon/i }));
    expect(
      screen.queryByRole("heading", { name: /manage talents/i }),
    ).not.toBeInTheDocument();
  });

  test("should open edit roles", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/(.*)/project-timeline/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/*/`))
      .reply(200, mockProjectTimeline);

    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );
    await user.click(await screen.findByRole("img", { name: /edit role button/i }));
    expect(screen.queryByRole("heading", { name: /edit roles/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /\+ add more/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).toBeDisabled();

    await user.click(screen.getByRole("img", { name: /close icon/i }));
    expect(
      screen.queryByRole("heading", { name: /edit roles/i }),
    ).not.toBeInTheDocument();
  });

  test("should cancel request", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/(.*)/project-timeline/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/*/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onDelete(new RegExp(`/projects/allocation-request/*/`))
      .reply(200);

    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );
    await user.click(await screen.findByRole("button", { name: /cancel request/i }));
    expect(authenticatedAxiosMock.history.delete).toHaveLength(1);
    expect(authenticatedAxiosMock.history.delete[0].url).toBe(
      "/projects/allocation-request/1/",
    );
  });

  test("should approve request", async () => {
    useAuthStore.setState({ user: { roles: ["admin"] } });
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/(.*)/project-timeline/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/*/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onPatch(new RegExp(`/projects/allocation-request/*/`))
      .reply(200);

    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );
    await user.click(await screen.findByRole("button", { name: /approve/i }));
    expect(authenticatedAxiosMock.history.patch).toHaveLength(1);
    expect(authenticatedAxiosMock.history.patch[0].url).toBe(
      "/projects/allocation-request/1/",
    );
    expect(authenticatedAxiosMock.history.patch[0].data).toBe(
      JSON.stringify({ status: "APPROVED" }),
    );
  });

  test("should deny request", async () => {
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/(.*)/project-timeline/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onGet(new RegExp(`/projects/*/`))
      .reply(200, mockProjectTimeline);
    authenticatedAxiosMock
      .onPatch(new RegExp(`/projects/allocation-request/*/`))
      .reply(200);

    render(
      <BrowserRouter>
        <ProjectTimeline />
      </BrowserRouter>,
    );
    await user.click(await screen.findByRole("button", { name: /deny/i }));
    expect(authenticatedAxiosMock.history.patch).toHaveLength(1);
    expect(authenticatedAxiosMock.history.patch[0].url).toBe(
      "/projects/allocation-request/1/",
    );
    expect(authenticatedAxiosMock.history.patch[0].data).toBe(
      JSON.stringify({ status: "DENIED" }),
    );
  });
});
