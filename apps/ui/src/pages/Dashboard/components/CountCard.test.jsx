import "vitest-canvas-mock";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import CountCard from "./CountCard";

describe("Dashboard > Count Card", () => {
  test("should render count card", async () => {
    render(<CountCard title="Test" count={100} percentageChange={+30} size="h3" />);

    expect(screen.queryByText(/test/i)).toBeInTheDocument();
    expect(screen.queryByText(/100/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/up trend arrow in green/i)).toBeInTheDocument();
    expect(screen.queryByText(/30%/i)).toBeInTheDocument();
  });

  test("should show negative trend", async () => {
    render(<CountCard title="Test" count={100} percentageChange={-20} size="h3" />);

    expect(screen.queryByText(/test/i)).toBeInTheDocument();
    expect(screen.queryByText(/100/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/down trend arrow in red/i)).toBeInTheDocument();
    expect(screen.queryByText(/-20%/i)).toBeInTheDocument();
  });
});
