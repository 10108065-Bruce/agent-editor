import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * 圖標上傳服務 - 處理與圖標上傳相關的 API 請求
 */
export class IconUploadService {
  constructor() {
    this.cache = {}; // 緩存上傳過的圖標
  }

  /**
   * 上傳圖標文件到服務器
   * @param {File} file - 要上傳的文件對象
   * @returns {Promise<Object>} - 包含上傳結果的 Promise，成功時返回 {success: true, url: "圖標URL"}
   */
  async uploadIcon(file) {
    if (!file) {
      throw new Error('未提供文件');
    }

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      throw new Error('僅支持圖片文件');
    }

    try {
      console.log(`開始上傳圖標: ${file.name}`);

      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', file); // 使用正確的欄位名稱 'file'

      // 發送 POST 請求
      const options = tokenService.createAuthHeader({
        method: 'POST',
        headers: {
          accept: 'application/json'
          // 注意：不要設置 'Content-Type': 'multipart/form-data'，
          // fetch 會自動設置正確的 boundary
        },
        body: formData
      });

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/icons/`
      );
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`上傳失敗: ${response.status} ${response.statusText}`);
      }

      // 解析 API 回傳的資料
      const data = await response.json();
      console.log('圖標上傳成功:', data);

      if (!data.url) {
        throw new Error('API 未回傳圖標 URL');
      }

      // 將 URL 加入緩存
      this.cache[file.name] = data.url;

      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('上傳圖標時發生錯誤:', error);
      return {
        success: false,
        error: error.message || '上傳圖標失敗',
        details: error
      };
    }
  }

  /**
   * 檢查圖標 URL 是否有效
   * @param {string} iconValue - 圖標值，可能是 URL 或預設圖標名稱
   * @returns {boolean} - 如果是有效的圖標 URL 返回 true
   */
  isIconUrl(iconValue) {
    return (
      typeof iconValue === 'string' &&
      (iconValue.startsWith('http://') || iconValue.startsWith('https://'))
    );
  }

  /**
   * 從緩存中獲取圖標 URL
   * @param {string} fileName - 文件名
   * @returns {string|null} - 如果存在則返回 URL，否則返回 null
   */
  getCachedIconUrl(fileName) {
    return this.cache[fileName] || null;
  }
}
