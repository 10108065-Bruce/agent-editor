/**
 * Date Time Utilities
 * 專門用於將 ISO 8601 格式的 UTC 時間轉換為純數字格式的本地時間
 */

/**
 * 將 ISO 時間字串轉換為純數字格式的本地時間
 * 格式: YYYY-MM-DD HH:mm:ss (24小時制，不受地區語言影響)
 * 
 * @param {string} isoString - ISO 8601 格式的時間字串 (例如: "2025-10-09T05:31:17.909000Z")
 * @returns {string} 純數字格式的本地時間 (例如: "2025-10-09 13:31:17")
 * 
 * @example
 * // 台灣用戶 (UTC+8)
 * formatISOToNumeric("2025-10-09T05:31:17.909000Z")
 * // 返回: "2025-10-09 13:31:17"
 * 
 * @example
 * // 美國用戶 (UTC-5)
 * formatISOToNumeric("2025-10-09T05:31:17.909000Z")
 * // 返回: "2025-10-09 00:31:17"
 */
export const formatISOToNumeric = (isoString) => {
  if (!isoString) return 'N/A';
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid ISO string');
    }

    // 獲取本地時間的各個部分
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 組合成純數字格式: YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting ISO to numeric:', error);
    // Fallback: 簡單移除毫秒和 'Z'
    return isoString.replace('T', ' ').split('.')[0];
  }
};

// 預設匯出
export default {
  formatISOToNumeric,
};

