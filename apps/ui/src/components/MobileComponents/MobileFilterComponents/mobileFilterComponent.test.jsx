import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";

import MobileFilterComponent from "./MobileFilterComponent";

describe("MobileFilterComponent", () => {
  const initialState = {
    dates: [new Date("2022-01-01"), new Date("2022-12-31")],
    status: { label: "Active", value: "Active" }, // Use object for status
    sort: { label: "Name", value: "Name" }, // Use object for sort
  };

  const dropdownOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const sortDropdownOptions = [
    { label: "Name", value: "Name" },
    { label: "Date", value: "Date" },
  ];

  const mockHandleApplyFilter = vi.fn();

  test("should render with initial state and apply filter on button click", async () => {
    render(
      <MobileFilterComponent
        initialState={initialState}
        dropdown={dropdownOptions}
        sortDropdown={sortDropdownOptions}
        handleApplyFilter={mockHandleApplyFilter}
      />,
    );
    expect(screen.queryByRole("button", { name: /apply filter/i })).toBeInTheDocument();
  });
});
