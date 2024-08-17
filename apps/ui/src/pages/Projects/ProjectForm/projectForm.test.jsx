import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { formatISO, setDate } from "date-fns";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI, { CountriesNowAPI } from "../../../api/API";
import ProjectForm from ".";

describe("Project Form", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  let countriesMock;

  const mockOnSubmit = vi.fn();

  const mockData = {
    name: "Test Project",
    status: "COLD",
    client: { id: 1 },
    engagementType: "Test Type",
    deliveryMode: "Test Mode",
    accountManager: "Test Manager - l1",
    currency: "INR",
    city: "Petran",
    country: "Albania",
    startDate: formatISO(setDate(new Date(), 12), { representation: "date" }), // Change to 12 for start date
    endDate: formatISO(setDate(new Date(), 16), { representation: "date" }), // Change to 16 for end date
  };

  const mockDropdownResponse = {
    dropdowns: {
      accountManager: [{ id: 1, fullNameWithExpBand: "Test Manager - l1" }],
      clients: [{ id: 1, name: "Test Client" }],
      deliveryModes: [{ id: "MODE", name: "Test Mode" }],
      engagements: [{ id: "TT", name: "Test Type" }],
      status: [{ id: "COLD", name: "Cold" }],
    },
  };

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
    countriesMock = new MockAdapter(CountriesNowAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    countriesMock.reset();
    countriesMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render add project form", async () => {
    render(<ProjectForm type="add" />);
    const addMoreDetailsBtn = await screen.findByRole("button", {
      name: /add more details/i,
    });

    expect(screen.queryByText(/project name/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/type of engagement \(optional\)/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/account manager \(optional\)/i)).not.toBeInTheDocument();

    await user.click(addMoreDetailsBtn);
    expect(screen.queryByText(/type of engagement \(optional\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/account manager \(optional\)/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /add project/i,
      }),
    ).toBeInTheDocument();
  });

  test("should render edit project form", async () => {
    render(<ProjectForm type="edit" />);

    expect(await screen.findByText(/project name/i)).toBeInTheDocument();
    expect(screen.queryByText(/type of engagement \(optional\)/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /add more details/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /save changes/i,
      }),
    ).toBeInTheDocument();
  });

  test("should update dropdowns to default value in edit", async () => {
    authenticatedAxiosMock
      .onGet("/projects/creation-dropdowns/")
      .reply(200, mockDropdownResponse);

    render(<ProjectForm type="edit" data={mockData} />);
    expect(await screen.findByText(/test client/i)).toBeInTheDocument();
    expect(screen.queryByText(/test manager - l1/i)).toBeInTheDocument();
    expect(screen.queryByText(/cold/i)).toBeInTheDocument();
    expect(screen.queryByText(/test type/i)).toBeInTheDocument();
    expect(screen.queryByText(/test mode/i)).toBeInTheDocument();
    expect(screen.queryByText(/inr/i)).toBeInTheDocument();
  });

  test("should throw error when submitted with no change", async () => {
    render(<ProjectForm type="add" />);

    const submitBtn = await screen.findByRole("button", {
      name: /add project/i,
    });

    await user.click(submitBtn);

    expect(await screen.findByText(/enter a name/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/select client/i)).toHaveLength(2);
    expect(screen.queryAllByText(/select status/i)).toHaveLength(2);
    expect(screen.queryAllByText(/select country/i)).toHaveLength(2);
    expect(screen.queryAllByText(/select city/i)).toHaveLength(2);
    expect(screen.queryByText(/select startDate/i)).toBeInTheDocument();
  });

  test("should not throw error when submitted with change", async () => {
    render(<ProjectForm type="add" />);

    await user.type(await screen.findByPlaceholderText(/enter here/i), "test name");

    const submitBtn = screen.queryByRole("button", {
      name: /add project/i,
    });
    await user.click(submitBtn);

    expect(screen.queryAllByText(/select client/i)).toHaveLength(2);
    expect(screen.queryByText(/enter a name/i)).not.toBeInTheDocument();
  });

  test("should handle add project", async () => {
    // Mocking API responses
    countriesMock.onGet("/countries/cities/q").reply(200, {
      error: false,
      msg: "cities in Albania retrieved",
      data: ["Elbasan", "Petran"],
    });
    countriesMock.onGet("/countries").reply(200, {
      error: false,
      msg: "countries and cities retrieved",
      data: [{ country: "India" }, { country: "Albania" }],
    });
    authenticatedAxiosMock
      .onGet("/projects/creation-dropdowns/")
      .reply(200, mockDropdownResponse);
    authenticatedAxiosMock.onPost("/projects/").reply(200);

    // Render the component
    render(<ProjectForm type="add" onSubmit={mockOnSubmit} />);
    const dropdownSelect = await screen.findAllByAltText(
      /Click to toggle dropdown menu/i,
    );

    // Fill the form
    await user.type(await screen.findByPlaceholderText(/enter here/i), "test name");
    await user.click(dropdownSelect[0]);
    await user.click(screen.queryByText(/test client/i));
    await user.click(dropdownSelect[1]);
    await user.click(screen.queryByText(/cold/i));
    await user.click(dropdownSelect[2]);
    await user.click(screen.queryByText(/albania/i));
    await user.click(dropdownSelect[3]);
    await user.click(await screen.findByText(/petran/i));

    // Adjust start and end dates
    await user.click(screen.queryAllByPlaceholderText(/select date/i)[0]);
    await user.click(screen.queryByText(/12/i));

    await user.click(screen.queryAllByPlaceholderText(/select date/i)[1]);
    await user.click(screen.queryByText(/16/i));

    // Submit the form
    const submitBtn = screen.queryByRole("button", {
      name: /add project/i,
    });
    await user.click(submitBtn);

    // Expected data
    const dataArgument = {
      name: "test name",
      client: 1,
      status: "COLD",
      city: "Petran",
      country: "Albania",
      startDate: formatISO(setDate(new Date(), 12), { representation: "date" }), // Adjusted start date here
      endDate: formatISO(setDate(new Date(), 16), { representation: "date" }), // Adjusted end date here
      pocs: [],
      accountManager: null,
      comment: null,
    };

    // Assertions
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(authenticatedAxiosMock.history.post).toHaveLength(1);
    expect(authenticatedAxiosMock.history.post[0].data).toBe(
      JSON.stringify(dataArgument),
    );
  });

  test("should handle save project changes", async () => {
    const dataArgument = {
      name: "Test Project",
      client: 1,
      status: "COLD",
      city: "Petran",
      country: "Albania",
      startDate: formatISO(setDate(new Date(), 12), { representation: "date" }),
      endDate: formatISO(setDate(new Date(), 16), { representation: "date" }),
      currency: "INR",
      deliveryMode: "MODE",
      engagementType: "TT",
      pocs: [
        {
          name: "test poc",
          email: "testPoc@email.com",
          phoneNumber: "1234567",
          designation: "Account manager",
        },
      ],
      accountManager: 1,
      comment: null,
    };

    countriesMock.onGet("/countries/cities/q").reply(200, {
      error: false,
      msg: "cities in Albania retrieved",
      data: ["Elbasan", "Petran"],
    });
    authenticatedAxiosMock
      .onGet("/projects/creation-dropdowns/")
      .reply(200, mockDropdownResponse);
    authenticatedAxiosMock
      .onPut(new RegExp(`/projects/*/`))
      .reply(200, { project: { id: 1, ...dataArgument } });

    render(
      <ProjectForm
        type="edit"
        data={{
          ...mockData,
          pocName: "test poc",
          pocEmail: "testPoc@email.com",
          pocPhoneNumber: "1234567",
          pocDesignation: "Account manager",
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    const saveBtn = await screen.findByRole("button", {
      name: /save changes/i,
    });
    await user.click(saveBtn);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(authenticatedAxiosMock.history.put).toHaveLength(1);
    expect(authenticatedAxiosMock.history.put[0].data).toBe(JSON.stringify(dataArgument));
  });
});
