import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ErrorMessage } from ".";

describe("Error Message", () => {
  test("should display error message in red", () => {
    render(<ErrorMessage message="Required" />);
    const error = screen.queryByText(/required/i);
    expect(error).toHaveStyle({ color: "var(--color-CarminePink)" });
  });
});
