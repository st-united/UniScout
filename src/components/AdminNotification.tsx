import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, List, Typography } from 'antd';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Text } = Typography;

// Interface for notification items
interface NotificationItem {
  id: number;
  type: 'join_request';
  title: string;
  description: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
  requestId: string; // <-- NEW FIELD
  redirectTo: string;
}

// Interface for component props
interface AdminNotificationProps {
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

// Mock notification data
const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    type: 'join_request',
    title: 'New Update Information',
    description: 'MIT University wants to add subjects.',
    sender: 'admin@mit.edu',
    timestamp: '2 minutes ago',
    isRead: false,
    requestId: '1',
    redirectTo: '/manage',
  },
  {
    id: 2,
    type: 'join_request',
    title: 'New University',
    description: 'Ngoc Nhi added Harvard University.',
    sender: 'admin@harvard.edu',
    timestamp: '1 hour ago',
    isRead: false,
    requestId: '2',
    redirectTo: '/manage',
  },
  {
    id: 3,
    type: 'join_request',
    title: 'New University',
    description: 'Ngoc Nhi added Oxford University.',
    sender: 'admin@oxford.edu',
    timestamp: '3 hours ago',
    isRead: true,
    requestId: '3',
    redirectTo: '/manage',
  },
];

const AdminNotification: React.FC<AdminNotificationProps> = ({
  onNotificationClick,
  onMarkAllAsRead,
  className = '',
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard =
    location.pathname.startsWith('/manage') || location.pathname.startsWith('/dashboard');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationItemClick = (notification: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
    );

    // Navigate and pass state to open popup
    navigate(notification.redirectTo, {
      state: {
        openPopup: true,
        requestId: notification.requestId,
        popupType: 'detail', // or 'edit' if needed
      },
    });

    onNotificationClick?.(notification);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
                    <Text className='text-gray-600 text-sm mt-1 block'>{item.description}</Text>
                    <Text className='text-gray-400 text-xs mt-1 block'>{item.timestamp}</Text>
                    <Text className='text-gray-500 text-xs mt-1 block'>{`From: ${item.sender}`}</Text>
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
      className={`px-6 pt-4 pb-0 border-b border-gray-200 ${className}`}
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
