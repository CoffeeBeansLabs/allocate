import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useAuthStore } from "../../store/authStore";
import Clients from ".";
import ClientForm from "./ClientForm";
import ClientViewDetails from "./ViewDetails";

afterEach(cleanup);

describe("Clients", () => {
  useAuthStore.setState({ user: { roles: ["admin"] } });
  const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  window.IntersectionObserver = IntersectionObserverMock;

  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  test("should display a table", async () => {
    render(
      <BrowserRouter>
        <Clients />
      </BrowserRouter>,
    );

    expect(
      screen.queryByRole("button", { name: /add new client add new client/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("row", { name: /client date of creation domain/i }),
    ).toBeInTheDocument();
  });

  test("should open modal on click add new client", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Clients />
      </BrowserRouter>,
    );
    expect(await screen.findByText("Add New Client")).toBeInTheDocument();
    await user.click(
      screen.queryByRole("button", { name: /add new client add new client/i }),
    );
    expect(
      screen.queryByRole("heading", { name: /add new client/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /close icon/i })).toBeInTheDocument();
  });

  test("should expand client form to show additional detail form", async () => {
    const user = userEvent.setup();
    render(<ClientForm />);
    await user.click(await screen.findByRole("button", { name: /add more details/i }));

    expect(await screen.findByText(/point of contact 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/other details/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /add client/i }));
  });

  test("should throw error on submit with no change", async () => {
    const user = userEvent.setup();
    render(<ClientForm type="add" />);
    const submitBtn = await screen.findByRole("button", { name: /add client/i });

    await user.click(submitBtn);
    expect(await screen.findByText(/client name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/select industry type/i)).toBeInTheDocument();
    expect(await screen.findByText(/select a country/i)).toBeInTheDocument();
    expect(await screen.findByText(/select a city/i)).toBeInTheDocument();
    expect(await screen.findByText(/select start date/i)).toBeInTheDocument();
  });

  test("should not show error when input is changed on submit", async () => {
    const user = userEvent.setup();
    render(<ClientForm type="add" />);
    const submitBtn = await screen.findByRole("button", { name: /add client/i });
    const clientName = await screen.findByPlaceholderText("Enter here");

    await user.type(clientName, "test");

    await user.click(submitBtn);
    await waitFor(() => {
      expect(screen.queryByText(/client name is required/i)).toBeNull();
    });
  });

  test("should render editable form", async () => {
    render(<ClientForm type="edit" />);
    expect(
      await screen.findByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument(),
      expect(() => screen.getByRole("button", { name: /add more details/i })).toThrow();
  });

  test("should render details page", async () => {
    render(
      <BrowserRouter>
        <ClientViewDetails />
      </BrowserRouter>,
    );
    expect(screen.queryByText(/clients \/ view details/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /client details/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: /project name/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", { name: /no data to display/i }),
    ).toBeInTheDocument();
  });

  test("should open modal on click edit client", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ClientViewDetails />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("button", { name: /edit icon edit/i }),
    ).toBeInTheDocument(),
      await user.click(screen.queryByRole("button", { name: /edit icon edit/i }));
    expect(
      screen.queryByRole("heading", { name: /edit client details/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /close icon/i })).toBeInTheDocument();
  });
});
