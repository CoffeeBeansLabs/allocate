import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import { UploadImages } from ".";

const originalCreateObjectURL = global.URL.createObjectURL;

beforeAll(() => {
  global.URL.createObjectURL = vi.fn();
});

afterAll(() => {
  global.URL.createObjectURL = originalCreateObjectURL;
});

describe("Upload Image", () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  test("should upload image file", async () => {
    render(
      <UploadImages
        label="Test Image Upload"
        onChange={mockOnChange}
        editImageURLs={[]}
      />,
    );
    expect(screen.queryByText(/test image upload/i));

    let blob = new Blob([""]);
    const imageFile = new File([blob], "test.png", { type: "image/png" });
    const fileInput = screen.queryByLabelText(/test image upload/i);

    await user.upload(fileInput, [imageFile]);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(fileInput.files).toHaveLength(1);
    expect(fileInput.files?.item(0)).toBe(imageFile);
  });

  test("should display uploaded files", async () => {
    render(<UploadImages label="Test Image Upload" />);
    expect(screen.queryByText(/test image upload/i));

    let blob = new Blob([""]);
    const imageFile = new File([blob], "test.png", { type: "image/png" });
    const fileInput = screen.queryByLabelText(/test image upload/i);

    await user.upload(fileInput, [imageFile]);
    expect(screen.queryByAltText(/uploaded screenshot 1/i)).toBeInTheDocument();
  });
});
