import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { describe, expect, test, vi } from "vitest";

import { CountriesNowAPI } from "../../api/API";
import CountryCity from "./CountryCity";
import CurrencySelect from "./CurrencySelect";

describe("Custom form fields", () => {
  vi.mock("formik", () => ({
    useField: vi.fn().mockReturnValue([]),
  }));

  const user = userEvent.setup();
  let countriesMock;

  beforeEach(() => {
    countriesMock = new MockAdapter(CountriesNowAPI);
  });

  afterEach(() => {
    countriesMock.reset();
    countriesMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render country city field", async () => {
    const countriesURL = "/countries";
    countriesMock.onGet(countriesURL).reply(200, {
      data: [
        {
          country: "test country",
        },
      ],
    });
    render(<CountryCity />);
    const dropdownSelects = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    expect(dropdownSelects).toHaveLength(2);
    await user.click(dropdownSelects[0]);
    expect(screen.queryAllByText(/test country/i)).toHaveLength(1);
  });

  test("should disable city dropdown when no country is selected", async () => {
    const countriesURL = "/countries";
    countriesMock.onGet(countriesURL).reply(200, {
      data: [{ country: "Test Country" }],
    });

    render(<CountryCity />);

    await waitFor(() => {
      expect(screen.queryByText(/City \*/i)).toBeInTheDocument();
    });
  });

  test("should handle API error when fetching countries", async () => {
    const countriesURL = "/countries";
    countriesMock.onGet(countriesURL).reply(500);

    render(<CountryCity />);

    await waitFor(() => {
      expect(screen.queryByText(/Test Country/i)).toBeNull();
    });
  });

  test("should render currency field", async () => {
    const currencyURL = "/countries/currency";
    countriesMock.onGet(currencyURL).reply(200, {
      data: [
        {
          currency: "test currency",
        },
      ],
    });
    render(<CurrencySelect />);
    const select = await screen.findByAltText(/click to toggle dropdown menu/i);
    await user.click(select);
    expect(await screen.findAllByText(/test currency/i)).toHaveLength(1);
  });
});
