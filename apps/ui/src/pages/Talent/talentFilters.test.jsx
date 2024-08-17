import "vitest-canvas-mock";

import { getIntegerOptions } from "@allocate-core/util-data-values";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, test, vi } from "vitest";

import { CountriesNowAPI } from "../../api/API";
import TalentFilter from "./TalentFilters";

describe("Talent", () => {
  const user = userEvent.setup();
  let mockCountriesMock;

  afterEach(() => {
    vi.clearAllMocks();
    mockCountriesMock = new MockAdapter(CountriesNowAPI);
  });

  afterEach(() => {
    mockCountriesMock.reset();
    mockCountriesMock.resetHistory();
  });

  const emptyFunc = () => {};
  const mockHandleChange = vi.fn();
  const mockSetFilters = vi.fn();
  const mockSearchValue = "";

  test("should change skills", async () => {
    render(
      <TalentFilter
        dropdowns={{ skills: [{ value: 1, label: "Test Skill" }] }}
        filters={{
          yoeFrom: null,
          yoeTo: null,
          availability: "",
        }}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );

    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[0]);
    await user.click(screen.queryByText(/Test Skill/i));
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ skills: [{ value: 1, label: "Test Skill" }] }),
    );
    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ skills: [{ value: 1, label: "Test Skill" }] }),
    );
  });

  test("should change Exp From", async () => {
    render(
      <TalentFilter
        dropdowns={{ yoeFrom: getIntegerOptions(0, 30, 1) }}
        filters={{
          yoeFrom: null,
          yoeTo: null,
          availability: "",
        }}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(3));
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ yoeFrom: { value: 3, label: "3" } }),
    );
    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ yoeFrom: { value: 3, label: "3" } }),
    );
  });

  test("should change Exp To", async () => {
    render(
      <TalentFilter
        dropdowns={{ yoeTo: getIntegerOptions(0, 30, 1) }}
        filters={{
          yoeFrom: null,
          yoeTo: null,
          availability: "",
        }}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[2]);
    await user.click(screen.queryByText(3));
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ yoeTo: { value: 3, label: "3" } }),
    );
    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ yoeTo: { value: 3, label: "3" } }),
    );
  });

  test("should throw error when exp to is less than from", async () => {
    render(
      <TalentFilter
        dropdowns={{ skills: [] }}
        filters={{
          yoeFrom: { value: 4 },
          yoeTo: { value: 2 },
          availability: "",
        }}
        setFilters={emptyFunc}
        handleChange={emptyFunc}
      />,
    );
    expect(screen.queryAllByText(/to is less than from/i)).toHaveLength(4);
    expect(screen.queryAllByText(/to is less than from/i)[0]).toHaveStyle({
      color: "var(--color-CarminePink)",
    });
  });

  test("should change availability", async () => {
    render(
      <TalentFilter
        dropdowns={{ skills: [] }}
        filters={{
          yoeFrom: null,
          yoeTo: null,
          availability: "",
        }}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );

    await user.type(screen.queryAllByPlaceholderText(/availability/i)[0], "9");
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ availability: "9" }),
    );
    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ availability: "9" }),
    );
  });

  test("should throw error when filter availability more than 100", async () => {
    render(
      <TalentFilter
        dropdowns={{ skills: [] }}
        filters={{
          yoeFrom: null,
          yoeTo: null,
          availability: "200",
        }}
        setFilters={emptyFunc}
        handleChange={emptyFunc}
      />,
    );

    expect(screen.queryAllByText(/between 0 to 100/i)).toHaveLength(2);
    expect(screen.queryAllByText(/between 0 to 100/i)[0]).toHaveStyle({
      color: "var(--color-CarminePink)",
    });
  });

  test("should change project", async () => {
    render(
      <TalentFilter
        dropdowns={{ projects: [{ value: 1, label: "Test Project" }] }}
        filters={{
          yoeFrom: null,
          yoeTo: null,
          availability: "",
        }}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[5]);
    await user.click(screen.queryByText("Test Project"));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ projects: [{ value: 1, label: "Test Project" }] }),
    );
    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ projects: [{ value: 1, label: "Test Project" }] }),
    );
  });

  test("should change sort order", async () => {
    render(
      <TalentFilter
        dropdowns={{ sortBy: [{ value: "emp_id_asc", label: "EmployeeID" }] }}
        filters={{}}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[6]);
    await user.click(screen.queryByText(/EmployeeID/i));
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: { value: "emp_id_asc", label: "EmployeeID" } }),
    );

    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ sortBy: { value: "emp_id_asc", label: "EmployeeID" } }),
    );
  });

  test("should change status", async () => {
    render(
      <TalentFilter
        dropdowns={{ status: [{ value: "closed", label: "Closed" }] }}
        filters={{}}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[9]);
    await user.click(screen.queryByText(/Closed/i));
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: [{ value: "closed", label: "Closed" }] }),
    );

    expect(mockHandleChange).toHaveBeenCalledWith(
      mockSearchValue,
      expect.objectContaining({ status: [{ value: "closed", label: "Closed" }] }),
    );
  });

  test("should change function", async () => {
    render(
      <TalentFilter
        dropdowns={{ function: [{ value: "support", label: "Support" }] }}
        filters={{}}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[10]);
    await user.click(screen.queryByText(/Support/i));
    expect(mockSetFilters).toHaveBeenCalledTimes(1);
  });

  test("should search for talent with country and multiple cities", async () => {
    const countriesURL = "/countries";
    mockCountriesMock.onGet(countriesURL).reply(200, {
      data: [
        {
          country: "United States",
        },
      ],
    });

    render(
      <TalentFilter
        dropdowns={{
          countries: ["United States"],
        }}
        filters={{}}
        setFilters={mockSetFilters}
        handleChange={mockHandleChange}
        searchValue={mockSearchValue}
      />,
    );

    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await userEvent.click(filterDropdowns[7]);

    expect(screen.queryAllByText(/united states/i)).toHaveLength(1);
  });
});
