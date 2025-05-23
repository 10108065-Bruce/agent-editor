// TokenService.js 簡化版

class TokenService {
  constructor() {
    this.token = null;
    this.storageType = 'local'; // 默認使用 localStorage
    this.initToken();
  }

  initToken() {
    try {
      const storedToken = localStorage.getItem('api_token');
      if (storedToken) {
        this.token = storedToken;
        console.log('已從 localStorage 載入 API Token');
      }
    } catch (error) {
      console.error('初始化 token 失敗:', error);
    }
  }

  setToken(token, storageType = 'local') {
    if (!token) return;

    this.token = token;
    this.storageType = storageType;
    console.log(`API Token 已更新 (儲存類型: ${storageType})`);

    try {
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.setItem('api_token', token);
    } catch (error) {
      console.error('保存 token 到 localStorage 失敗:', error);
    }
  }

  getToken() {
    return this.token;
  }

  createAuthHeader(options = {}) {
    // 嘗試獲取 token
    if (!this.token) {
      // 優先檢查 sessionStorage
      this.token = sessionStorage.getItem('api_token');
      // 如果 sessionStorage 中沒有，檢查 localStorage
      if (!this.token) {
        this.token = localStorage.getItem('api_token');
      }
    }

    if (!this.token) {
      return options;
    }

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${this.token}`
    };

    return {
      ...options,
      headers
    };
  }
}

const tokenService = new TokenService();
export { tokenService };
