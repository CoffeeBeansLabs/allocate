import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { addDays, formatISO, subDays } from "date-fns";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

import AuthenticatedAPI, { CountriesNowAPI } from "../../../api/API";
import { ROLES } from "../../../constants/roles";
import { useAuthStore } from "../../../store/authStore";
import Recommendations from "./Recommendations";

beforeAll(() => {
  vi.mock("../../../common/common.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      isMobile: true,
    };
  });
});

describe("Recommendations Mobile Modal", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  let mockCountriesMock;
  let IntersectionObserverMock;

  const mockSearch = {
    count: 11,
    criteria: { role: null, skills: [] },
    talents: [
      {
        id: 1,
        fullNameWithExpBand: "Test Name - l1",
        allocation: [
          {
            id: 1,
            projectName: "Test project",
            isSameProject: true,
            startDate: formatISO(subDays(new Date(), 15), { representation: "date" }),
            endDate: formatISO(addDays(new Date(), 8), { representation: "date" }),
            ktPeriod: 0,
            utilization: 100,
          },
        ],
        matchPercent: "100%",
        leaves: [],
        lastWorkingDay: null,
        role: "Test Role",
        skills: [],
        country: null,
        locations: [],
      },
    ],
  };

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
    authenticatedAxiosMock.onGet("/search/talents/").reply(200, mockSearch);
    mockCountriesMock = new MockAdapter(CountriesNowAPI);
    IntersectionObserverMock = vi.fn(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      takeRecords: vi.fn(),
      unobserve: vi.fn(),
    }));
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    vi.clearAllMocks();
    mockCountriesMock.reset();
    vi.unstubAllGlobals();
  });

  test("should render MobileModal when screen width is within mobile range", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    const countriesURL = "/user/get-user-countries";
    const citiesURL = "/user/get-user-cities/?countries=India";
    authenticatedAxiosMock.onGet(countriesURL).reply(200, {
      countries: ["India"],
    });
    authenticatedAxiosMock.onGet(citiesURL).reply(200, {
      cities: ["pune"],
    });
    render(
      <BrowserRouter>
        <Recommendations />
      </BrowserRouter>,
    );
    expect(await screen.findAllByText(/recommendations/i)).toHaveLength(4);
    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[0]);
    await user.click(screen.queryByText(/india/i));
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(/pune/i));
    await user.click(await screen.findByText("+"));
    expect(
      screen.queryByRole("heading", { name: /add to project/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /close icon/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request talent/i })).toBeInTheDocument();
    await user.click(screen.queryByRole("img", { name: /close icon/i }));
    expect(
      screen.queryByRole("heading", { name: /add to project/i }),
    ).not.toBeInTheDocument();
  });
});
