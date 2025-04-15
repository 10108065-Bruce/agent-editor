import withNodeSelection from './withNodeSelection';
import CustomInputNode from './nodes/CustomInputNode';
import AICustomInputNode from './nodes/AICustomInputNode';
import BrowserExtensionOutputNode from './nodes/BrowserExtensionOutputNode';
import BrowserExtensionInputNode from './nodes/BrowserExtensionInputNode';
import IfElseNode from './nodes/IfElseNode';
import KnowledgeRetrievalNode from './nodes/KnowledgeRetrievalNode';
import EndNode from './nodes/EndNode';
import WebhookNode from './nodes/WebhookNode';
import HTTPNode from './nodes/HTTPNode';
import LineNode from './nodes/LineNode';
import TimerNode from './nodes/TimerNode';

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
  http: withNodeSelection(HTTPNode),
  line: withNodeSelection(LineNode),
  timer: withNodeSelection(TimerNode)
};

export default enhancedNodeTypes;
