import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "./DashboardLayout";

describe("Dashboard Layout", () => {
  test("should render layout when allowed route matches", () => {
    useAuthStore.setState({
      user: { roles: ["test role"] },
      featureFlags: {
        assetModule: true,
      },
    });
    render(
      <BrowserRouter>
        <DashboardLayout allowedRoles={["test role"]} />
      </BrowserRouter>,
    );

    expect(screen.queryByText(/current allocation/i)).toBeInTheDocument();
    expect(screen.queryByText(/cafe and potential/i)).toBeInTheDocument();
    expect(screen.queryByText(/people/i)).toBeInTheDocument();
    expect(screen.queryByText(/client and projects/i)).toBeInTheDocument();
    expect(screen.queryByText(/assets/i)).toBeInTheDocument();
  });
});
