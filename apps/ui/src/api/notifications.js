import AuthenticatedAPI from "./API";

export const getNotifications = async () => {
  try {
    const response = await AuthenticatedAPI.get("/projects/notification/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const notificationRead = async (notificationId) => {
  try {
    const response = await AuthenticatedAPI.patch(
      `/projects/notification/${notificationId}/read_notification/`,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await AuthenticatedAPI.patch(
      `/projects/notification/mark-all-read/`,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
