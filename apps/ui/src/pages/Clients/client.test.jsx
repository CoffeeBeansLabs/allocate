import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../api/API";
import { useAuthStore } from "../../store/authStore";
import Clients from ".";
import ClientForm from "./ClientForm";
import ClientViewDetails from "./ViewDetails";

afterEach(cleanup);

describe("Clients", () => {
  let authenticatedAxiosMock;
  const user = userEvent.setup();
  useAuthStore.setState({ user: { roles: ["admin"] } });

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
  });

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
    render(<ClientForm />);
    await user.click(await screen.findByRole("button", { name: /add more details/i }));

    expect(await screen.findByText(/point of contact 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/other details/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /add client/i }));
  });

  test("should throw error on submit with no change", async () => {
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
    authenticatedAxiosMock.onGet("/clients/creation-dropdowns/").reply(200, {
      dropdowns: {
        accountManagers: [{ id: 1, fullNameWithExpBand: "Test Manager" }],
        industries: [{ id: 1, name: "Test Industry" }],
        status: [{ id: "ACTIVE", name: "Active" }],
      },
    });
    const mockData = {
      name: "Test Client",
      status: "ACTIVE",
      industry: { id: 1 },
      accountManager: { id: 1 },
      pocs: [
        {
          name: "Test POC",
        },
      ],
    };
    render(<ClientForm type="edit" data={mockData} />);
    expect(
      await screen.findByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/enter here/i)).toHaveValue("Test Client");
    expect(screen.queryByText("Test Industry")).toBeInTheDocument();
    expect(screen.queryByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Test Manager")).toBeInTheDocument();
    expect(screen.queryAllByPlaceholderText(/enter name/i)[0]).toHaveValue("Test POC");
    expect(() => screen.getByRole("button", { name: /add more details/i })).toThrow();
  });

  test("should update form on saving edit changes", async () => {
    authenticatedAxiosMock.onGet("/clients/creation-dropdowns/").reply(200, {
      dropdowns: {
        accountManagers: [],
        industries: [{ id: 1, name: "Test Industry" }],
        status: [{ id: "ACTIVE", name: "Active" }],
      },
    });
    authenticatedAxiosMock.onPut("/clients/1/").reply(200);
    const mockData = {
      id: 1,
      name: "Test Client",
      status: "ACTIVE",
      industry: { id: 1 },
      country: "Country",
      city: "City",
      startDate: "2020-01-10",
      pocs: [
        {
          name: "Test POC",
          email: "test@example.com",
        },
      ],
    };
    render(<ClientForm type="edit" data={mockData} />);
    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await user.click(saveBtn);
    expect(authenticatedAxiosMock.history.put).toHaveLength(1);
    expect(authenticatedAxiosMock.history.put[0].url).toBe("/clients/1/");
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
