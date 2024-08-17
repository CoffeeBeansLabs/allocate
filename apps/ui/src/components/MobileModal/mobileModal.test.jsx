import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import MobileModal from "./MobileModal";

describe("mobile modal", () => {
  test("should render mobile modal", () => {
    render(
      <MobileModal isOpen={true} title="Test modal" showTitle isFullScreen showBackButton>
        Modal body content
      </MobileModal>,
    );
    expect(screen.queryByText(/modal body content/i)).toBeInTheDocument();
    expect(screen.queryByText(/test modal/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/close icon/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/back button arrow/i)).toBeInTheDocument();
  });
});
