import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { formatISO, setDate } from "date-fns";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../../../api/API";
import { useAuthStore } from "../../../../store/authStore";
import RolesForm from ".";

describe("Roles Form", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;

  const mockData = {
    roleName: "Test Role",
    positions: [
      {
        id: 12,
        skills: [{ id: 23, name: "Test Skill" }],
        experienceRangeStart: 2,
        experienceRangeEnd: 8,
        utilization: 100,
        startDate: formatISO(setDate(new Date(), 10), { representation: "date" }),
        isBillable: false,
      },
    ],
  };

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render roles form", async () => {
    render(<RolesForm />);
    expect(await screen.findByText(/select role/i)).toBeInTheDocument();
    expect(screen.queryByText(/position 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/enter the primary skill first/i)).toBeInTheDocument();
    expect(screen.queryByText(/select skillset/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/select billing status/i)).toHaveLength(2);
  });

  test("should add more positions", async () => {
    render(<RolesForm />);
    await user.click(await screen.findByRole("button", { name: /\+ add more/i }));
    expect(screen.queryByText(/position 2/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/select skillset/i)).toHaveLength(2);
    expect(screen.queryAllByText(/enter the primary skill first/i)).toHaveLength(2);
  });

  test("should delete unsaved position", async () => {
    render(<RolesForm />);
    await user.click(await screen.findByRole("button", { name: /\+ add more/i }));
    expect(screen.queryByText(/position 2/i)).toBeInTheDocument();
    await user.click(screen.queryAllByAltText(/delete icon\(bin\)/i)[1]);
    expect(screen.queryByText(/position 2/i)).not.toBeInTheDocument();
  });

  test("should create new role", async () => {
    useAuthStore.setState({ user: { roles: ["admin"] } });
    authenticatedAxiosMock.onPost("/user/create_role/").reply(200);

    render(<RolesForm />);
    const roleDropdown = await screen.findAllByAltText(/click to toggle dropdown menu/i);
    await user.click(roleDropdown[0]);
    await user.click(
      screen.getByRole("button", { name: /blue add button \(plus\) create role/i }),
    );
    expect(screen.queryByPlaceholderText(/role name/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/role name/i), "test role");
    await user.click(screen.getByRole("button", { name: /white add button \(plus\)/i }));
    expect(authenticatedAxiosMock.history.post).toHaveLength(1);
    expect(authenticatedAxiosMock.history.post[0].data).toBe(
      JSON.stringify({ name: "test role" }),
    );
  });

  test("should create new positions", async () => {
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [{ id: 1, name: "test role" }],
        skills: [{ id: 23, name: "test skill" }],
      },
    });
    authenticatedAxiosMock.onPost("/projects/positions/").reply(200);
    const mockCreateSubmit = vi.fn();

    render(<RolesForm onCreateSubmit={mockCreateSubmit} type="add" />);
    const roleDropdown = await screen.findAllByAltText(/click to toggle dropdown menu/i);
    await user.click(roleDropdown[0]);
    await user.click(screen.getByText(/test role/i));
    await user.click(roleDropdown[1]);
    await user.click(screen.getByText(/test skill/i));

    await user.click(roleDropdown[2]);
    await user.click(screen.getByText(/24/i));
    await user.click(roleDropdown[3]);
    await user.click(screen.getByText(/29/i));
    await user.click(screen.getAllByPlaceholderText(/select date/i)[0]);
    await user.click(screen.getByText(/14/i));

    await user.type(screen.getByPlaceholderText(/enter utilization/i), "100");
    expect(screen.queryAllByText(/select billing status/i)).not.toHaveLength(0);

    const billingStatusDropdowns = screen.getAllByText(/select billing status/i);
    expect(billingStatusDropdowns[0]).toBeInTheDocument();

    await user.click(billingStatusDropdowns[0]);
    await user.click(screen.getByText(/non billable/i));

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(authenticatedAxiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(authenticatedAxiosMock.history.post[0].data)).toEqual({
      project: null,
      role: 1,
      positions: [
        {
          skills: [23],
          utilization: 100,
          startDate: formatISO(setDate(new Date(), 14), { representation: "date" }),
          endDate: null,
          experienceRangeStart: 24,
          experienceRangeEnd: 29,
          isBillable: false,
        },
      ],
    });
    expect(mockCreateSubmit).toHaveBeenCalledOnce();
  });

  test("should disable save in edit mode", async () => {
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [{ id: 1, name: "Test Role" }],
        skills: [{ id: 23, name: "Test Skill" }],
      },
    });
    render(<RolesForm type="edit" data={mockData} />);
    expect(await screen.findByText(/test role/i)).toBeInTheDocument();
    expect(screen.queryByText(/test skill/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).toBeDisabled();
  });

  test("should delete saved position", async () => {
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [{ id: 1, name: "Test Role" }],
        skills: [{ id: 23, name: "Test Skill" }],
      },
    });
    authenticatedAxiosMock.onDelete(/\/projects\/positions\/*/).reply(200);

    render(<RolesForm type="edit" data={mockData} />);
    await user.click(await screen.findByAltText(/delete icon\(bin\)/i));
    expect(authenticatedAxiosMock.history.delete).toHaveLength(1);
    expect(authenticatedAxiosMock.history.delete[0].url).toContain(
      mockData.positions[0].id,
    );
  });

  test("should save edited position", async () => {
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [{ id: 1, name: "Test Role" }],
        skills: [{ id: 23, name: "Test Skill" }],
      },
    });
    authenticatedAxiosMock.onPatch(/\/projects\/positions\/*/).reply(200);

    render(<RolesForm type="edit" data={mockData} />);
    const calendarInputs = await screen.findAllByPlaceholderText(/select date/i);
    await user.click(calendarInputs[1]);
    await user.click(screen.getByText(/15/i));

    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).toBeEnabled();
    await user.click(saveBtn);
    expect(authenticatedAxiosMock.history.patch).toHaveLength(1);
    expect(authenticatedAxiosMock.history.patch[0].data).toBe(
      JSON.stringify({
        skills: [23],
        utilization: 100,
        startDate: mockData.positions[0].startDate,
        endDate: formatISO(setDate(new Date(), 15), { representation: "date" }),
        isBillable: false,
      }),
    );
    expect(saveBtn).toBeDisabled();
  });

  test("should save new position in edit", async () => {
    authenticatedAxiosMock.onGet("/projects/position-dropdowns/").reply(200, {
      dropdowns: {
        roles: [{ id: 1, name: "Test Role" }],
        skills: [{ id: 23, name: "Test Skill" }],
      },
    });
    authenticatedAxiosMock.onPost("/projects/positions/").reply(200);

    render(<RolesForm type="edit" data={{ roleName: "Test Role", positions: [] }} />);
    await user.click(await screen.findByRole("button", { name: /\+ add more/i }));
    const roleDropdown = screen.getAllByAltText(/click to toggle dropdown menu/i);
    await user.click(roleDropdown[1]);
    await user.click(screen.getByText(/test skill/i));

    await user.click(roleDropdown[2]);
    await user.click(screen.getByText(/24/i));
    await user.click(roleDropdown[3]);
    await user.click(screen.getByText(/29/i));
    await user.click(screen.getAllByPlaceholderText(/select date/i)[0]);
    await user.click(screen.getByText(/14/i));

    const utilizationFields = screen.getAllByPlaceholderText(/enter utilization/i);
    expect(utilizationFields).not.toHaveLength(0);
    expect(utilizationFields[0]).toBeInTheDocument();

    await user.type(utilizationFields[0], "100");

    expect(screen.queryAllByText(/select billing status/i)).not.toHaveLength(0);

    const billingStatusDropdowns = screen.getAllByText(/select billing status/i);
    expect(billingStatusDropdowns[0]).toBeInTheDocument();

    await user.click(billingStatusDropdowns[0]);
    await user.click(screen.getByText(/non billable/i));

    expect(screen.getAllByRole("button", { name: /save/i })[0]).toBeEnabled();
    await user.click(screen.getAllByRole("button", { name: /save/i })[0]);
    expect(authenticatedAxiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(authenticatedAxiosMock.history.post[0].data)).toEqual({
      project: null,
      role: 1,
      positions: [
        {
          skills: [23],
          utilization: 100,
          startDate: formatISO(setDate(new Date(), 14), { representation: "date" }),
          endDate: null,
          experienceRangeStart: 24,
          experienceRangeEnd: 29,
          isBillable: false,
        },
      ],
    });
    expect(screen.getAllByRole("button", { name: /save/i })[0]).toBeDisabled();
  });
});
