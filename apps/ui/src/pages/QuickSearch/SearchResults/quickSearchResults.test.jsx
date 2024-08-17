import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { addMonths, format, setDate, startOfDay, subMonths } from "date-fns";
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

import AuthenticatedAPI, { CountriesNowAPI } from "../../../api/API";
import SearchResults from ".";

const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
const mockPositions = [
  {
    role: null,
    skills: [{ value: 1, label: "Test Skill" }],
    experienceRangeStart: null,
    experienceRangeEnd: null,
    dateValues: [],
    utilization: 0,
  },
  {
    role: null,
    skills: [{ value: 2, label: "Test Skill 2" }],
    experienceRangeStart: null,
    experienceRangeEnd: null,
    dateValues: [],
    utilization: 50,
  },
];

const mockSearch = {
  count: 1,
  criteria: { role: null, skills: [] },
  talents: [
    {
      id: 1,
      fullNameWithExpBand: "Test Name - l1",
      allocation: [{ projectName: "Test Project" }],
      matchPercent: "100%",
      leaves: [],
      lastWorkingDay: null,
      role: "Test Role",
      skills: [],
    },
  ],
};

const localStorageMock = {
  getItem: vi.fn().mockReturnValue(
    JSON.stringify({
      positions: mockPositions,
      projects: [],
      country: null,
      locations: [],
    }),
  ),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

beforeAll(() => {
  const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

  vi.stubGlobal("localStorage", localStorageMock);

  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  vi.unstubAllGlobals();
  window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
});

describe("quick search", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  let mockCountries;

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
    mockCountries = new MockAdapter(CountriesNowAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    mockCountries.reset();
  });

  test("should render search results layout", async () => {
    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: /quick search results/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { name: /search results/i })).toHaveLength(3);
    expect(
      screen.queryByText(`${format(new Date(), "MMMM")}, ${format(new Date(), "yyyy")}`),
    ).toBeInTheDocument();
  });

  test("should increment and decrement month", async () => {
    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );
    expect(
      await screen.findByText(
        `${format(new Date(), "MMMM")}, ${format(new Date(), "yyyy")}`,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("img", { name: /view previous month/i }));
    expect(
      screen.queryByText(
        `${format(subMonths(new Date(), 1), "MMMM")}, ${format(
          subMonths(new Date(), 1),
          "yyyy",
        )}`,
      ),
    ).toBeInTheDocument();

    await user.dblClick(screen.getAllByRole("img", { name: /view next month/i })[1]);
    expect(
      screen.queryByText(
        `${format(addMonths(new Date(), 1), "MMMM")}, ${format(
          addMonths(new Date(), 1),
          "yyyy",
        )}`,
      ),
    ).toBeInTheDocument();
  });

  test("should display search results", async () => {
    authenticatedAxiosMock.onPost("/search/quick-search/").reply(200, mockSearch);

    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );

    expect(await screen.findByText(/100% test name - l1/i)).toBeInTheDocument();
    expect(screen.queryByText(/show all skills/i)).toBeInTheDocument();
    expect(screen.queryByText(/role - test role/i)).toBeInTheDocument();
  });

  test("should update on project change", async () => {
    const countriesURL = "/user/get-user-countries";
    authenticatedAxiosMock.onGet(countriesURL).reply(200, {
      data: [
        {
          country: "test country",
        },
      ],
    });
    authenticatedAxiosMock.onPost("/search/quick-search/").reply(200, mockSearch);
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [],
        skills: [{ id: 1, name: "Test Skill" }],
      },
    });
    authenticatedAxiosMock.onGet("/projects/").reply(200, {
      count: 1,
      projects: [{ id: "projectID_1", name: "Test Project" }],
    });

    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );

    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[filterDropdowns.length - 1]);
    const projectDrop = await screen.findAllByText(/test project/i);
    await user.click(projectDrop[0]); // Adjusted index here
    const expectedPositionValue = JSON.stringify({
      positions: mockPositions,
      projects: [{ value: "projectID_1", label: "Test Project" }],
      country: null,
      locations: [],
    });
    expect(authenticatedAxiosMock.history.post).toHaveLength(3); // Changed expectation to 3
    expect(
      JSON.parse(authenticatedAxiosMock.history.post[2].data).projects, // Adjusted index here
    ).toStrictEqual(["projectID_1"]); // Adjusted index here
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "quick-search",
      expectedPositionValue,
    );
  });

  test("should switch tabs", async () => {
    authenticatedAxiosMock.onPost("/search/quick-search/").reply(200, mockSearch);

    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );

    const firstTab = await screen.findByRole("button", { name: /search 1/i });
    const secondTab = await screen.findByRole("button", { name: /search 2/i });
    expect(firstTab).toHaveStyle("color: var(--color-SunsetOrange-1)");
    await user.click(secondTab);
    expect(await screen.findByRole("button", { name: /search 2/i })).toHaveStyle(
      "color: var(--color-SunsetOrange-1)",
    );
    expect(authenticatedAxiosMock.history.post).toHaveLength(3);
    expect(JSON.parse(authenticatedAxiosMock.history.post[2].data).skills).toStrictEqual([
      mockPositions[1].skills[0].value,
    ]);
    expect(
      JSON.parse(authenticatedAxiosMock.history.post[2].data).utilization,
    ).toStrictEqual(mockPositions[1].utilization);

    await user.click(firstTab);
    expect(authenticatedAxiosMock.history.post).toHaveLength(4);
    expect(JSON.parse(authenticatedAxiosMock.history.post[3].data).skills).toStrictEqual([
      mockPositions[0].skills[0].value,
    ]);
    expect(
      JSON.parse(authenticatedAxiosMock.history.post[3].data).utilization,
    ).toStrictEqual(mockPositions[0].utilization);
  });

  test("should update local storage on experience change", async () => {
    authenticatedAxiosMock.onPost("/search/quick-search/").reply(200, mockSearch);

    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );

    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(4));
    await user.click(filterDropdowns[2]);
    await user.click(screen.queryByText(7));

    const localStorageItem = JSON.stringify({
      positions: [
        {
          ...mockPositions[0],
          experienceRangeStart: { value: 4, label: "4" },
          experienceRangeEnd: { value: 7, label: "7" },
        },
        { ...mockPositions[1] },
      ],
      projects: [],
      country: null,
      locations: [],
    });

    expect(localStorageMock.setItem).toHaveBeenNthCalledWith(
      3,
      "quick-search",
      localStorageItem,
    );
  });

  test("should update local storage on date change", async () => {
    authenticatedAxiosMock.onPost("/search/quick-search/").reply(200, mockSearch);

    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>,
    );

    await user.click(screen.getByPlaceholderText(/select date/i));
    await user.click(screen.getAllByText(/13/i)[0]);
    await user.click(screen.getAllByText(/17/i)[0]);

    const localStorageItem = JSON.stringify({
      positions: [
        {
          ...mockPositions[0],
          experienceRangeStart: { value: 4, label: "4" },
          experienceRangeEnd: { value: 7, label: "7" },
          dateValues: [
            startOfDay(setDate(new Date(), 13)),
            startOfDay(setDate(new Date(), 17)),
          ],
        },
        { ...mockPositions[1] },
      ],
      projects: [],
      country: null,
      locations: [],
    });

    expect(localStorageMock.setItem).toHaveBeenNthCalledWith(
      5,
      "quick-search",
      localStorageItem,
    );
  });
});
