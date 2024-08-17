import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Select } from ".";
import { CheckboxOption } from "./CheckboxOption";
import { ReactSelect } from "./ReactSelect";

describe("Select", () => {
  const user = userEvent.setup();
  const mockOptions = [
    { value: "testA", label: "Test A" },
    { value: "testB", label: "Test B" },
  ];

  test("should render select", () => {
    render(<Select label="Test Select" placeholder="Select a option" />);
    expect(screen.queryByText(/test select/i)).toBeInTheDocument();
    expect(screen.queryByText(/select a option/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/Chevron/i)).toBeInTheDocument();
  });

  test("should render all options", async () => {
    render(<Select options={mockOptions} />);
    const dropdownBtn = screen.queryByAltText(/Chevron/i);
    await user.click(dropdownBtn);
    const optionOne = screen.queryByText(/test a/i);
    expect(optionOne).toBeInTheDocument();
    expect(screen.queryByText(/test b/i)).toBeInTheDocument();
    await user.click(optionOne);
    expect(optionOne).toBeInTheDocument();
  });

  test("should render react select label", () => {
    render(<ReactSelect label="Test Select" placeholder="Select a option" isError />);
    expect(screen.queryByText(/test select/i)).toBeInTheDocument();
    expect(screen.queryByText(/select a option/i)).toBeInTheDocument();
  });

  test("should render checkbox option", async () => {
    render(
      <ReactSelect
        options={mockOptions}
        components={{
          Option: CheckboxOption,
        }}
      />,
    );
    const dropdownBtn = screen.queryByAltText(/click to toggle dropdown menu/i);
    await user.click(dropdownBtn);
    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(mockOptions.length);
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });
});
