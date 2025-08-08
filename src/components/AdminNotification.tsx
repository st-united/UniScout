import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, List, Typography } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface NotificationItem {
  id: number;
  adminId: number;
  title: string;
  message: string;
  submissionId: number;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  // Assuming sender info will be part of the notification object in the future
  // sender?: {
  //   name: string;
  //   email: string;
  // };
}

// Interface for component props
interface AdminNotificationProps {
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

const AdminNotification: React.FC<AdminNotificationProps> = ({
  onNotificationClick,
  onMarkAllAsRead,
  className = '',
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard =
    location.pathname.startsWith('/manage') || location.pathname.startsWith('/dashboard');

  // --- API Functions ---

  // Fetches the list of all notifications from the API using Axios
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetches all notifications (read and unread)
      const response = await axios.get('/admin/notifications');
      // Mapping the API response to the NotificationItem interface
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetches the count of unread notifications from the API using Axios
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/admin/notifications/unread/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Marks a specific notification as read via Axios API call
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await axios.patch(`/admin/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Marks all notifications as read via a single API call
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch('/admin/notifications/read-all');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Use useEffect to fetch data when the component mounts
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // --- Event Handlers ---

  const handleNotificationItemClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      const success = await markNotificationAsRead(notification.id);
      if (success) {
        // Update local state to reflect the change
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => prev - 1);
      }
    }

    // navigate based on submissionId
    navigate(`/manage`, {
      state: {
        openPopup: true,
        requestId: notification.submissionId,
        popupType: 'detail',
      },
    });

    onNotificationClick?.(notification);
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllNotificationsAsRead();
    if (success) {
      // Re-fetch all notifications and the unread count to get the most up-to-date state
      fetchNotifications();
      fetchUnreadCount();
    }
    onMarkAllAsRead?.();
  };

  const notificationDropdown = (
    <div
      className='w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200'
      style={{ zIndex: 9999 }}
    >
      <div className='p-4 border-b border-gray-200 bg-white rounded-t-lg'>
        <div className='flex justify-between items-center'>
          <Text strong className='text-base text-gray-800'>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button
              type='link'
              size='small'
              onClick={handleMarkAllAsRead}
              className='text-orange-500 p-0 h-auto hover:text-orange-600'
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className='max-h-96 overflow-y-auto bg-white'>
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-50 transition-colors px-4 py-3 border-0 ${
                !item.isRead ? 'bg-blue-50' : 'bg-white'
              }`}
              onClick={() => handleNotificationItemClick(item)}
              style={{ paddingLeft: '10px' }}
            >
              <div className='w-full'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Text strong className='text-sm text-gray-800'>
                        {item.title}
                      </Text>
                      {!item.isRead && <div className='w-2 h-2 bg-blue-500 rounded-full'></div>}
                    </div>
                    <Text className='text-gray-600 text-sm mt-1 block'>{item.message}</Text>
                    <Text className='text-gray-500 text-xs mt-1 block'>{`From: Unknown`}</Text>
                    <Text className='text-gray-400 text-xs mt-1 block'>
                      {moment(item.createdAt).fromNow()}
                    </Text>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
          locale={{
            emptyText: (
              <div className='py-8 text-center text-gray-500 bg-white'>No notifications</div>
            ),
          }}
        />
      </div>

      {notifications.length > 3 && (
        <div className='p-3 border-t border-gray-200 text-center bg-white rounded-b-lg'>
          <Button type='link' className='text-orange-500 hover:text-orange-600'>
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`px-6  pb-0 border-b border-gray-200 ${className}`}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className={`flex items-center justify-end ${!isDashboard ? 'max-w-7xl mx-auto' : ''}`}>
        <Dropdown
          overlay={notificationDropdown}
          trigger={['click']}
          placement='bottomLeft'
          overlayStyle={{ zIndex: 9999 }}
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
        >
          <Button
            type='text'
            size='large'
            className='flex items-center justify-center w-12 h-12 rounded-full hover:bg-orange-100 transition-colors'
          >
            <Badge count={unreadCount} size='small' offset={[2, -2]}>
              <BellOutlined className='text-xl text-gray-600 hover:text-orange-500 transition-colors' />
            </Badge>
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminNotification;
