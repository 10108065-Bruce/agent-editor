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
    <div className=''>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`absolute top-8 left-1/2 rounded-lg transform -translate-x-1/2 px-4 py-2 z-20 text-sm ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-200'
              : notification.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
