import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { addDays, formatISO, subDays } from "date-fns";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI, { CountriesNowAPI } from "../../../api/API";
import { ROLES } from "../../../constants/roles";
import { useAuthStore } from "../../../store/authStore";
import Recommendations, { fetchProjectDetails } from "./Recommendations";

describe("Add to Project Form", () => {
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

  test("should render recommendation page landing", async () => {
    const countriesURL = "/countries";
    mockCountriesMock.onGet(countriesURL).reply(200, {
      data: [
        {
          country: "United States",
        },
      ],
    });
    render(
      <BrowserRouter>
        <Recommendations />
      </BrowserRouter>,
    );
    expect(
      await screen.findByText(/projects \/ view details \/ add talent/i),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { name: /recommendations/i })).toHaveLength(
      3,
    );
    expect(screen.queryByText(/\(same role\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/\(other roles\)/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/search talents here/i)).toBeInTheDocument();
    expect(screen.queryByText(/100% test name - l1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/test role/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/select country/i)).toBeInTheDocument();
    expect(screen.queryByText(/select city/i)).toBeInTheDocument();
  });

  test("should open add talent modal", async () => {
    const countriesURL = "/user/get-user-countries";
    const citiesURL = "/user/get-user-cities/?countries=India";
    authenticatedAxiosMock.onGet(countriesURL).reply(200, {
      countries: ["India"],
    });
    authenticatedAxiosMock.onGet(citiesURL).reply(200, {
      cities: ["pune"],
    });

    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    render(
      <BrowserRouter>
        <ToastContainer />
        <Recommendations />
      </BrowserRouter>,
    );
    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[0]);
    await user.click(screen.queryByText(/india/i));
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(/pune/i));
    await user.click(await screen.findByRole("button", { name: "+" }));
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

  test("should search for talent", async () => {
    const countriesURL = "/user/get-user-countries";
    authenticatedAxiosMock.onGet(countriesURL).reply(200, {
      countries: ["India"],
    });
    const mockSearch = "test search";

    render(
      <BrowserRouter>
        <Recommendations />
      </BrowserRouter>,
    );

    const searchInput = await screen.findByPlaceholderText(/search talents here/i);
    await user.type(searchInput, mockSearch);
    const clearButton = screen.getByAltText(/clear search text/i);
    expect(clearButton).toBeInTheDocument();
  });

  test("should search for talent with country and multiple cities", async () => {
    const countriesURL = "/user/get-user-countries";
    authenticatedAxiosMock.onGet(countriesURL).reply(200, {
      countries: ["India"],
    });

    render(
      <BrowserRouter>
        <Recommendations />
      </BrowserRouter>,
    );

    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[0]);
    expect(screen.queryAllByText(/india/i)).toHaveLength(1);
  });

  test("should display error toast on API error", async () => {
    const countriesURL = "/user/get-user-countries";
    authenticatedAxiosMock.onGet(countriesURL).reply(200, {
      countries: ["India"],
    });

    render(
      <BrowserRouter>
        <ToastContainer />
        <Recommendations />
      </BrowserRouter>,
    );

    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[0]);
    await user.click(screen.queryByText(/india/i));
    expect(await screen.findByText(/Please select a City/i)).toBeInTheDocument();
  });

  test("fetchProjectDetails should fetch and set project details", async () => {
    const mockGetProjectId = "123";
    const mockSetSelectedCountry = vi.fn();
    const mockSetSelectedCities = vi.fn();
    const fetchData = vi.fn();

    const mockProjectDetails = {
      project: {
        city: "new york",
        country: "united states",
      },
    };

    const mockCountriesData = {
      countries: ["United States", "Canada", "United Kingdom"],
    };

    const mockCitiesData = {
      cities: ["New York", "Los Angeles", "Chicago"],
    };

    vi.spyOn(AuthenticatedAPI, "get").mockImplementation((url) => {
      if (url === `/projects/${mockGetProjectId}/`) {
        return Promise.resolve({ data: mockProjectDetails });
      }
      if (url === "/user/get-user-countries") {
        return Promise.resolve({ data: mockCountriesData });
      }
      if (url.startsWith("/user/get-user-cities/")) {
        return Promise.resolve({ data: mockCitiesData });
      }
    });

    await act(async () => {
      await fetchProjectDetails(
        mockGetProjectId,
        mockSetSelectedCountry,
        mockSetSelectedCities,
        fetchData,
      );
    });

    expect(AuthenticatedAPI.get).toHaveBeenCalledWith(`/projects/${mockGetProjectId}/`);
    expect(AuthenticatedAPI.get).toHaveBeenCalledWith("/user/get-user-countries");
    expect(AuthenticatedAPI.get).toHaveBeenCalledWith(
      "/user/get-user-cities/?countries=united%20states",
    );
    expect(fetchData).toBeCalled();

    expect(mockSetSelectedCountry).toHaveBeenCalledWith({
      value: "united states",
      label: "united states",
    });
    expect(mockSetSelectedCities).toHaveBeenCalledWith([
      {
        value: "New York",
        label: "New York",
      },
    ]);
  });
});
