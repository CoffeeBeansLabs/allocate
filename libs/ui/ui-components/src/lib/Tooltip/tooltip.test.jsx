import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Tooltip } from ".";

describe("Tooltip", () => {
  const user = userEvent.setup();

  test("should render tooltip with hover", async () => {
    render(<Tooltip content="Tooltip hovered">Test tooltip</Tooltip>);
    const tooltipBody = screen.queryByText(/test tooltip/i);
    expect(tooltipBody).toBeInTheDocument();
    await user.hover(tooltipBody);
    expect(screen.queryByText(/tooltip hovered/i)).toHaveStyle({ visibility: "visible" });
    await user.unhover(tooltipBody);
    expect(screen.queryByText(/tooltip hovered/i)).toHaveStyle({
      visibility: "hidden",
    });
  });
});
