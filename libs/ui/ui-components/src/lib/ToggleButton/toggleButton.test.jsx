import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ToggleButton } from ".";

describe("Toggle Button", () => {
  const mockOnClick = vi.fn();
  const user = userEvent.setup();

  test("should render toggle", async () => {
    render(<ToggleButton label="Test toggle" toggled={true} onClick={mockOnClick} />);

    expect(screen.queryByText(/test toggle/i)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeChecked();
  });

  test("should check the toggle", async () => {
    render(<ToggleButton toggled={false} onClick={mockOnClick} />);
    const button = screen.queryByRole("checkbox");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeChecked();
    await user.click(button);
    expect(mockOnClick).toHaveBeenCalledWith(true);
    expect(button).toBeChecked();
  });
});
