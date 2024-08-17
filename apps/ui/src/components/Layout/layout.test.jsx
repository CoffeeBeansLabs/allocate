import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { useAuthStore } from "../../store/authStore";
import Layout from ".";

describe("Layout", () => {
  test("should render layout when allowed route matches", () => {
    useAuthStore.setState({ user: { roles: ["test role"] } });
    render(
      <BrowserRouter>
        <Layout allowedRoles={["test role"]} />
      </BrowserRouter>,
    );
    expect(
      screen.queryByRole("img", { name: /profile picture of user/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /logo/i })).toBeInTheDocument();
  });
});
