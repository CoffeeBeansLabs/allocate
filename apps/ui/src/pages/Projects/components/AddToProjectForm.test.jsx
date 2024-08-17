import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { formatISO, setDate } from "date-fns";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../../api/API";
import { ROLES } from "../../../constants/roles";
import { useAuthStore } from "../../../store/authStore";
import AddToProjectForm from "./AddToProjectForm";

describe("Add to Project Form", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render form", async () => {
    const mockUser = {
      id: 1,
      fullNameWithExpBand: "Test User",
      allocation: [{ utilization: 30 }],
    };
    const mockCriteria = { utilization: 100 };
    const params = { positionId: "12", projectId: "1" };
    render(
      <AddToProjectForm
        user={mockUser}
        criteria={mockCriteria}
        onSubmit={mockOnSubmit}
        params={params}
      />,
    );
    expect(await screen.findByText(/test user/i)).toBeInTheDocument();
    expect(screen.queryByText(/start date/i)).toBeInTheDocument();
    expect(screen.queryByText(/allocation till/i)).toBeInTheDocument();
    expect(screen.queryByText(/kt period in days/i)).toBeInTheDocument();
  });

  test("should request allocation", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    authenticatedAxiosMock.onPost("/projects/allocation-request/").reply(200);

    const mockUser = {
      id: 1,
      fullNameWithExpBand: "Test User",
      allocation: [
        {
          utilization: 30,
          positionId: 12,
          projectName: "Project A",
          positionRole: { name: "Role A" },
        },
      ],
    };
    const mockCriteria = { utilization: 100, projectName: "Project A", role: "Role A" };
    const params = { positionId: "12", projectId: "1" };

    render(
      <AddToProjectForm
        user={mockUser}
        criteria={mockCriteria}
        onSubmit={mockOnSubmit}
        params={params}
      />,
    );
    await user.click(await screen.findByPlaceholderText(/allocation start date/i));
    await user.click(screen.getByText(/13/i));

    await user.type(screen.getAllByPlaceholderText(/allocation/i)[2], "50");

    const requestTalentBtn = screen.getByRole("button", { name: /request talent/i });
    await user.click(requestTalentBtn);

    expect(authenticatedAxiosMock.history.post).toHaveLength(1);
    expect(authenticatedAxiosMock.history.post[0].url).toBe(
      "/projects/allocation-request/",
    );

    const requestData = JSON.parse(authenticatedAxiosMock.history.post[0].data);
    requestData.utilization = parseInt(requestData.utilization); // Convert utilization to number
    requestData.startDate = formatISO(setDate(new Date(), 13), {
      representation: "date",
    });

    expect(requestData).toEqual({
      user: 1,
      utilization: 50,
      startDate: requestData.startDate,
      endDate: null,
      ktPeriod: 0,
      position: "12",
    });
    expect(mockOnSubmit).toHaveBeenCalledOnce();
  });

  test("should create allocation", async () => {
    useAuthStore.setState({ user: { roles: ["admin"] } });
    authenticatedAxiosMock.onPost("/projects/allocation/").reply(200);

    const mockUser = {
      id: 1,
      fullNameWithExpBand: "Test User",
      allocation: [
        {
          utilization: 30,
          positionId: 12,
          projectName: "Project A",
          positionRole: { name: "Role A" },
        },
      ],
    };
    const mockCriteria = { utilization: 100, projectName: "Project A", role: "Role A" };
    const params = { positionId: "12", projectId: "1" };

    render(
      <AddToProjectForm
        user={mockUser}
        criteria={mockCriteria}
        onSubmit={mockOnSubmit}
        params={params}
      />,
    );

    await userEvent.click(await screen.findByPlaceholderText(/allocation start date/i));
    await userEvent.click(screen.getByText(/13/i));
    await userEvent.type(screen.getAllByPlaceholderText(/allocation/i)[2], "50");

    const addTalentBtn = screen.getByRole("button", { name: /add talent/i });
    await userEvent.click(addTalentBtn);

    expect(authenticatedAxiosMock.history.post).toHaveLength(1);
    expect(authenticatedAxiosMock.history.post[0].url).toBe("/projects/allocation/");

    const requestData = JSON.parse(authenticatedAxiosMock.history.post[0].data);
    requestData.utilization = parseInt(requestData.utilization);
    requestData.startDate = formatISO(setDate(new Date(), 13), {
      representation: "date",
    });

    expect(requestData).toEqual({
      user: 1,
      utilization: 50,
      startDate: requestData.startDate,
      endDate: null,
      position: "12",
      ktPeriod: 0,
    });
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  test("should validate allocation start and end dates", async () => {
    useAuthStore.setState({ user: { roles: ["admin"] } });

    const mockUser = {
      id: 1,
      fullNameWithExpBand: "Test User",
      allocation: [
        {
          utilization: 30,
          positionId: 12,
          projectName: "Project A",
          positionRole: { name: "Role A" },
        },
      ],
    };
    const mockCriteria = { utilization: 100, projectName: "Project A", role: "Role A" };

    render(
      <AddToProjectForm
        user={mockUser}
        criteria={mockCriteria}
        onSubmit={mockOnSubmit}
        params={{ positionId: "12" }}
      />,
    );

    await userEvent.click(await screen.findByPlaceholderText(/allocation start date/i));
    await userEvent.click(screen.getByText(/17/i));

    await userEvent.click(await screen.findByPlaceholderText(/allocation end date/i));
    await userEvent.click(screen.getByText(/13/i));

    await userEvent.click(screen.getByRole("button", { name: /add talent/i }));

    expect(screen.queryByText(/end date must be after start date/i)).toBeInTheDocument();

    const closeButton = screen.getAllByRole("img", { name: /click to close calendar/i });
    await userEvent.click(closeButton[1]);
    expect(
      screen.queryByText(/end date must be after start date/i),
    ).not.toBeInTheDocument();

    await userEvent.click(closeButton[0]);
    expect(screen.queryByText(/please select a start date./i)).toBeInTheDocument();
  });
});
