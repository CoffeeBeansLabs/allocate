import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Rating } from ".";

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("Rating", () => {
  const mockHandleChange = vi.fn();
  const user = userEvent.setup();

  test("should render ratings with score", () => {
    render(<Rating score={3} />);
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(3);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(2);
  });

  test("should render editable ratings", async () => {
    render(<Rating score={3} isEditable />);
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(3);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(2);
  });

  test("should clear ratings", async () => {
    render(<Rating score={3} handleOnChange={mockHandleChange} isEditable />);
    const filled = screen.queryByAltText(/remove rating/i);
    await user.click(filled);
    expect(mockHandleChange).toHaveBeenCalledWith(0);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(5);
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(0);
  });

  test("should fill ratings", async () => {
    const indexToClick = 3;
    render(<Rating score={2} handleOnChange={mockHandleChange} isEditable />);
    const filled = screen.queryAllByTestId(/rating_/i);
    await user.click(filled[indexToClick]);
    expect(mockHandleChange).toHaveBeenCalledWith(indexToClick + 1);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(
      5 - (indexToClick + 1),
    );
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(indexToClick + 1);
  });

  test("should fill and unfill ratings on hover", async () => {
    const initialScore = 2;
    const indexToHover = 3;
    render(<Rating score={initialScore} isEditable />);
    const filled = screen.queryAllByTestId(/rating_/i);
    await user.hover(filled[indexToHover]);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(
      5 - (indexToHover + 1),
    );
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(indexToHover + 1);
    await user.unhover(filled[indexToHover]);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(5 - initialScore);
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(initialScore);
  });
});
