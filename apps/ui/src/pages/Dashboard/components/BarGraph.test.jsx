import "vitest-canvas-mock";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import BarGraph from "./BarGraph";

afterEach(() => {
  vi.clearAllMocks();
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const originalResizeObserver = window.ResizeObserver;

beforeAll(() => {
  window.ResizeObserver = ResizeObserver;
});

afterAll(() => {
  window.ResizeObserver = originalResizeObserver;
});

describe("Dashboard > BarGraph", () => {
  const testLabels = Array(7).fill("Lorem ipsum dolor sit amet consectetur adipisicing");
  const testDataValues = Array(5)
    .fill([273, 127])
    .concat([
      [0, 154],
      [123, 0],
    ]);
  const testGraphConfig = [
    {
      label: "Test A",
      color: "#F15858",
    },
    {
      label: "Test B",
      color: "#F15858",
    },
  ];

  test("should show no data when data not present", async () => {
    render(<BarGraph labels={[]} dataValues={[]} isAscendingOrder={false} />);

    expect(screen.queryByText(/no data/i)).toBeInTheDocument();
  });

  test("should render a graph", async () => {
    render(
      <BarGraph
        labels={testLabels}
        dataValues={testDataValues}
        graphConfig={testGraphConfig}
        isAscendingOrder={true}
        showLegend
      />,
    );

    expect(await screen.findByText(/a-z/i)).toBeInTheDocument();
    expect(
      await screen.findByAltText(/click to toggle dropdown menu/i),
    ).toBeInTheDocument();
  });

  test("should render descending select", async () => {
    render(
      <BarGraph
        labels={testLabels}
        dataValues={testDataValues}
        isAscendingOrder={false}
      />,
    );

    expect(await screen.findByText(/z-a/i)).toBeInTheDocument();
    await userEvent.click(screen.queryByAltText(/click to toggle dropdown menu/i));
    await userEvent.click(await screen.findByText(/a-z/i));
    expect(await screen.findByText(/a-z/i)).toBeInTheDocument();
  });

  test("should render arrow keys", async () => {
    const testArray = Array(20);
    render(<BarGraph labels={testArray} dataValues={testArray} />);
    const leftArrow = screen.queryByAltText(/blue left arrow/i);
    const rightArrow = screen.queryByAltText(/blue right arrow/i);
    await userEvent.click(leftArrow);
    expect(rightArrow.parentElement).toHaveClass("show");
    await userEvent.click(rightArrow);
    expect(rightArrow.parentElement).toHaveClass("hide");
  });
});
