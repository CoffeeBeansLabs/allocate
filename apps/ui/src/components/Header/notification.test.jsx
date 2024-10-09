import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { BrowserRouter as Router } from "react-router-dom";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  getNotifications,
  markAllNotificationsAsRead,
  notificationRead,
} from "../../api/notifications";
import { useAuthStore } from "../../store/authStore";
import Notification from "./Notification";

// Mock the necessary modules
vi.mock("../../api/notifications");
vi.mock("../../store/authStore");
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("Notification Component", () => {
  const user = userEvent.setup();
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

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    const bellIcon = screen.getByAltText("Notification bell");
    await user.click(bellIcon);

    const notificationContainer = await screen.findByTestId("notification-container");
    expect(notificationContainer).toBeVisible();

    await user.click(bellIcon);

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
    await user.click(notificationMessage);

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

  test("should mark all notifications as read", async () => {
    getNotifications.mockResolvedValueOnce({ notifications: mockNotifications });
    markAllNotificationsAsRead.mockResolvedValueOnce({});
    getNotifications.mockResolvedValueOnce({ notifications: [] });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(1));

    const bellIcon = screen.getByAltText("Notification bell");
    await user.click(bellIcon);

    const markAsReadButton = screen.getByText("Mark as read");
    await user.click(markAsReadButton);

    await waitFor(() => expect(markAllNotificationsAsRead).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(2));

    expect(screen.getByText("No Notifications")).toBeInTheDocument();

    expect(
      screen.queryByText("John Doe - l1 allocated Alice to a project."),
    ).not.toBeInTheDocument();
  });

  test("should show error toast if marking all as read fails", async () => {
    getNotifications.mockResolvedValue({ notifications: mockNotifications });
    markAllNotificationsAsRead.mockRejectedValue({
      data: { detail: "Error marking as read" },
    });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(1));

    const bellIcon = screen.getByAltText("Notification bell");
    await user.click(bellIcon);

    const markAsReadButton = screen.getByText("Mark as read");
    await user.click(markAsReadButton);

    await waitFor(() => expect(markAllNotificationsAsRead).toHaveBeenCalledTimes(1));

    expect(toast.error).toHaveBeenCalledWith("Error marking as read");
  });
  // Add these test cases to your existing describe block

  test("should display correct message for date change notification", async () => {
    const dateChangeNotification = {
      id: 2,
      notificationType: "Allocation_Change_Request",
      sender: { fullNameWithExpBand: "Jane Doe - l2" },
      jsonData: {
        previousEndDate: "2023-06-30",
        requestsEndDate: "2023-07-31",
        requestsUser: "Bob",
        projectId: "456",
      },
      createdTime: "2023-06-26T10:11:12Z",
      receiver: { id: 1 },
      unseen: true,
    };

    getNotifications.mockResolvedValue({ notifications: [dateChangeNotification] });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    expect(
      screen.getByText(
        /Date change \(from 2023-06-30 to 2023-07-31\) request sent by Jane Doe - l2 for Bob./,
      ),
    ).toBeInTheDocument();
  });

  test("should display correct message for allocation change notification", async () => {
    const allocationChangeNotification = {
      id: 3,
      notificationType: "Allocation_Change_Request",
      sender: { fullNameWithExpBand: "Alice Smith - l3" },
      jsonData: {
        previousUtilization: "50%",
        requestsUtilization: "75%",
        requestsUser: "Charlie",
        projectId: "789",
      },
      createdTime: "2023-06-27T14:15:16Z",
      receiver: { id: 1 },
      unseen: true,
    };

    getNotifications.mockResolvedValue({ notifications: [allocationChangeNotification] });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    expect(
      screen.getByText(
        /Allocation change \(from 50% to 75%\) request sent by Alice Smith - l3 for Charlie./,
      ),
    ).toBeInTheDocument();
  });

  test("should display correct message for allocation and date change notification", async () => {
    const combinedChangeNotification = {
      id: 4,
      notificationType: "Allocation_Change_Request",
      sender: { fullNameWithExpBand: "Bob Johnson - l4" },
      jsonData: {
        previousUtilization: "60%",
        requestsUtilization: "80%",
        previousEndDate: "2023-08-31",
        requestsEndDate: "2023-09-30",
        requestsUser: "David",
        projectId: "101",
      },
      createdTime: "2023-06-28T18:19:20Z",
      receiver: { id: 1 },
      unseen: true,
    };

    getNotifications.mockResolvedValue({ notifications: [combinedChangeNotification] });

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    expect(
      screen.getByText(
        /Allocation change \(from 60% to 80%\) & date changed \(from 2023-08-31 to 2023-09-30\) request sent by Bob Johnson - l4 for David./,
      ),
    ).toBeInTheDocument();
  });

  test("should close notification list on mobile", async () => {
    getNotifications.mockResolvedValue({ notifications: mockNotifications });

    // Mock isMobile to return true
    vi.mock("../../common/common", () => ({
      isMobile: true,
    }));

    render(
      <Router>
        <Notification />
      </Router>,
    );

    await waitFor(() => expect(getNotifications).toHaveBeenCalled());

    const bellIcon = screen.getByAltText("Notification bell");
    await user.click(bellIcon);

    const closeIcon = screen.getByAltText("close icon");
    await user.click(closeIcon);

    const notificationContainer = screen.getByTestId("notification-container");
    expect(notificationContainer).not.toHaveClass("show");
  });
});
