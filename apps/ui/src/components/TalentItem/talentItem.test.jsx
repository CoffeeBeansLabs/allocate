import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { useAuthStore } from "../../store/authStore";
import TalentItem from ".";

describe("Talent Item", () => {
  const user = userEvent.setup();
  vi.mock("../../common/common", async () => {
    const actual = await vi.importActual("../../common/common");
    return {
      ...actual,
      isMobile: true,
    };
  });

  useAuthStore.setState({ user: { roles: ["admin"] } });

  test("should render talent data", () => {
    render(
      <BrowserRouter>
        <TalentItem talentData={{ id: 1, name: "test talent", skills: [] }}></TalentItem>
      </BrowserRouter>,
    );
    expect(screen.queryByText(/test talent/i)).toBeInTheDocument();
    expect(screen.queryByText(/lwd/i)).toBeInTheDocument();
    expect(screen.queryByText(/role/i)).toBeInTheDocument();
    expect(screen.queryByText(/exp/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/chevron icon/i)).toBeInTheDocument();
  });

  test("should rotate chevron icon", async () => {
    render(
      <BrowserRouter>
        <TalentItem talentData={{ id: 1, name: "test talent", skills: [] }} />
      </BrowserRouter>,
    );
    const chevronBtn = screen.queryByAltText(/chevron icon/i);
    expect(chevronBtn).toHaveStyle("transform: rotate(0deg)");
    await user.click(chevronBtn);
    expect(chevronBtn).toHaveStyle("transform: rotate(180deg)");
  });
});
