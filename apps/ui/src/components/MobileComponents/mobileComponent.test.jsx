import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import MobileFilterComponent from "./MobileFilterComponents/MobileFilterComponent";
import MobileSearchComponent from "./MobileSearchComponent/MobileSearchComponent";

beforeAll(() => {
  const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("mobile components", () => {
  const user = userEvent.setup();

  test("should render mobile search", async () => {
    const mockGetResults = vi
      .fn()
      .mockResolvedValue({ test: [{ id: 1, name: "test result" }], count: 1 });
    const mockFormatResults = vi.fn().mockImplementation((result) => result);

    render(
      <MobileSearchComponent
        searchFor="test"
        getSearchResults={mockGetResults}
        formatResults={mockFormatResults}
      />,
    );
    const input = screen.queryByPlaceholderText(/search test here/i);
    expect(input).toBeInTheDocument();
    await user.type(input, "test result");
    expect(await screen.findByText(/test result/i)).toBeInTheDocument();
  });

  test("should render mobile filter", () => {
    render(<MobileFilterComponent sortDropdown={[{ value: "test", label: "test" }]} />);
    expect(screen.queryByText(/select filter/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apply filter/i })).toBeInTheDocument();
  });
});
