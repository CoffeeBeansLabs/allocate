import "vitest-canvas-mock";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatISO, setDate } from "date-fns";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import Report from "./Report";

const originalWindowScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
const originalDocumentMouseDown = document.onmousedown;
const originalCreateObjectURL = global.URL.createObjectURL;

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  document.onmousedown = vi.fn();
  global.URL.createObjectURL = vi.fn();
});

afterAll(() => {
  window.HTMLElement.prototype.scrollIntoView = originalWindowScrollIntoView;
  document.onmousedown = originalDocumentMouseDown;
  global.URL.createObjectURL = originalCreateObjectURL;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Dashboard > Reports", () => {
  const mockDataFunction = vi.fn(() => Promise.resolve("test content"));
  const mockFilename = "testFile";

  const setup = (showDateRange, showLocation) =>
    render(
      <Report
        dataFunction={mockDataFunction}
        filename={mockFilename}
        showDateRange={showDateRange}
        showLocation={showLocation}
      />,
    );

  test("should render report component", async () => {
    setup(true, false);
    const reportButton = screen.queryByAltText(/show report icon/i);
    expect(reportButton).toBeInTheDocument();
  });

  test("should download a CSV file", async () => {
    const user = userEvent.setup();
    const fromDate = formatISO(setDate(new Date(), 16), { representation: "date" });
    const toDate = formatISO(setDate(new Date(), 18), { representation: "date" });
    setup(true, false);
    const reportButton = screen.queryByAltText(/show report icon/i);
    await user.click(reportButton);
    const downloadButton = screen.queryByRole("button", { name: /download csv/i });
    expect(downloadButton).toBeInTheDocument();

    const fromDay = await screen.findByText(/16/i);
    await user.click(fromDay);
    const toDay = await screen.findByText(/18/i);
    await user.click(toDay);

    await user.click(downloadButton);
    const link = await screen.findByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("download", `testFile_${fromDate}_${toDate}.csv`);
  });

  test("should show location when needed", async () => {
    const user = userEvent.setup();
    setup(false, true);
    const reportButton = screen.queryByAltText(/show report icon/i);
    await user.click(reportButton);
    expect(screen.queryByText(/select location/i)).toBeInTheDocument();
    await user.click(screen.queryByAltText(/click to toggle dropdown menu/i));
    expect(screen.queryByText(/hyderabad/i)).toBeInTheDocument();
    const location = screen.queryByText(/pune/i);
    await user.click(location);
    expect(screen.queryByText(/hyderabad/i)).not.toBeInTheDocument();
  });
});
