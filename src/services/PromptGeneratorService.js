import { API_CONFIG } from './config';
import { tokenService } from './TokenService';

/**
 * Prompt 生成器 API 服務
 */
export class PromptGeneratorService {
  /**
   * 生成優化的 Prompt
   * @param {number} llmId - LLM 模型 ID
   * @param {string} originalPrompt - 原始 Prompt
   * @returns {Promise<Object>} API 回應
   */
  static async generateOptimizedPrompt(llmId, originalPrompt) {
    try {
      const options = tokenService.createAuthHeader({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          llm_id: llmId,
          prompt: originalPrompt
        })
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/ai/prompt-generator`,
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成優化 Prompt 失敗');
      }
      return data;
    } catch (error) {
      console.error('生成優化 Prompt 失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證 Prompt 生成器的參數
   * @param {number} llmId - LLM 模型 ID
   * @param {string} prompt - Prompt 文字
   * @returns {Object} 驗證結果
   */
  static validateParameters(llmId, prompt) {
    const errors = [];

    // 驗證 LLM ID
    if (!llmId || typeof llmId !== 'number') {
      errors.push('LLM ID 必須是有效的數字');
    }

    // 驗證 Prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      errors.push('Prompt 不能為空');
    }

    // if (prompt && prompt.length < 5) {
    //   errors.push('Prompt 長度至少需要 5 個字符');
    // }

    // if (prompt && prompt.length > 10000) {
    //   errors.push('Prompt 長度不能超過 10000 個字符');
    // }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const promptGeneratorService = new PromptGeneratorService();
