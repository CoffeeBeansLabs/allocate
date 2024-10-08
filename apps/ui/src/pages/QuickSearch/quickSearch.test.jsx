import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
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
import QuickSearch from ".";

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

beforeAll(() => {
  vi.stubGlobal("localStorage", localStorageMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("quick search", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  let mockCountriesMock;

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
    mockCountriesMock = new MockAdapter(axios);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    mockCountriesMock.reset();
  });

  test("should render quick search landing", async () => {
    render(
      <BrowserRouter>
        <QuickSearch />
      </BrowserRouter>,
    );
    expect(await screen.findByRole("heading", { name: /quick search - talent/i }));
    expect(screen.queryByText(/skillset \*/i)).toBeInTheDocument();
    expect(screen.queryByText(/choose project/i)).toBeInTheDocument();
  });

  test("should add more and remove fields", async () => {
    render(
      <BrowserRouter>
        <QuickSearch />
      </BrowserRouter>,
    );

    const addMoreBtn = await screen.findByText(/\+ add more/i);
    await user.click(addMoreBtn);
    await user.click(addMoreBtn);
    expect(screen.queryAllByText(/skillset \*/i)).toHaveLength(3);
    const removeBtns = screen.queryAllByAltText(/delete icon/i);
    await user.click(removeBtns[1]);
    expect(screen.queryAllByText(/skillset \*/i)).toHaveLength(2);
  });

  test("should have dropdown values", async () => {
    authenticatedAxiosMock.onGet("/user/get-user-countries").reply(200, {
      countries: ["United States"],
    });
    authenticatedAxiosMock.onGet("/projects/").reply(200, {
      projects: [],
    });
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [{ id: 1, name: "Test Role" }],
        skills: [{ id: 1, name: "Test Skill" }],
        locations: ["New York", "Los Angeles", "Chicago"],
      },
    });

    render(
      <BrowserRouter>
        <QuickSearch />
      </BrowserRouter>,
    );
    const dropdowns = await screen.findAllByAltText(/click to toggle dropdown menu/i);
    await user.click(dropdowns[0]);
    expect(screen.queryByText(/test role/i)).toBeInTheDocument();
    await user.click(dropdowns[1]);
    expect(screen.queryByText(/test skill/i)).toBeInTheDocument();
  });

  test("should validate required on submit", async () => {
    render(
      <BrowserRouter>
        <QuickSearch />
      </BrowserRouter>,
    );
    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[2]);
    await user.click(screen.queryByText(6));
    await user.click(filterDropdowns[3]);
    await user.click(screen.queryByText(2));
    await user.click(screen.queryByRole("button", { name: /search/i }));

    expect(screen.queryByText(/select atleast 1 skill/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/to is less than from/i)).toHaveLength(2);

    const availabilityInput = screen.getAllByRole("spinbutton");
    await user.type(availabilityInput[0], "200");
    expect(screen.queryAllByText(/maximum is 100/i)).toHaveLength(
      availabilityInput.length,
    );

    await user.clear(availabilityInput[0]);
    await user.type(availabilityInput[0], "1");
    expect(screen.queryAllByText(/minimum is 5/i)).toHaveLength(availabilityInput.length);
  });

  test("should store data in local storage", async () => {
    authenticatedAxiosMock.onGet("/user/get-user-countries").reply(200, {
      countries: ["United States"],
    });
    authenticatedAxiosMock.onGet("/projects/").reply(200, {
      projects: [],
    });
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [],
        skills: [{ id: 1, name: "Test Skill" }],
        location: [],
      },
    });
    authenticatedAxiosMock
      .onGet("/user/get-user-cities/?countries=United%20States")
      .reply(200, {
        cities: ["usa"],
      });

    render(
      <BrowserRouter>
        <QuickSearch />
      </BrowserRouter>,
    );

    expect(localStorageMock.removeItem).toHaveBeenCalled();
    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(/test skill/i));
    await user.click(filterDropdowns[6]);
    await user.click(screen.queryByText(/united states/i));
    await user.click(filterDropdowns[7]);
    await user.click(screen.queryByText(/usa/i));
    await user.click(screen.queryByRole("button", { name: /search/i }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "quick-search",
      JSON.stringify({
        positions: [
          {
            role: null,
            skills: [{ value: 1, label: "Test Skill" }],
            experienceRangeStart: null,
            experienceRangeEnd: null,
            dateValues: [],
            utilization: null,
          },
        ],
        projects: [],
        country: [{ value: "United States", label: "United States" }],
        city: [[{ value: "Usa", label: "Usa" }]],
      }),
    );
  });
});
