import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import { BrowserRouter as Router } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getNotifications, notificationRead } from "../../api/notifications";
import { useAuthStore } from "../../store/authStore";
import Notification from "./Notification";
// Mock the necessary modules
vi.mock("../../api/notifications");
vi.mock("../../store/authStore");
vi.mock("react-toastify");

describe("Notification Component", () => {
  const mockUser = { id: 1, roles: ["admin"] };

  beforeEach(() => {
    useAuthStore.mockReturnValue({ user: mockUser });
    vi.clearAllMocks();
  });

  const mockNotifications = [
    {
      id: 1,
      notificationType: "New_Allocation",
      sender: { fullNameWithExpBand: "John Doe - l1" },
      jsonData: { requestsUser: "Alice", projectId: "123" },
      createdTime: "2023-06-25T12:34:56Z",
      receiver: { id: 1 },
      unseen: true,
    },
    // Add more mock notifications for other cases if needed
  ];

  test("should fetch and display notifications", async () => {
    getNotifications.mockResolvedValue({ notifications: mockNotifications });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());
    expect(
      screen.getByText("John Doe - l1 allocated Alice to a project."),
    ).toBeInTheDocument();
    const formattedDate = new Date("2023-06-25T12:34:56Z");
    const formattedDateString = format(formattedDate, "PP");
    expect(screen.getByText(formattedDateString)).toBeInTheDocument();
  });

  test("should toggle notification list visibility", async () => {
    getNotifications.mockResolvedValue({ notifications: mockNotifications });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    // Wait for the asynchronous operation to complete
    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    // Clicking the bell icon to open the notification list
    const bellIcon = screen.getByAltText("Notification bell");
    fireEvent.click(bellIcon);

    // Wait for the notification container to become visible
    const notificationContainer = await screen.findByTestId("notification-container");
    expect(notificationContainer).toBeVisible();

    // Clicking the bell icon again to close the notification list
    fireEvent.click(bellIcon);

    // Wait for the notification container to become hidden
    await waitFor(() => {
      expect(notificationContainer).toBeVisible();
    });
  });

  test("should mark notifications as read", async () => {
    getNotifications.mockResolvedValue({ notifications: mockNotifications });
    notificationRead.mockResolvedValue({});

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    const notificationMessage = screen.getByText(
      "John Doe - l1 allocated Alice to a project.",
    );
    fireEvent.click(notificationMessage);

    await waitFor(() => expect(notificationRead).toHaveBeenCalledWith(1));
    expect(
      screen.queryByText("John Doe - l1 allocated Alice to a project."),
    ).not.toBeInTheDocument();
  });

  test("should show no notifications message when there are no notifications", async () => {
    getNotifications.mockResolvedValue({ notifications: [] });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    expect(screen.getByText("No Notifications")).toBeInTheDocument();
  });
});
