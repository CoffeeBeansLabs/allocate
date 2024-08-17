import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import App from "../../App";

describe("Tests for client module page", () => {
  test("should show login page", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    await waitFor(() => screen.getByText("Allocate"));
    expect(screen.getByText("Allocate")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });
});
