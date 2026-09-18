import { useEffect, useState } from "react";
import API from "./api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await API.get(
        "/api/farmer/notifications"
      );

      const data = response.data;

      setNotifications(
        Array.isArray(data)
          ? data
          : data?.notifications || []
      );
    } catch (err) {
      console.error(
        "Notification loading failed:",
        err
      );
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      await API.patch(
        `/api/farmer/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: 1,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Unable to mark notification as read:",
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);

      await Promise.all(
        notifications
          .filter(
            (notification) =>
              !notification.is_read
          )
          .map((notification) =>
            API.patch(
              `/api/farmer/notifications/${notification.id}/read`
            )
          )
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );
    } catch (err) {
      console.error(
        "Unable to mark notifications as read:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.is_read
  ).length;

  return (
    <div className="notification-wrapper">

      <button
        className="notification-button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <span className="notification-icon">
          ◉
        </span>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">

          <div className="notification-panel-header">

            <div>
              <span>
                FARMER INTELLIGENCE
              </span>

              <h3>
                Notifications
              </h3>
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-read-button"
                onClick={markAllAsRead}
                disabled={loading}
              >
                Mark all read
              </button>
            )}

          </div>

          <div className="notification-list">

            {notifications.length === 0 ? (
              <div className="notification-empty">

                <div className="notification-empty-icon">
                  ✓
                </div>

                <strong>
                  You're all caught up.
                </strong>

                <p>
                  Procurement updates and important
                  alerts will appear here.
                </p>

              </div>
            ) : (
              notifications.map(
                (notification) => (

                  <button
                    className={
                      notification.is_read
                        ? "notification-item read"
                        : "notification-item unread"
                    }
                    key={notification.id}
                    onClick={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                  >

                    <div className="notification-item-top">

                      <span
                        className={`notification-type ${String(
                          notification.notification_type ||
                            "GENERAL"
                        ).toLowerCase()}`}
                      >
                        {notification.notification_type ||
                          "UPDATE"}
                      </span>

                      {!notification.is_read && (
                        <span className="notification-new">
                          NEW
                        </span>
                      )}

                    </div>

                    <strong>
                      {notification.title ||
                        "Procurement Update"}
                    </strong>

                    <p>
                      {notification.message ||
                        "You have a new procurement update."}
                    </p>

                    <small>
                      {notification.created_at ||
                        ""}
                    </small>

                  </button>

                )
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;