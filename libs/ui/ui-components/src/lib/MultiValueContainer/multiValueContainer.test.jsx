import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { MultiValueContainer } from ".";

describe("Multi Value Container", () => {
  const user = userEvent.setup();
  const mockContainerValues = [
    {
      value: "Test A",
      label: "Test A",
    },
    {
      value: "Test B",
      label: "Test B",
    },
  ];

  test("should render container with input", () => {
    render(<MultiValueContainer variant="input" values={mockContainerValues} />);
    expect(screen.queryByPlaceholderText(/enter/i)).toBeInTheDocument();
    expect(screen.queryByText(/test a/i)).toBeInTheDocument();
    expect(screen.queryByText(/test b/i)).toBeInTheDocument();
  });

  test("should add and delete in input contatiner", async () => {
    const mockOnAdd = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <MultiValueContainer
        variant="input"
        values={mockContainerValues}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />,
    );
    await user.type(screen.queryByPlaceholderText(/enter/i), "Test C");
    await user.keyboard("{Enter}");
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    await user.click(screen.queryAllByAltText(/cross button to remove/i)[0]);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test("should render container with select", () => {
    render(<MultiValueContainer variant="select" values={mockContainerValues} />);
    expect(screen.queryByText(/start typing/i)).toBeInTheDocument();
    expect(screen.queryByText(/test a/i)).toBeInTheDocument();
    expect(screen.queryByText(/test b/i)).toBeInTheDocument();
  });

  test("should add and delete in select contatiner ", async () => {
    const mockOnAdd = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <MultiValueContainer
        variant="select"
        values={mockContainerValues}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        options={[
          { value: "Test C", label: "Test C" },
          { value: "Test D", label: "Test D" },
        ]}
      />,
    );
    await user.click(screen.queryByAltText(/click to toggle dropdown menu/i));
    const optionOne = await screen.findByText(/test d/i);
    expect(optionOne).toBeInTheDocument();
    await user.click(optionOne);
    expect(mockOnAdd).toHaveBeenCalledTimes(1);

    await user.click(screen.queryAllByAltText(/cross button to remove/i)[0]);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
