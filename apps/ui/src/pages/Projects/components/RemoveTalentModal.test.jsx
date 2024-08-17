import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../../api/API";
import RemoveTalentModal from "./RemoveTalentModal";

describe("Add to Project Form", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  const mockTalent = {
    id: 1,
    name: "Test name",
  };

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render remove talent", async () => {
    render(<RemoveTalentModal isOpen={true} talent={mockTalent} />);

    expect(
      screen.queryByText(/do you want to remove test name from the project\?/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /not yet/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /yes, remove/i })).toBeInTheDocument();
  });

  test("should cancel on not yet", async () => {
    const mockOnCancel = vi.fn();
    render(
      <RemoveTalentModal isOpen={true} talent={mockTalent} onCancel={mockOnCancel} />,
    );

    await user.click(screen.queryByRole("button", { name: /not yet/i }));
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  test("should confirm on remove", async () => {
    const mockOnConfirm = vi.fn();
    authenticatedAxiosMock.onDelete(new RegExp(`/projects/allocation/*`)).reply(200);

    render(
      <RemoveTalentModal isOpen={true} talent={mockTalent} onConfirm={mockOnConfirm} />,
    );

    await user.click(screen.queryByRole("button", { name: /yes, remove/i }));
    expect(authenticatedAxiosMock.history.delete).toHaveLength(1);
    expect(mockOnConfirm).toHaveBeenCalledOnce();
  });
});
