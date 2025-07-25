import withNodeSelection from './withNodeSelection';
import CustomInputNode from './nodes/CustomInputNode';
import AICustomInputNode from './nodes/AICustomInputNode';
import BrowserExtensionOutputNode from './nodes/BrowserExtensionOutputNode';
import BrowserExtensionInputNode from './nodes/BrowserExtensionInputNode';
import IfElseNode from './nodes/IfElseNode';
import KnowledgeRetrievalNode from './nodes/KnowledgeRetrievalNode';
import EndNode from './nodes/EndNode';
import WebhookNode from './nodes/WebhookNode';
import HTTPRequestNode from './nodes/HTTPNode';
import LineNode from './nodes/LineNode';
import TimerNode from './nodes/TimerNode';
import LineMessageNode from './nodes/MessageNode';
import ExtractDataNode from './nodes/ExtractDataNode';
import QOCAAimNode from './nodes/QOCAAimNode';
import ScheduleNode from './nodes/ScheduleNode';
// Apply the withNodeSelection HOC to each node type
const enhancedNodeTypes = {
  customInput: withNodeSelection(CustomInputNode),
  aiCustomInput: withNodeSelection(AICustomInputNode),
  browserExtensionOutput: withNodeSelection(BrowserExtensionOutputNode),
  browserExtensionInput: withNodeSelection(BrowserExtensionInputNode),
  ifElse: withNodeSelection(IfElseNode),
  knowledgeRetrieval: withNodeSelection(KnowledgeRetrievalNode),
  end: withNodeSelection(EndNode),
  webhook: withNodeSelection(WebhookNode),
  httpRequest: withNodeSelection(HTTPRequestNode),
  line_webhook_input: withNodeSelection(LineNode),
  timer: withNodeSelection(TimerNode),
  line_send_message: withNodeSelection(LineMessageNode),
  extract_data: withNodeSelection(ExtractDataNode),
  aim_ml: withNodeSelection(QOCAAimNode),
  schedule_trigger: withNodeSelection(ScheduleNode)
};

export default enhancedNodeTypes;
