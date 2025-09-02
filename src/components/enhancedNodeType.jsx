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
import WebhookInputNode from './nodes/WebhookInputNode';
import WebhookOutputNode from './nodes/WebhookOutputNode';
import CombineTextNode from './nodes/CombineTextNode';
import RouterSwitchNode from './nodes/RouterSwitchNode';
import SpeechToTextNode from './nodes/SpeechToTextNode';
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
  schedule_trigger: withNodeSelection(ScheduleNode),
  webhook_input: withNodeSelection(WebhookInputNode),
  webhook_output: withNodeSelection(WebhookOutputNode),
  combine_text: withNodeSelection(CombineTextNode),
  router_switch: withNodeSelection(RouterSwitchNode),
  speech_to_text: withNodeSelection(SpeechToTextNode)
};

export default enhancedNodeTypes;
