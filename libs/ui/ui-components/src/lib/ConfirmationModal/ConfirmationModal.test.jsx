import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ConfirmationModal } from ".";

describe("ConfirmationModal", () => {
  test("should render the modal with the correct message", () => {
    render(
      <ConfirmationModal
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
  });

  test("should call onConfirm when the Dismiss button is clicked", () => {
    const mockOnConfirm = vi.fn();
    render(
      <ConfirmationModal
        message="Are you sure you want to proceed?"
        onConfirm={mockOnConfirm}
        onCancel={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("Dismiss"));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test("should call onCancel when the Cancel button is clicked", () => {
    const mockOnCancel = vi.fn();
    render(
      <ConfirmationModal
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("should render both Cancel and Dismiss buttons", () => {
    render(
      <ConfirmationModal
        message="Are you sure you want to proceed?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });
});
