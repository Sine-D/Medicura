import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notifications - in a real app, these would come from an API
  const sampleNotifications = [
    {
      id: 1,
      type: 'invoice',
      title: 'New Invoice Created',
      message: 'Invoice #68ddff5571cebb19b73e5fb2 has been created successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      priority: 'medium',
      actionUrl: '/supplier-dashboard?tab=invoices'
    },
    {
      id: 2,
      type: 'request',
      title: 'Request Approved',
      message: 'Your request for Vitamin C has been approved by the inventory manager',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      priority: 'high',
      actionUrl: '/supplier-dashboard?tab=requests'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      priority: 'low',
      actionUrl: null
    },
    {
      id: 4,
      type: 'invoice',
      title: 'Payment Received',
      message: 'Payment of $625.00 has been received for invoice #abc123',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      priority: 'high',
      actionUrl: '/supplier-dashboard?tab=invoices'
    },
    {
      id: 5,
      type: 'request',
      title: 'Low Stock Alert',
      message: 'Panadol stock is running low. Only 5 units remaining.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      priority: 'medium',
      actionUrl: '/supplier-dashboard?tab=inventory'
    }
  ];

  // Initialize notifications
  useEffect(() => {
    setNotifications(sampleNotifications);
    const unread = sampleNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, []);

  // Add new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remove notification
  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => n.timestamp > oneDayAgo);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
