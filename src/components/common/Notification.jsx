// src/components/common/Notification.jsx
import React, { useEffect, useState } from 'react';

export class NotificationService {
  static listeners = [];

  static notify(message, type = 'info', duration = 3000) {
    this.listeners.forEach((listener) => listener(message, type, duration));
  }

  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

// 全域通知函數
if (typeof window !== 'undefined') {
  window.notify = (options) => {
    if (typeof options === 'string') {
      NotificationService.notify(options);
    } else {
      const { message, type, duration } = options;
      NotificationService.notify(message, type, duration);
    }
  };
}

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // 訂閱通知服務
    const unsubscribe = NotificationService.subscribe(
      (message, type, duration) => {
        const id = Date.now();

        // 添加新通知
        setNotifications((prev) => [...prev, { id, message, type, duration }]);

        // 設置定時器自動移除通知
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
          );
        }, duration);
      }
    );

    return () => unsubscribe();
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-50 flex flex-col gap-2'>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`px-4 py-2 rounded-md shadow-md text-white transition-all duration-300 max-w-sm ${
            notification.type === 'error'
              ? 'bg-red-500'
              : notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
