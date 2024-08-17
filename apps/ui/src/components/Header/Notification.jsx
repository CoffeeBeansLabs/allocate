import { Text } from "@allocate-core/ui-components";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import { useInterval } from "@allocate-core/util-hooks";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import BellIcon from "/icons/bellIcon.svg";
import CloseIconBlack from "/icons/closeIconBlack.svg";

import { getNotifications, notificationRead } from "../../api/notifications";
import { isMobile } from "../../common/common";
import { SCOPES } from "../../constants/roles";
import { useAuthStore } from "../../store/authStore";
import { getPermission } from "../PermissionGate";
import styles from "./header.module.css";

const NOTIFICATION_INTERVAL = 1000 * 60;

const requestNotificationMessage = (notification, messageWording) => {
  const {
    previousUtilization,
    requestsUtilization,
    previousEndDate,
    requestsEndDate,
    requestsUser,
  } = notification.jsonData;

  if (!requestsUtilization)
    return `Date change (from ${previousEndDate} to ${requestsEndDate}) ${messageWording} by ${notification.sender?.fullName} for ${requestsUser}.`;

  if (!requestsEndDate)
    return `Allocation change (from ${previousUtilization} to ${requestsUtilization}) ${messageWording} by ${notification.sender?.fullName} for ${requestsUser}.`;

  return `Allocation change (from ${previousUtilization} to ${requestsUtilization}) & date changed (from ${previousEndDate} to ${requestsEndDate}) ${messageWording} by ${notification.sender?.fullName} for ${requestsUser}.`;
};

const formatNotifications = (notifications, userId) => {
  const formattedList = notifications
    .filter((notif) => notif.receiver?.id === userId)
    .sort((a, b) => b.unseen - a.unseen)
    .map((notifs) => {
      let messageForType;
      switch (notifs.notificationType) {
        case "New_Allocation":
          messageForType = `${notifs.sender?.fullNameWithExpBand} allocated ${notifs.jsonData?.requestsUser} to a project.`;
          break;
        case "Allocation_Change":
          messageForType = requestNotificationMessage(notifs, "made");
          break;
        case "Delete_Allocation":
          messageForType = `${notifs.sender?.fullNameWithExpBand} removed ${notifs.jsonData?.requestsUser} from a project.`;
          break;
        case "New_Allocation_Request":
          messageForType = `New Project request sent by ${notifs.sender?.fullNameWithExpBand} for ${notifs.jsonData?.requestsUser}.`;
          break;
        case "Approved_Allocation_Request":
          messageForType = `Allocation request approved by ${notifs.sender?.fullNameWithExpBand} for ${notifs.jsonData?.requestsUser}.`;
          break;
        case "Cancel_Allocation_Request":
          messageForType = `Allocation request denied by ${notifs.sender?.fullNameWithExpBand} for ${notifs.jsonData?.requestsUser}.`;
          break;
        case "Allocation_Change_Request":
          messageForType = requestNotificationMessage(notifs, "request sent");
          break;
        case "Approved_Allocation_Change_Request":
          messageForType = requestNotificationMessage(notifs, "request approved");
          break;
        case "Cancel_Allocation_Change_Request":
          messageForType = requestNotificationMessage(notifs, "request denied");
          break;
        default:
          break;
      }

      return {
        ...notifs,
        message: messageForType,
        date: format(new Date(notifs.createdTime), "PP"),
        linkTo: `/projects/timeline/${notifs.jsonData?.projectId}/`,
      };
    });

  return formattedList;
};

const Notification = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationList, setNotificationList] = useState([]);

  const notifRef = useRef(null);

  useHandleClickOutside({
    onOutSideClick: () => {
      setIsNotificationOpen(false);
    },
    wrapperRef: notifRef,
  });

  const auth = useAuthStore();
  const hasPermissionToViewNotifs = getPermission([SCOPES.canViewNotifications]);

  const fetchNotification = () => {
    if (hasPermissionToViewNotifs)
      getNotifications()
        .then((response) =>
          setNotificationList(formatNotifications(response.notifications, auth.user.id)),
        )
        .catch((errResponse) => toast.error(errResponse?.data?.detail));
  };

  useEffect(fetchNotification, []);
  useInterval(fetchNotification, NOTIFICATION_INTERVAL);

  const handleNotificationRead = (id) => {
    notificationRead(id)
      .then(() => {
        // Remove the notification from the list after marking it as read
        setNotificationList((prevList) => prevList.filter((notif) => notif.id !== id));
      })
      .catch((errResponse) => toast.error(errResponse?.data.detail));
  };

  return (
    <div ref={notifRef}>
      <div className={styles.notificationBell}>
        <div className={styles.notificationCount}>
          <Text size="b3" fontWeight="semibold" className="px-0 py-0 mx-0">
            {notificationList?.filter((notif) => notif.unseen).length}
          </Text>
        </div>
        <img
          src={BellIcon}
          alt="Notification bell"
          className={styles.bellIcon}
          onClick={() => setIsNotificationOpen((prevState) => !prevState)}
          role="presentation"
        />
      </div>
      <div
        data-testid="notification-container"
        className={`card-1 ${styles.notificationContainer} ${
          isNotificationOpen ? "show" : "hide"
        }`}
      >
        {isMobile && (
          <img
            src={CloseIconBlack}
            alt="close icon"
            className={`ml-auto ${styles.closeIcon}`}
            role="presentation"
            onClick={() => setIsNotificationOpen(false)}
          />
        )}
        {notificationList?.length > 0 ? (
          notificationList.map((item) => (
            <Link reloadDocument to={item.linkTo} key={item.id}>
              <div
                className={`flex-col ${styles.messageContainer} ${
                  item.unseen ? styles.unseen : styles.seen
                }`}
                role="presentation"
                onClick={() => handleNotificationRead(item.id)}
              >
                <Text size="b2" fontWeight="medium">
                  {item.message}
                </Text>
                <Text size="b3" fontWeight="regular">
                  {item.date}
                </Text>
              </div>
            </Link>
          ))
        ) : (
          <Text size="b2" fontWeight="regular" className="flex-center">
            No Notifications
          </Text>
        )}
      </div>
    </div>
  );
};

export default Notification;
