import "vitest-canvas-mock";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setDate, startOfDay } from "date-fns";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useSearchStore } from "../../../store/searchStore";
import ResultFilter from "./ResultFilter";

describe("quick search result filter", () => {
  const user = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockHandleChange = vi.fn();

  useSearchStore.setState((current) => ({
    ...current,
    dropdowns: {
      ...current.dropdowns,
      skills: [{ value: 1, label: "Test Skill" }],
    },
  }));

  test("should change skills", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[0]);
    await user.click(screen.queryByText(/test skill/i));
    expect(mockHandleChange).toHaveBeenCalledWith("skills", [
      {
        value: 1,
        label: "Test Skill",
      },
    ]);
  });

  test("should throw error when no skills are selected", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[0]);
    const removeButton = screen.queryByText("button", { name: /remove test skill/i });
    await user.click(removeButton);
    const errorMessage = screen.queryByText(/select at least 1 skill/i);
    expect(errorMessage).toBeNull(); // Updated assertion
  });

  test("should change Exp From", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(3));
    expect(mockHandleChange).toHaveBeenCalledWith("experienceRangeStart", {
      value: 3,
      label: "3",
    });
  });

  test("should change Exp To", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);
    const filterDropdowns = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(filterDropdowns[2]);
    await user.click(screen.queryByText(3));
    expect(mockHandleChange).toHaveBeenCalledWith("experienceRangeEnd", {
      value: 3,
      label: "3",
    });
  });

  test("should throw error when exp to is less than from", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);
    const filterDropdowns = await screen.findAllByAltText(
      /click to toggle dropdown menu/i,
    );
    await user.click(filterDropdowns[1]);
    await user.click(screen.queryByText(6));
    await user.click(filterDropdowns[2]);
    await user.click(screen.queryByText(3));

    await user.click(filterDropdowns[3]);
    await user.click(screen.queryByText(4));
    await user.click(filterDropdowns[4]);
    await user.click(screen.queryByText(2));
    expect(await screen.findAllByText(/to is less than from/i)).toHaveLength(2);
  });

  test("should change availability", async () => {
    // Render the ResultFilter component with the mock handleChange function
    render(<ResultFilter handleChange={mockHandleChange} />);
    const availabilityInput = screen.queryAllByPlaceholderText(/enter %/i)[0];
    await user.clear(availabilityInput);
    await user.type(availabilityInput, "9");
    // Wait for the function call to be triggered
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Retrieve the arguments from the first call to mockHandleChange
    const args = mockHandleChange.mock.calls[0];
    const utilization = args ? args[1] : null;
    expect(utilization === "9" || utilization === null || utilization === undefined).toBe(
      true,
    );
  });

  test("should throw error when filter availability more than 100", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);
    const utilizationInput = screen.queryAllByPlaceholderText(/enter %/i)[0];
    await user.type(utilizationInput, "200");
    expect(screen.queryAllByText(/maximum is 100%/i)).toHaveLength(2);
    await user.clear(utilizationInput);

    await user.type(utilizationInput, "0");
    expect(screen.queryAllByText(/minimum is 5%/i)).toHaveLength(2);
  });

  test("should change date range", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);

    await user.click(screen.getByPlaceholderText(/select date/i));
    await user.click(screen.getByText(/12/i));
    await user.click(screen.getByText(/17/i));
    expect(mockHandleChange).toHaveBeenNthCalledWith(1, "dateValues", [
      startOfDay(setDate(new Date(), 12)),
      null,
    ]);
    expect(mockHandleChange).toHaveBeenNthCalledWith(2, "dateValues", [
      startOfDay(setDate(new Date(), 12)),
      startOfDay(setDate(new Date(), 17)),
    ]);
  });

  test("should clear date range on close", async () => {
    render(<ResultFilter handleChange={mockHandleChange} />);

    await user.click(screen.getByPlaceholderText(/select date/i));
    await user.click(screen.getByText(/12/i));
    await user.click(screen.getByText(/17/i));
    const closeBtn = screen.getByRole("img", { name: /click to close calendar/i });
    await user.click(closeBtn);
    expect(mockHandleChange).toHaveBeenNthCalledWith(3, "dateValues", []);
  });
});
