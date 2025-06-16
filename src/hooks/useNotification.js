/**
 * 通知系統 Hook
 */
export const useNotification = () => {
  const notify = (message, type = 'info', duration = 2000) => {
    if (typeof window !== 'undefined' && window.notify) {
      window.notify({ message, type, duration });
    }
  };

  return { notify };
};
