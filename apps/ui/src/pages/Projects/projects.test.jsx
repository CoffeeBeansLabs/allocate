import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { formatISO, setDate } from "date-fns";
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
import { ROLES } from "../../constants/roles";
import { useAuthStore } from "../../store/authStore";
import Projects from ".";
import ProjectDetails from "./ProjectDetails";
import RowStatusSelect from "./RowStatusSelect";

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
});

afterAll(() => {
  vi.unstubAllGlobals();
  window.HTMLElement.prototype.scrollIntoView = originalWindowScrollIntoView;
});

describe("Projects", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  const mockProjects = {
    count: 2,
    projects: [
      {
        id: 1,
        name: "Test project 1",
        client: { id: 1, name: "Test client" },
        status: "ACTIVE",
        startDate: new Date(),
      },
      {
        id: 2,
        name: "Test project 2",
        client: { id: 1, name: "Test client" },
        status: "ACTIVE",
        startDate: new Date(),
      },
    ],
  };

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
  });

  test("should render project landing", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );
    expect(await screen.findByRole("heading", { name: /projects/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /plus icon to add project add new project/i,
      }),
    ).toBeInTheDocument();
  });

  test("should render legends", async () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );

    user.hover(
      await screen.findByRole("img", { name: /cold: initial stage of discussion/i }),
    );
    expect(screen.queryByText(/cold: initial stage of discussion/i)).toBeInTheDocument();

    user.hover(screen.queryByRole("img", { name: /warm: multiple conversations done/i }));
    expect(screen.queryByText(/warm: multiple conversations done/i)).toBeInTheDocument();

    user.hover(screen.queryByRole("img", { name: /hot: msa & sow in progress/i }));
    expect(screen.queryByText(/hot: msa & sow in progress/i)).toBeInTheDocument();

    user.hover(screen.queryByRole("img", { name: /signed: msa & sow signed/i }));
    expect(screen.queryByText(/signed: msa & sow signed/i)).toBeInTheDocument();

    expect(
      screen.queryByRole("img", { name: /active: project commenced/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /closed: project completed/i }),
    ).toBeInTheDocument();
  });

  test("should render projects table", async () => {
    authenticatedAxiosMock.onGet("/projects/").reply(200, mockProjects);

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );
    expect(
      await screen.findByRole("row", { name: /project client status action/i }),
    ).toBeInTheDocument();

    expect(await screen.findAllByText(/project timeline/i)).toHaveLength(2);
    expect(screen.queryAllByRole("cell", { name: /test client/i })).toHaveLength(2);
    expect(screen.queryByRole("cell", { name: /test project 1/i })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: /test project 2/i })).toBeInTheDocument();
  });

  test("should handle project search", async () => {
    authenticatedAxiosMock.onGet("/projects/").reply(200, mockProjects);
    const mockSearch = "testSearch";

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );

    const searchBar = await screen.findByPlaceholderText(
      /search by project and client name/i,
    );

    // Type in the search bar
    await user.type(searchBar, mockSearch);

    // Wait for the asynchronous operations to complete using waitFor
    await waitFor(() => {
      // Check if the search parameter is sent in the API call
      const getCallHistory = authenticatedAxiosMock.history.get;
      expect(getCallHistory[getCallHistory.length - 1].params.search).toBe(mockSearch);
    });
    const clearButton = screen.getByRole("img", { name: /clear search text/i });
    await user.click(clearButton);
    await waitFor(() => {
      const getCallHistory = authenticatedAxiosMock.history.get;
      expect(getCallHistory[getCallHistory.length - 1].params).toStrictEqual({ page: 1 });
    });
  });

  test("should handle status filter change", async () => {
    authenticatedAxiosMock.onGet("/projects/").reply(200, mockProjects);

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );
    await user.click(
      await screen.findByRole("button", { name: /filter icon all statuses chevron/i }),
    );
    const button = screen.getAllByRole("button", { name: /warm/i });
    await user.click(within(button[0]).getByText(/warm/i));
    const getCallHistory = authenticatedAxiosMock.history.get;
    expect(getCallHistory[getCallHistory.length - 1].params.status).toBe("WARM");
  });

  test("should handle date range change", async () => {
    authenticatedAxiosMock.onGet("/projects/").reply(200, mockProjects);

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );

    const dateInput = await screen.findByPlaceholderText(/select date range/i);
    await user.click(dateInput);

    await user.click(screen.getAllByText(/12/i)[0]);
    await user.click(screen.getAllByText(/17/i)[0]);

    const getCallHistory = authenticatedAxiosMock.history.get;
    expect(getCallHistory[getCallHistory.length - 1].params.startDateStart).toBe(
      formatISO(setDate(new Date(), 12), { representation: "date" }),
    );
  });

  test("should open modal to add", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>,
    );

    await user.click(
      await screen.findByRole("button", {
        name: /plus icon to add project add new project/i,
      }),
    );
    expect(
      await screen.findByRole("heading", { name: /add new project/i }),
    ).toBeInTheDocument();

    const closeBtn = screen.queryByRole("img", { name: /close icon/i });
    expect(closeBtn).toBeInTheDocument();
    await user.click(closeBtn);
    expect(
      screen.queryByRole("heading", { name: /add new project/i }),
    ).not.toBeInTheDocument();
  });

  test("should update status on change", async () => {
    useAuthStore.setState({ user: { roles: ["admin"] } });

    const url = new RegExp(`/projects/*/`);
    authenticatedAxiosMock.onPatch(url).reply(200);

    render(<RowStatusSelect />);

    await user.click(screen.queryByRole("img", { name: /chevron icon/i }));
    await user.click(screen.queryByText(/signed/i));
    expect(authenticatedAxiosMock.history.patch).toHaveLength(1);
    expect(authenticatedAxiosMock.history.patch[0].data).toBe(
      JSON.stringify({ status: "SIGNED" }),
    );
  });

  test("should render project details", async () => {
    const url = new RegExp(`/projects/*/`);
    authenticatedAxiosMock.onGet(url).reply(200, {
      project: {
        ...mockProjects.projects[0],
        accountManager: { fullNameWithExpBand: "Manager - l1" },
        pocs: [
          {
            name: "test poc",
            email: "testPoc@email.com",
            phoneNumber: "1234567",
            designation: "Account manager",
          },
        ],
      },
    });
    render(
      <BrowserRouter>
        <ProjectDetails />
      </BrowserRouter>,
    );

    expect(await screen.findByText(/projects \/ view details/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit icon edit/i })).toBeInTheDocument();
    expect(screen.queryByText(/project timeline/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /client poc/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /account manager/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /test project 1/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/test client/i)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /status icon/i })).toBeInTheDocument();
    expect(screen.queryByText(/test poc/i)).toBeInTheDocument();
    expect(screen.queryByText(/testPoc@email.com/i)).toBeInTheDocument();
    expect(screen.queryByText(/manager - l1/i)).toBeInTheDocument();
  });

  test("should open modal in project details", async () => {
    render(
      <BrowserRouter>
        <ProjectDetails />
      </BrowserRouter>,
    );

    await user.click(await screen.findByRole("button", { name: /edit icon edit/i }));
    expect(screen.queryByRole("heading", { name: /edit details/i })).toBeInTheDocument();
    const closeBtn = screen.queryByRole("img", { name: /close icon/i });
    await user.click(closeBtn);
    expect(
      screen.queryByRole("heading", { name: /edit details/i }),
    ).not.toBeInTheDocument();
  });
});
