// src/services/FileIOService.js

/**
 * 用於處理本地檔案作業（儲存和載入）的服務
 */
export default class FileIOService {
  /**
   * 通過建立下載來將資料儲存到本地檔案
   *
   * @param {Object} data - 要儲存的資料
   * @param {string} filename - 建議的檔案名稱（預設：flow.json）
   * @returns {Promise} - 當檔案準備下載時解析
   */
  static saveToFile(data, filename = 'flow.json') {
    return new Promise((resolve, reject) => {
      try {
        // 將資料轉換為 JSON 字串
        const jsonString = JSON.stringify(data, null, 2);

        // 建立含有資料的 Blob
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 為 Blob 建立 URL
        const url = URL.createObjectURL(blob);

        // 建立臨時錨點元素
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // 附加到文件，點擊開始下載，然後移除
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 清理 URL 物件
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);

        resolve({ success: true, filename });
      } catch (error) {
        console.error('儲存檔案時發生錯誤：', error);
        reject({
          success: false,
          message: '無法儲存檔案',
          error
        });
      }
    });
  }

  /**
   * 開啟檔案對話框並讀取本地檔案
   *
   * @param {Object} options - 檔案讀取選項
   * @param {string} options.accept - 要接受的 MIME 類型（預設：application/json）
   * @returns {Promise} - 解析檔案內容
   */
  static readFromFile(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // 建立檔案輸入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = options.accept || 'application/json';
        fileInput.style.display = 'none';

        // 將輸入元素加入文件
        document.body.appendChild(fileInput);

        // 當選取檔案時
        fileInput.onchange = (event) => {
          const file = event.target.files[0];

          if (!file) {
            document.body.removeChild(fileInput);
            reject({ success: false, message: '未選取檔案' });
            return;
          }

          // 建立 FileReader 讀取檔案
          const reader = new FileReader();

          // 定義檔案載入時發生的事
          reader.onload = (e) => {
            try {
              // 嘗試將檔案內容解析為 JSON
              const fileContent = e.target.result;
              const parsedData = JSON.parse(fileContent);

              // 清理檔案輸入
              document.body.removeChild(fileInput);

              // 解析已解析的資料
              resolve({
                success: true,
                filename: file.name,
                data: parsedData
              });
            } catch (parseError) {
              document.body.removeChild(fileInput);
              reject({
                success: false,
                message: '無效的 JSON 檔案',
                error: parseError
              });
            }
          };

          // 定義發生錯誤時的處理
          reader.onerror = (error) => {
            document.body.removeChild(fileInput);
            reject({
              success: false,
              message: '讀取檔案時發生錯誤',
              error
            });
          };

          // 以文字方式讀取檔案
          reader.readAsText(file);
        };

        // 觸發檔案選取對話框
        fileInput.click();
      } catch (error) {
        console.error('開啟檔案對話框時發生錯誤：', error);
        reject({
          success: false,
          message: '無法開啟檔案對話框',
          error
        });
      }
    });
  }
}
