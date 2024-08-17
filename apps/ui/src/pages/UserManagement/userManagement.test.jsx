import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { BrowserRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../api/API";
import { CONFIRMATION_MSG } from "../../constants/common";
import { useAuthStore } from "../../store/authStore";
import UserManagement from ".";
import ChangeAccess from "./ChangeAccess";
import NewUserForm from "./NewUserForm";

const originalWindowConfirm = window.confirm;
const mockUserGroups = {
  groups: [
    {
      id: 1,
      name: "super_admin",
    },
    {
      id: 2,
      name: "admin",
    },
    {
      id: 3,
      name: "inventory_manager",
    },
  ],
};

const mockUserManagement = {
  users: [
    {
      id: 1,
      employeeId: "12",
      groupId: 2,
      groupName: "admin",
      userName: "Test user",
    },
  ],
};

const mockOnChange = vi.fn();
const mockOnCancel = vi.fn();
const mockOnSave = vi.fn();

beforeAll(() => {
  window.confirm = vi.fn(() => true);
  const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
});

afterAll(() => {
  window.confirm = originalWindowConfirm;
  vi.unstubAllGlobals();
});

describe("User Management", () => {
  useAuthStore.setState({ user: { roles: ["super_admin"] } });
  const user = userEvent.setup();
  const authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render user management", async () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: /user management/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /plus icon add new member add new member/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("row", {
        name: /sr. no. employee name employee id access type/i,
      }),
    ).toBeInTheDocument();
  });

  test("should open change access modal", async () => {
    authenticatedAxiosMock.onGet("/user/get-user-groups/").reply(200, mockUserGroups);
    authenticatedAxiosMock
      .onGet("/user/user-management-view/")
      .reply(200, mockUserManagement);
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>,
    );

    const dropdownBtns = await screen.findAllByAltText(/click to toggle dropdown menu/i);
    await user.click(dropdownBtns[0]);
    await user.click(await screen.findByText(/inventory manager/i));
    expect(
      await screen.findByRole("heading", { name: /change access/i }),
    ).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: /not yet/i }));
    expect(
      screen.queryByRole("button", { name: /yes, change/i }),
    ).not.toBeInTheDocument();
  });

  test("should update access of a user", async () => {
    authenticatedAxiosMock.onPut("/user/edit-user-group/").reply(200, mockUserGroups);
    render(
      <ChangeAccess
        userChangeValue={{
          role: { value: 1, label: "Admin" },
          user: { ...mockUserManagement.users[0] },
        }}
        onChange={mockOnChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /yes, change/i }));
    expect(mockOnChange).toHaveBeenCalledOnce();
    expect(authenticatedAxiosMock.history.put).toHaveLength(1);
    expect(authenticatedAxiosMock.history.put[0].data).toBe(
      JSON.stringify([{ groupId: 1, userId: 1 }]),
    );
  });

  test("should cancel access updation", async () => {
    render(
      <ChangeAccess
        userChangeValue={{
          role: { value: "admin", label: "Admin" },
          user: { ...mockUserManagement.users[0] },
        }}
        onCancel={mockOnCancel}
      />,
    );
    await user.click(await screen.findByRole("button", { name: /not yet/i }));
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  test("should open add new member modal", async () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>,
    );

    await user.click(
      await screen.findByRole("button", {
        name: /plus icon add new member add new member/i,
      }),
    );
    expect(
      await screen.findByRole("heading", { name: /add new member/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryAllByRole("row", {
        name: /sr. no. employee name employee id access type/i,
      }),
    ).toHaveLength(2);
  });

  test("should alert on cancel", async () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>,
    );

    await user.click(
      await screen.findByRole("button", {
        name: /plus icon add new member add new member/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(window.confirm).toHaveBeenCalledWith(CONFIRMATION_MSG);
    expect(
      screen.queryByRole("heading", { name: /add new member/i }),
    ).not.toBeInTheDocument();
  });

  test("should alert on modal close", async () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>,
    );

    await user.click(
      await screen.findByRole("button", {
        name: /plus icon add new member add new member/i,
      }),
    );
    await user.click(screen.getByRole("img", { name: /close icon/i }));
    expect(window.confirm).toHaveBeenCalledWith(CONFIRMATION_MSG);
    expect(
      screen.queryByRole("heading", { name: /add new member/i }),
    ).not.toBeInTheDocument();
  });

  test("should save new user member", async () => {
    authenticatedAxiosMock.onGet("/user/get-user-groups/").reply(200, mockUserGroups);
    authenticatedAxiosMock
      .onGet("/user/user-management-view/")
      .reply(200, mockUserManagement);
    authenticatedAxiosMock.onPut("/user/edit-user-group/").reply(200, mockUserGroups);
    render(<NewUserForm onSave={mockOnSave} />);

    await user.type(screen.getByPlaceholderText(/search for people/i), "t");
    await user.click(await screen.findByText(/test user/i));
    expect(screen.getByText(/12/i)).toBeInTheDocument();
    await user.click(screen.getByAltText(/click to toggle dropdown menu/i));
    await user.click(screen.getByText(/super admin/i));
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(authenticatedAxiosMock.history.put).toHaveLength(1);
    expect(authenticatedAxiosMock.history.put[0].data).toBe(
      JSON.stringify([{ userId: 1, groupId: 1 }]),
    );
    expect(mockOnSave).toHaveBeenCalledOnce();
  });
});
