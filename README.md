# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## 自定義元件開發

### NodeItem 開發指南

#### 概述

NodeItem 是 React Flow Editor 中建立自定義節點的核心元件。每個 NodeItem 代表流程圖中可拖曳和可配置的節點。

#### 開發步驟

1. **建立新的 NodeItem 元件**

   - 在元件目錄中建立新檔案
   - 繼承基礎 NodeItem 類別或實作所需的介面

2. **定義必要屬性**

   - `id`: 節點的唯一識別符
   - `type`: 節點類型（用於渲染正確的元件）
   - `position`: 預設的 x, y 座標
   - `data`: 節點的自定義資料

3. **實作渲染方法**

   - 建立節點的視覺呈現
   - 新增連接點（輸入/輸出）
   - 包含任何互動元素

4. **註冊自定義節點**

   - 將您的 NodeItem 新增至 nodeTypes 物件
   - 確保鍵值與您定義的 'type' 屬性相符

5. **新增自定義樣式**

   - 為您的元件建立 CSS
   - 考慮不同狀態（選中、懸停等）

6. **實作事件處理器**

   - 處理拖曳事件
   - 處理點擊和選擇事件
   - 新增任何自定義行為

7. **測試您的 NodeItem**
   - 驗證連接是否正常運作
   - 測試所有互動功能
   - 確保資料正確維護

#### 使用範例

```jsx
// 註冊自定義節點類型
const nodeTypes = {
  customNode: CustomNodeItem
};

// 在 React Flow 中使用
<ReactFlow nodeTypes={nodeTypes} />;
```

### useFlowNode.js 的修改

#### 概述

useFlowNode.js 是一個自定義 Hook，用於管理流程圖節點的狀態和行為。當開發新的 NodeItem 時，需要確保它與此 Hook 正確整合。

#### 修改步驟

1. **註冊新的節點類型**

   ```jsx
   // 在 useFlowNode.js 中
   const nodeTypes = {
     ...existingNodeTypes,
     yourCustomNode: YourCustomNodeComponent
   };
   ```

2. **處理特殊節點屬性**

   - 如果您的節點有特殊屬性，需要在節點創建函數中定義

   ```jsx
   const createCustomNode = (position) => {
     return {
       id: `customNode-${getId()}`,
       type: 'yourCustomNode',
       position,
       data: {
         label: '自定義節點',
         // 其他自定義屬性
         customProperty: initialValue
       }
     };
   };
   ```

3. **添加節點更新邏輯**
   - 如果您的節點需要特殊的更新邏輯，請修改 updateNode 函數
   ```jsx
   const updateNode = (id, data) => {
     setNodes((nds) =>
       nds.map((node) => {
         if (node.id === id) {
           // 處理特定節點類型的特殊邏輯
           if (node.type === 'yourCustomNode') {
             // 特殊處理邏輯
           }
           return { ...node, data: { ...node.data, ...data } };
         }
         return node;
       })
     );
   };
   ```

### FlowEditor.js 的修改

#### 概述

FlowEditor.js 是流程編輯器的主要元件，它整合了 React Flow 和自定義節點。當添加新的 NodeItem 時，需要在此組件中進行相應的更新。

#### 修改步驟

1. **引入您的自定義節點**

   ```jsx
   import YourCustomNodeComponent from './components/YourCustomNodeComponent';
   ```

2. **更新節點類型映射**

   ```jsx
   const customNodeTypes = {
     ...existingNodeTypes,
     yourCustomNode: YourCustomNodeComponent
   };
   ```

3. **配置節點添加功能**

   - 在側邊欄或工具列中添加創建新節點的選項

   ```jsx
   const onDragStart = (event, nodeType) => {
     event.dataTransfer.setData('application/reactflow', nodeType);
     // 設置拖曳預覽或其他屬性
   };

   // 在工具欄中
   <div
     className='dndnode'
     onDragStart={(e) => onDragStart(e, 'yourCustomNode')}
     draggable>
     您的自定義節點
   </div>;
   ```

4. **擴展節點屬性面板**

   - 如果您的節點有自定義屬性，需要在屬性面板中添加相應的控制項

   ```jsx
   const NodePropertiesPanel = ({ selectedNode, updateNode }) => {
     // ...
     return (
       <div>
         {/* 通用屬性 */}
         {/* 針對特定節點類型顯示特定控制項 */}
         {selectedNode.type === 'yourCustomNode' && (
           <div>
             <label>自定義屬性:</label>
             <input
               value={selectedNode.data.customProperty || ''}
               onChange={(e) =>
                 updateNode(selectedNode.id, { customProperty: e.target.value })
               }
             />
           </div>
         )}
       </div>
     );
   };
   ```

5. **處理特殊節點行為**
   - 如果您的節點有特殊行為（如事件、動畫等），需要在 FlowEditor 中添加相應的處理邏輯

## 元件結構說明

本專案的元件依照功能分為幾個主要目錄：icons、nodes 和 layout。以下是各目錄下元件的用途說明。
以下是專案中各目錄的實際內容和用途說明：

### components/icons 目錄

| 檔案名稱    | 說明                                           |
| ----------- | ---------------------------------------------- |
| LineIcon.js | 線條圖示元件，用於表示流程連接線和各種線型樣式 |

### components/layout 目錄

| 檔案名稱       | 說明                                       |
| -------------- | ------------------------------------------ |
| NodeSidebar.js | 節點側邊欄元件，提供可用節點類型的拖放介面 |

### components/nodes 目錄

| 檔案名稱                      | 說明                                              |
| ----------------------------- | ------------------------------------------------- |
| AICustomInputNode.js          | AI 自定義輸入節點，用於接收 AI 相關的特定輸入資料 |
| BrowserExtensionInputNode.js  | 瀏覽器擴充輸入節點，用於從瀏覽器擴充程式接收資料  |
| BrowserExtensionOutputNode.js | 瀏覽器擴充輸出節點，用於向瀏覽器擴充程式發送資料  |
| CustomInputNode.js            | 可自定義輸入節點，允許使用者配置自訂輸入來源      |
| EditNodeModal.js              | 節點編輯對話框，提供節點屬性的編輯界面            |
| EndNode.js                    | 結束節點，表示流程的終點                          |
| HTTPNode.js                   | HTTP 節點，處理 HTTP 請求和回應                   |
| IfElseNode.js                 | 條件分支節點，根據條件執行不同的流程路徑          |
| KnowledgeRetrievalNode.js     | 知識檢索節點，用於從知識庫中擷取資訊              |
| WebhookNode.js                | Webhook 節點，用於接收外部系統的事件通知          |
| HTTPNode.js                   | TBD                                               |
| TimerNode.js                  | TBD                                               |
| EventNode.js                  | TBD                                               |
| LineNode.js                   | TBD                                               |

### hooks 目錄

模擬的核心 Hook 如下：

| 檔案名稱        | 說明                                            |
| --------------- | ----------------------------------------------- |
| useFlowNodes.js | 流程編輯器核心 Hook，管理節點和連線的狀態及操作 |

#### useFlowNodes Hook 詳細說明

##### 核心功能

useFlowNodes 是一個用於管理流程編輯器中的節點和連線的 React Hook。它提供完整的狀態管理和操作功能，適用於建立視覺化流程編輯介面。

##### 狀態管理

```javascript
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
```

- 使用 ReactFlow 的 API 來管理節點和連線
- 提供節點和連線的變更處理函數

##### 歷史記錄功能

```javascript
const undoStack = useRef([]);
const redoStack = useRef([]);
```

- 實現完整的撤銷/重做功能
- 操作前將狀態保存到歷史堆疊
- 支援多層次的操作回退

##### 節點類型支援

1. **CustomInputNode**

   - 輸入節點，可包含多個輸入欄位
   - 每個欄位有名稱和預設值
   - 支援動態添加欄位
   - 每個欄位有獨立的輸出連接點

2. **AI 節點**

   - 設定 AI 模型參數
   - 配置提示文本
   - 整合 AI 處理功能

3. **條件和控制流節點**

   - If/Else 條件分支
   - 定時器節點
   - 結束節點

4. **資料和 API 節點**
   - HTTP 請求節點
   - Webhook 節點
   - 瀏覽器擴展輸入/輸出
   - 知識庫檢索節點

##### 節點操作函數

**創建節點**

```javascript
const handleAddInputNode = useCallback(
  () => {
    // 創建帶有預設欄位的節點
  },
  [
    /* 依賴項 */
  ]
);
```

- 各種節點類型的專用創建函數
- 自動分配唯一 ID
- 設置預設值和初始狀態

**更新節點**

```javascript
const updateFieldInputName = useCallback(
  (nodeId, index, value) => {
    // 更新特定節點的欄位名稱
  },
  [safeSetNodes]
);
```

- 針對不同節點類型的特定更新函數
- 安全地更新嵌套屬性
- 維護節點的不變性

**添加元素**

```javascript
const addField = useCallback(
  (nodeId) => {
    // 向指定節點添加新欄位
  },
  [safeSetNodes]
);
```

- 向節點添加新元素的功能
- 支援自定義輸入、瀏覽器擴展等節點

**連線管理**

```javascript
const onConnect = (params) => {
  safeSetEdges((eds) => addEdge(params, eds));
};
```

- 處理節點間的連線創建
- 支援複雜的流程圖建構

##### 函數更新機制

```javascript
const updateNodeFunctions = useCallback(
  () => {
    // 更新節點的函數引用
  },
  [
    /* 依賴項 */
  ]
);
```

- 確保節點上的函數引用保持最新
- 避免閉包陷阱和過時引用
- 按需更新節點函數

##### 使用方式

```javascript
// 在組件中
const {
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  handleAddInputNode
  // 其他需要的功能...
} = useFlowNodes();

// 在 JSX 中
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes}>
  {/* 子組件 */}
</ReactFlow>;
```

##### 最佳實踐

- 確保函數定義順序正確，避免引用未初始化的變數
- 保持正確的依賴項列表，避免過時閉包
- 使用 updateNodeFunctions 確保節點函數引用的一致性
- 使用 safeSetNodes 和 safeSetEdges 來保存操作歷史

這個 Hook 提供了強大且靈活的流程編輯器狀態管理方案，支援各種節點類型和複雜的流程邏輯。

系統架構以 React Flow 為基礎，通過這些自定義元件和 Hook 擴展功能，為使用者提供直觀的流程編輯體驗。開發者可以參考現有節點的實作方式，根據需求添加新的節點類型。
