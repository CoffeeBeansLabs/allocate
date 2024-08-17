import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Menu } from ".";

describe("Menu", () => {
  test("should render menu", () => {
    render(
      <Menu>
        <div>Testing Menu</div>
      </Menu>,
    );

    expect(screen.queryByAltText(/expand more options menu/i)).toBeInTheDocument();
    expect(screen.queryByText(/testing menu/i)).toBeInTheDocument();
  });
});
