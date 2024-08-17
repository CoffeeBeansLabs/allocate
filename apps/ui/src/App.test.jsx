import { screen, waitFor } from "@testing-library/react";
import { render } from "common/test-utils";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import App from "./App";

describe("App", () => {
  test("should render the app", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await waitFor(() => expect(screen.getByText("Allocate")).toBeInTheDocument());
  });
});
