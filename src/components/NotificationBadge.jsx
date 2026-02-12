import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '../services/notification.services';

function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notification count on component mount
    fetchUnreadCount();

    // Set up interval to periodically check for new notifications
    const intervalId = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      if (response && response.data && response.data.data) {
        setUnreadCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  return unreadCount > 0 ? (
    <div className="bg-primary text-white text-xs font-bold rounded-full min-h-5 min-w-5 flex items-center justify-center px-1.5 border border-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  ) : null;
}

export default NotificationBadge;