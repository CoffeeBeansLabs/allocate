import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import exampleImage from "../../assets/noRoles.png";
import { Image } from ".";

describe("Image", () => {
  test("should display image", () => {
    render(<Image src="test.jpeg" fallbackSrc={exampleImage} alt="Test image" />);
    const displayedImage = document.querySelector("img");
    expect(displayedImage.src).toContain("test.jpeg");
    expect(screen.queryByAltText(/test image/i)).toBeInTheDocument();
  });

  test("should display fallback", async () => {
    render(<Image fallbackSrc={exampleImage} alt="Test image" />);
    const displayedImage = document.querySelector("img");
    await waitFor(() => fireEvent.error(displayedImage));
    expect(displayedImage.src).toContain("noRoles.png");
  });
});
