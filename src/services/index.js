// 主要導出文件 - 集中管理所有服務和工具類的導出

// 配置
export { API_CONFIG } from './config';

// 核心服務
export { WorkflowMappingService } from './WorkflowMappingService';
export { WorkflowAPIService } from './WorkflowAPIService';
export { LLMService } from './LLMService';
export { ExternalService } from './ExternalService';
export { WorkflowDataConverter } from './WorkflowDataConverter';
export { IconUploadService } from './IconUploadService';
export { AIMService } from './AIMService';
// 創建服務實例並導出
import { WorkflowAPIService } from './WorkflowAPIService';
import { LLMService } from './LLMService';
import { ExternalService } from './ExternalService';
import { IconUploadService } from './IconUploadService';
import { AIMService } from './AIMService';

// 創建單例實例
export const workflowAPIService = new WorkflowAPIService();
export const llmService = new LLMService();
export const externalService = new ExternalService();
export const iconUploadService = new IconUploadService();
export const aimService = new AIMService();
