import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Check,
  Mail,
  Package,
  Calendar,
  Clock,
  AlertCircle,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Heading';
import Button from '../../components/Button';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notification.services';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import { paths } from '../../routes/paths';

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch notifications from API
  const fetchNotifications = async (page = 0, search = searchTerm) => {
    setLoading(true);
    try {
      const response = await getNotifications(page, 10, search);

      if (response && response.data.data) {
        setNotifications(response.data.data.items || []);
        setPagination({
          page: response.data.data.page || 0,
          limit: response.data.data.limit || 10,
          total: response.data.data.total || 0,
          totalPages: response.data.data.totalPages || 0
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchNotifications(0, searchValue);
    }, 500),
    []
  );

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    // Check if the argument is an event or a direct value
    const value = typeof e === 'object' && e.target ? e.target.value : e;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notification) => ({ ...notification, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Handle notification click with redirection
  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Handle redirection based on notification type
    if (notification.notificationType === 'ORDER_PLACED' && notification.orderId) {
      // Store the order ID in localStorage for the orders page to use
      localStorage.setItem('openOrderId', notification.orderId);
      
      // Navigate to orders page
      navigate(paths.orders);
    } else if (notification.notificationType === 'CREDIT_TERMS_REQUESTED') {
      // Navigate to verify-restaurants page
      navigate(paths.restaurants);
    }
  };

  // Filter notifications
  const filterNotifications = (filter) => {
    setActiveFilter(filter);
  };

  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(notification => !notification.isRead);
      case 'orders':
        return notifications.filter(notification => notification.notificationType === 'ORDER_PLACED');
      // case 'deliveries':
      //   return notifications.filter(notification => notification.notificationType === 'ORDER_DELIVERED');
      // case 'messages':
      //   return notifications.filter(notification => notification.notificationType === 'MESSAGE');
      default:
        return notifications;
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return timestamp;
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchNotifications(newPage);
    }
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
        return <ShoppingCart className="w-5 h-5 text-primary" />;
      case 'ORDER_DELIVERED':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'MESSAGE':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'SCHEDULE':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'CREDIT_TERMS_REQUESTED':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format notification message by replacing placeholders
  const formatMessage = (notification) => {
    if (!notification.body) return '';
    
    let message = notification.body;
    
    // Replace common placeholders
    if (notification.orderNumber) {
      message = message.replace(/{{orderNumber}}/g, notification.orderNumber);
    }
    
    return message;
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    fetchNotifications(0, '');
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Notifications"
        buttonText="Mark all as Read"
        onButtonClick={markAllAsRead}
        showSearch={true}
        searchPlaceholder="Search notifications..."
        onSearch={handleSearchChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? "primary" : "secondary"}
            size="sm"
            className={activeFilter === 'all' ? "px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg" : ""}
            onClick={() => filterNotifications('all')}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === 'unread' ? "primary" : "secondary"}
            onClick={() => filterNotifications('unread')}
          >
            Unread
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === 'orders' ? "primary" : "secondary"}
            onClick={() => filterNotifications('orders')}
          >
            Orders
          </Button>
          {/* <Button 
            size="sm" 
            variant={activeFilter === 'deliveries' ? "primary" : "secondary"}
            onClick={() => filterNotifications('deliveries')}
          >
            Deliveries
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === 'messages' ? "primary" : "secondary"}
            onClick={() => filterNotifications('messages')}
          >
            Messages
          </Button> */}
          {searchTerm && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={clearSearch}
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm overflow-y-auto flex-1 flex flex-col">
          {loading ? (
            <div className="py-16 text-center flex-grow flex items-center justify-center">
              <p className="text-text-primary">Loading notifications...</p>
            </div>
          ) : getFilteredNotifications().length > 0 ? (
            <>
              <div className="max-h-full overflow-y-auto flex-grow">
                {getFilteredNotifications().map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 flex items-start gap-3 ${
                      index !== getFilteredNotifications().length - 1
                        ? 'border-b border-border'
                        : ''
                    } ${!notification.isRead ? 'bg-primary-light/10' : 'bg-white'}`}
                  >
                    {/* Notification icon */}
                    <div className="w-10 h-10 border border-border rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getIcon(notification.notificationType)}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`font-semibold ${!notification.isRead ? 'text-primary' : 'text-text-primary'}`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-secondary-button-text text-sm mt-1">
                            {formatMessage(notification)}
                          </p>
                          {notification.items && notification.items.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Items: </span>
                              {notification.items.map((item, i) => (
                                <span key={i}>
                                  {item.quantity} x {item.name}
                                  {i < notification.items.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-text-placeholder mt-2 block">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border flex justify-center items-center gap-4">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className={`p-2 rounded-full ${pagination.page === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm">
                    Page {pagination.page + 1} of {pagination.totalPages}
                  </span>
                  
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages - 1}
                    className={`p-2 rounded-full ${pagination.page === pagination.totalPages - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center flex-grow flex flex-col items-center justify-center">
              <div className="flex justify-center mb-4">
                <Bell className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-text-primary">
                No notifications
              </h3>
              <p className="text-text-placeholder text-sm mt-1">
                You are all caught up! Check back later for new notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
