import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import IconBase from '../icons/IconBase';
import CombineTextEditor from '../text/CombineTextEditor';
import CopytIncon from '../../assets/text-copy-off.png';
import { flushSync } from 'react-dom';

const CombineTextNode = ({ data, isConnectable, id }) => {
  const edges = useEdges();
  const nodes = useNodes();

  // 內容保護 ref，防止意外清空
  const contentProtectionRef = useRef('');
  const isInserting = useRef(false);
  const lastValidContentRef = useRef('');

  // 狀態管理
  const [textToCombine, setTextToCombine] = useState(data?.textToCombine || '');
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [inputHandles, setInputHandles] = useState(
    data?.inputHandles || [{ id: 'text0' }]
  );
  const [activeTab, setActiveTab] = useState(data?.activeTab || 'editor');
  const [editorContent, setEditorContent] = useState(data?.textToCombine || '');
  const [editorHtmlContent, setEditorHtmlContent] = useState(
    data?.editorHtmlContent || ''
  );

  // 初始化標記
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const inputPanelRef = useRef(null);

  // 計算當前連線數量
  const connectionCount = edges.filter((edge) => edge.target === id).length;

  // 獲取 flow_id 的方法
  const getFlowId = useCallback(() => {
    if (data?.flowId) {
      return data.flowId;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlFlowId = urlParams.get('flowId') || urlParams.get('flow_id');
    if (urlFlowId) {
      return urlFlowId;
    }

    const pathMatch = window.location.pathname.match(/\/flow\/([^\/]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    if (typeof window !== 'undefined' && window.currentFlowId) {
      return window.currentFlowId;
    }

    return '9e956c37-20ea-47a5-bcd5-3cafc35b967d';
  }, [data]);

  // 獲取當前內容的統一方法
  const getCurrentContent = useCallback(() => {
    // 優先從編輯器獲取最新內容
    if (textareaRef.current && textareaRef.current.getValue) {
      try {
        const editorCurrentContent = textareaRef.current.getValue();
        if (editorCurrentContent) {
          // 更新最後有效內容
          lastValidContentRef.current = editorCurrentContent;
          return editorCurrentContent;
        }
      } catch (error) {
        console.warn('從編輯器獲取內容失敗:', error);
      }
    }

    // 從狀態獲取
    const stateContent = textToCombine || editorContent || '';

    // 如果狀態內容為空但有最後有效內容，使用最後有效內容
    if (!stateContent && lastValidContentRef.current) {
      console.warn('狀態內容為空，使用最後有效內容');
      return lastValidContentRef.current;
    }

    console.log('從狀態獲取內容:', stateContent?.substring(0, 100));
    return stateContent;
  }, [textToCombine, editorContent]);

  const copyToClipboard = async () => {
    try {
      const selection = window.getSelection();
      let textToCopy = '';
      let copyType = '';

      if (selection && selection.toString().trim()) {
        textToCopy = selection.toString();
        copyType = '選取內容';
      } else {
        textToCopy = getCurrentContent();
        copyType = 'Preview內容';
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `已複製${copyType}到剪貼板`,
              type: 'success',
              duration: 2000
            });
          }
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API 失敗，嘗試 fallback:', clipboardError);
        }
      }

      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.cssText =
        'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: `已複製${copyType}到剪貼板`,
            type: 'success',
            duration: 2000
          });
        }
      } else {
        throw new Error('所有複製方法都失敗');
      }
    } catch (error) {
      console.error('複製失敗:', error);
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '複製失敗，請手動複製 Prompt',
          type: 'error',
          duration: 3000
        });
      }
    }
  };

  // 添加 useEffect 來同步 node_input 狀態
  useEffect(() => {
    const connectedEdges = edges.filter((edge) => edge.target === id);

    if (
      connectedEdges.length > 0 &&
      data &&
      typeof data.updateNodeData === 'function'
    ) {
      // 保存當前編輯器內容
      let currentEditorContent = '';
      if (textareaRef.current && textareaRef.current.getValue) {
        try {
          currentEditorContent = textareaRef.current.getValue();
        } catch (error) {
          console.warn('獲取編輯器內容失敗:', error);
        }
      }

      // ... 原有的 node_input 更新邏輯 ...
      const currentNodeInput = data.node_input || {};
      const newNodeInput = {};

      // 保持現有連線的穩定索引
      const existingConnections = new Map();
      Object.entries(currentNodeInput).forEach(([key, value]) => {
        if (key.startsWith('text') && value.node_id) {
          existingConnections.set(value.node_id, {
            key,
            value,
            index: parseInt(key.replace('text', '')) || 0
          });
        }
      });

      // 按源節點 ID 排序，確保穩定順序
      const sortedEdges = connectedEdges.sort((a, b) => {
        const aExisting = existingConnections.get(a.source);
        const bExisting = existingConnections.get(b.source);

        if (aExisting && bExisting) {
          return aExisting.index - bExisting.index;
        } else if (aExisting) {
          return -1;
        } else if (bExisting) {
          return 1;
        } else {
          return a.source.localeCompare(b.source);
        }
      });

      // 追蹤已使用的索引
      const usedIndices = new Set();

      // 建構 node_input
      sortedEdges.forEach((edge) => {
        const existingConnection = existingConnections.get(edge.source);
        let inputKey;

        if (existingConnection) {
          inputKey = existingConnection.key;
          usedIndices.add(existingConnection.index);
        } else {
          let newIndex = 0;
          while (usedIndices.has(newIndex)) {
            newIndex++;
          }
          inputKey = `text${newIndex}`;
          usedIndices.add(newIndex);
        }

        // 獲取 return_name
        const sourceNode = nodes.find((n) => n.id === edge.source);
        let returnName = edge.label || 'output';

        if (sourceNode) {
          // 根據源節點類型設置 return_name
          if (
            sourceNode.type === 'customInput' ||
            sourceNode.type === 'input'
          ) {
            if (sourceNode.data?.fields?.[0]?.inputName) {
              returnName = sourceNode.data.fields[0].inputName;
            }
          } else if (sourceNode.type === 'browserExtensionInput') {
            const targetItem = sourceNode.data?.items?.find(
              (item) => item.id === edge.sourceHandle
            );
            if (targetItem?.name) {
              returnName = targetItem.name;
            }
          } else if (
            sourceNode.type === 'aiCustomInput' ||
            sourceNode.type === 'ai'
          ) {
            returnName = 'output';
          } else if (sourceNode.type === 'knowledgeRetrieval') {
            returnName = 'output';
          } else if (sourceNode.type === 'schedule_trigger') {
            returnName = 'trigger';
          }
        }

        newNodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };
      });

      if (JSON.stringify(currentNodeInput) !== JSON.stringify(newNodeInput)) {
        data.updateNodeData('node_input', newNodeInput);

        // 如果有編輯器內容，在更新後恢復
        if (currentEditorContent && activeTab === 'editor') {
          setTimeout(() => {
            // 確保編輯器內容不會因為連線更新而丟失
            setTextToCombine(currentEditorContent);
            setEditorContent(currentEditorContent);
            if (data && typeof data.updateNodeData === 'function') {
              data.updateNodeData('textToCombine', currentEditorContent);
            }
          }, 50);
        }
      }
    }
  }, [edges, id, data, nodes, activeTab]);

  // 從邊緣獲取連線的節點信息
  const getConnectedNodes = useCallback(() => {
    const connectedEdges = edges.filter((edge) => edge.target === id);
    return connectedEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return {
        id: edge.source,
        name: getNodeDisplayName(sourceNode),
        outputName: edge.sourceHandle || 'output',
        handleId: edge.targetHandle,
        nodeType: sourceNode?.type || 'unknown',
        data: `QOCA__NODE_ID__${edge.source}__NODE_OUTPUT_NAME__${
          edge.sourceHandle || 'output'
        }`,
        code: `QOCA__NODE_ID__${edge.source}__NODE_OUTPUT_NAME__${
          edge.sourceHandle || 'output'
        }`,
        color: getNodeTagColor(getNodeDisplayName(sourceNode))
      };
    });
  }, [edges, nodes, id]);

  // 獲取節點顯示名稱的輔助函數
  const getNodeDisplayName = (sourceNode) => {
    if (!sourceNode) return 'Unknown';

    switch (sourceNode.type) {
      case 'customInput':
      case 'input':
        return 'Input';
      case 'aiCustomInput':
      case 'ai':
        return 'AI';
      case 'aim_ml':
        return 'ML Node';
      case 'browserExtensionInput':
        return 'Browser Extension Input';
      case 'webhook_input':
        return 'Webhook Input Node';
      case 'knowledgeRetrieval':
        return 'Knowledge Retrieval';
      case 'extract_data':
        return 'Extract Data Node';
      case 'line_webhook_input':
        return 'Line Webhook Input';
      case 'httpRequest':
        return 'HTTP Request Node';
      case 'schedule_trigger':
        return 'Schedule node';
      case 'combine_text':
        return 'Combine Text Node';
      case 'webhook_output':
        return 'Webhook Output Node';
      case 'browserExtensionOutput':
        return 'Browser Extension Output';
      default:
        return `${
          sourceNode.type.charAt(0).toUpperCase() + sourceNode.type.slice(1)
        }`;
    }
  };

  // 獲取節點標籤顏色
  const getNodeTagColor = (nodeName) => {
    const colorMap = {
      Input: '#0075FF',
      AI: '#FFAA1E',
      'Knowledge Retrieval': '#87CEEB',
      'Browser Extension Input': '#1FCD28',
      'Line Webhook Input': '#06C755',
      'Extract Data Node': '#D97706',
      'ML Node': '#098D7F',
      'HTTP Request Node': '#F8D7DA',
      'Schedule node': '#DCCAFA',
      'Webhook Input Node': '#FC6165',
      'Combine Text Node': '#4E7ECF'
    };
    return colorMap[nodeName] || '#6b7280';
  };

  // 處理文字內容變更
  const handleTextChange = useCallback(
    (e) => {
      const newContent = e.target.value;
      console.log(
        'handleTextChange 收到新內容:',
        newContent?.substring(0, 100)
      );

      // 內容保護：如果新內容為空且當前有有效內容，且不在插入過程中，則拒絕更新
      if (!newContent && lastValidContentRef.current && !isInserting.current) {
        console.warn('檢測到內容被意外清空，拒絕更新，保持原內容');

        // 嘗試恢復編輯器內容
        setTimeout(() => {
          if (textareaRef.current && textareaRef.current.setValue) {
            try {
              textareaRef.current.setValue(lastValidContentRef.current);
            } catch (error) {
              console.warn('恢復編輯器內容失敗:', error);
            }
          }
        }, 100);

        return; // 拒絕空內容更新
      }

      // 如果內容有效，更新最後有效內容
      if (newContent) {
        lastValidContentRef.current = newContent;
      }

      // 立即同步更新所有相關狀態
      setTextToCombine(newContent);
      setEditorContent(newContent);

      // 立即更新父組件狀態
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('textToCombine', newContent);
      }

      // HTML 內容更新
      try {
        if (textareaRef.current?.innerHTML !== undefined) {
          const htmlContent = textareaRef.current.innerHTML || '';
          setEditorHtmlContent(htmlContent);
          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('editorHtmlContent', htmlContent);
          }
        }
      } catch (error) {
        console.warn('更新 HTML 內容失敗:', error);
      }
    },
    [data]
  );

  // 關閉輸入面板
  const closeInputPanel = useCallback(() => {
    setShowInputPanel(false);
    setFilterText('');
  }, []);

  // 處理panel顯示控制
  const handleShowPanel = useCallback(
    (show) => {
      if (activeTab === 'editor') {
        setShowInputPanel(show);
        if (!show) {
          setFilterText('');
        }
      }
    },
    [activeTab]
  );

  // 處理標籤點擊
  const handleTagClick = useCallback(
    (nodeInfo) => {
      if (textareaRef.current && textareaRef.current.insertTagAtCursor) {
        textareaRef.current.insertTagAtCursor(nodeInfo);

        // 獲取更新後的內容
        setTimeout(() => {
          if (textareaRef.current && textareaRef.current.getValue) {
            const newContent = textareaRef.current.getValue();
            console.log('標籤插入後獲取內容:', newContent?.substring(0, 100));

            setTextToCombine(newContent);
            setEditorContent(newContent);

            // 立即更新父組件狀態
            if (data && typeof data.updateNodeData === 'function') {
              data.updateNodeData('textToCombine', newContent);
            }
          }
        }, 0);
      }
      closeInputPanel();
    },
    [closeInputPanel, data]
  );

  // 處理標籤拖拽開始
  const handleTagDragStart = useCallback((e, nodeInfo) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(nodeInfo));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const syncContentFromEditor = useCallback(() => {
    if (textareaRef.current && textareaRef.current.getValue) {
      try {
        const currentContent = textareaRef.current.getValue();
        const htmlContent = textareaRef.current.innerHTML || '';

        // 只在內容真的不同時才更新
        if (currentContent !== textToCombine) {
          setTextToCombine(currentContent);
          setEditorContent(currentContent);

          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('textToCombine', currentContent);
          }
        }

        if (htmlContent !== editorHtmlContent) {
          setEditorHtmlContent(htmlContent);

          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('editorHtmlContent', htmlContent);
          }
        }

        return currentContent;
      } catch (error) {
        console.warn('同步編輯器內容失敗:', error);
      }
    }

    return textToCombine;
  }, [textToCombine, editorHtmlContent, data]);

  // 處理標籤插入完成
  const handleTagInsert = useCallback(
    (tag) => {
      console.log('標籤已插入:', tag);

      // 標記開始插入狀態
      isInserting.current = true;

      // 保護當前內容
      if (textareaRef.current && textareaRef.current.getValue) {
        try {
          const currentContent = textareaRef.current.getValue();
          if (currentContent) {
            contentProtectionRef.current = currentContent;
            lastValidContentRef.current = currentContent;
          }
        } catch (error) {
          console.warn('保護當前內容失敗:', error);
        }
      }

      // 使用多重檢查確保內容正確同步
      const syncContent = () => {
        if (textareaRef.current && textareaRef.current.getValue) {
          try {
            const newContent = textareaRef.current.getValue();
            console.log('標籤插入後獲取內容:', newContent?.substring(0, 100));

            // 如果獲取到有效內容，立即同步
            if (newContent) {
              lastValidContentRef.current = newContent;
              setTextToCombine(newContent);
              setEditorContent(newContent);

              // 立即更新父組件狀態
              if (data && typeof data.updateNodeData === 'function') {
                data.updateNodeData('textToCombine', newContent);
              }

              // 獲取並更新 HTML 內容
              try {
                const htmlContent = textareaRef.current.innerHTML || '';
                setEditorHtmlContent(htmlContent);
                if (data && typeof data.updateNodeData === 'function') {
                  data.updateNodeData('editorHtmlContent', htmlContent);
                }
              } catch (error) {
                console.warn('更新 HTML 內容失敗:', error);
              }
            } else if (contentProtectionRef.current) {
              // 如果沒有獲取到內容，使用保護的內容
              console.warn('標籤插入後內容為空，使用保護內容');
              setTextToCombine(contentProtectionRef.current);
              setEditorContent(contentProtectionRef.current);

              if (data && typeof data.updateNodeData === 'function') {
                data.updateNodeData(
                  'textToCombine',
                  contentProtectionRef.current
                );
              }
            }
          } catch (error) {
            console.warn('標籤插入後同步內容失敗:', error);
          }
        }
      };

      // 多次嘗試同步，確保內容正確更新
      setTimeout(syncContent, 50); // 第一次嘗試
      setTimeout(syncContent, 150); // 第二次嘗試
      setTimeout(syncContent, 300); // 第三次嘗試

      // 延遲重置插入狀態
      setTimeout(() => {
        isInserting.current = false;
      }, 500);
    },
    [data]
  );

  // 處理 Tab 切換
  const handleTabChange = useCallback(
    (newTab) => {
      console.log(`切換標籤頁: ${activeTab} -> ${newTab}`);

      // 從編輯器切換到預覽時，強制同步並驗證內容
      if (activeTab === 'editor' && newTab === 'preview') {
        if (textareaRef.current && textareaRef.current.getValue) {
          try {
            const currentContent = textareaRef.current.getValue();
            console.log(
              '切換到預覽前同步內容:',
              currentContent?.substring(0, 100)
            );

            // 內容驗證：如果當前內容為空但有最後有效內容，使用最後有效內容
            const finalContent =
              currentContent || lastValidContentRef.current || textToCombine;

            if (finalContent) {
              lastValidContentRef.current = finalContent;

              // 使用 flushSync 強制立即更新
              try {
                flushSync(() => {
                  setTextToCombine(finalContent);
                  setEditorContent(finalContent);
                  setActiveTab(newTab);
                });
              } catch (error) {
                console.error('flushSync 失敗:', error);
                setTextToCombine(finalContent);
                setEditorContent(finalContent);
                setActiveTab(newTab);
              }

              // 更新父組件狀態
              if (data && typeof data.updateNodeData === 'function') {
                data.updateNodeData('textToCombine', finalContent);
                data.updateNodeData('activeTab', newTab);
              }

              // 獲取 HTML 內容
              try {
                const htmlContent = textareaRef.current.innerHTML || '';
                if (htmlContent) {
                  setEditorHtmlContent(htmlContent);
                  if (data && typeof data.updateNodeData === 'function') {
                    data.updateNodeData('editorHtmlContent', htmlContent);
                  }
                }
              } catch (error) {
                console.warn('獲取 HTML 內容失敗:', error);
              }

              return; // 提前返回
            }
          } catch (error) {
            console.error('切換 tab 時同步內容失敗:', error);
          }
        }
      }

      // 其他情況的標準切換
      setActiveTab(newTab);
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('activeTab', newTab);
      }
    },
    [activeTab, data, textToCombine]
  );

  // 處理滾輪事件
  const handleWheel = useCallback((e) => {
    const target = e.currentTarget;
    const isScrollable = target.scrollHeight > target.clientHeight;

    if (isScrollable) {
      e.stopPropagation();
      const deltaY = e.deltaY;
      const currentScrollTop = target.scrollTop;
      const maxScrollTop = target.scrollHeight - target.clientHeight;

      const newScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, currentScrollTop + deltaY)
      );

      target.scrollTop = newScrollTop;
      e.preventDefault();
    } else {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  // 處理滑鼠事件
  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleMouseMove = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleMouseUp = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // 過濾連線節點
  const filteredNodes = getConnectedNodes().filter((node) =>
    node.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // 一次性初始化
  useEffect(() => {
    if (!isInitialized && data) {
      console.log('執行一次性初始化同步');

      const initialContent = data.textToCombine || '';

      // 設置最後有效內容
      if (initialContent) {
        lastValidContentRef.current = initialContent;
        contentProtectionRef.current = initialContent;
      }

      // 初始化狀態
      if (data.activeTab && data.activeTab !== activeTab) {
        setActiveTab(data.activeTab);
      }
      if (
        data.editorHtmlContent &&
        data.editorHtmlContent !== editorHtmlContent
      ) {
        setEditorHtmlContent(data.editorHtmlContent);
      }

      // 同步初始內容
      setTextToCombine(initialContent);
      setEditorContent(initialContent);

      setIsInitialized(true);
    }
  }, [data, isInitialized, activeTab, editorHtmlContent]);

  useEffect(() => {
    if (isInitialized) {
      // 定期檢查編輯器內容是否與狀態同步
      const checkSync = () => {
        if (activeTab === 'editor') {
          syncContentFromEditor();
        }
      };

      const intervalId = setInterval(checkSync, 1000); // 每秒檢查一次

      return () => clearInterval(intervalId);
    }
  }, [isInitialized, activeTab, syncContentFromEditor]);

  // 動態管理輸入 handles
  useEffect(() => {
    const singleHandle = [{ id: 'text' }];

    if (JSON.stringify(singleHandle) !== JSON.stringify(inputHandles)) {
      setInputHandles(singleHandle);
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('inputHandles', singleHandle);
      }
    }
  }, [inputHandles, data]);

  useEffect(() => {
    const connectedEdges = edges.filter((edge) => edge.target === id);

    if (
      connectedEdges.length > 0 &&
      data &&
      typeof data.updateNodeData === 'function'
    ) {
      // 保存當前內容
      const currentContent = getCurrentContent();
      if (currentContent) {
        contentProtectionRef.current = currentContent;
        lastValidContentRef.current = currentContent;
      }

      // ... 原有的 node_input 更新邏輯保持不變 ...
      const currentNodeInput = data.node_input || {};
      const newNodeInput = {};

      // 保持現有連線的穩定索引
      const existingConnections = new Map();
      Object.entries(currentNodeInput).forEach(([key, value]) => {
        if (key.startsWith('text') && value.node_id) {
          existingConnections.set(value.node_id, {
            key,
            value,
            index: parseInt(key.replace('text', '')) || 0
          });
        }
      });

      // 按源節點 ID 排序，確保穩定順序
      const sortedEdges = connectedEdges.sort((a, b) => {
        const aExisting = existingConnections.get(a.source);
        const bExisting = existingConnections.get(b.source);

        if (aExisting && bExisting) {
          return aExisting.index - bExisting.index;
        } else if (aExisting) {
          return -1;
        } else if (bExisting) {
          return 1;
        } else {
          return a.source.localeCompare(b.source);
        }
      });

      // 追蹤已使用的索引
      const usedIndices = new Set();

      // 建構 node_input
      sortedEdges.forEach((edge) => {
        const existingConnection = existingConnections.get(edge.source);
        let inputKey;

        if (existingConnection) {
          inputKey = existingConnection.key;
          usedIndices.add(existingConnection.index);
        } else {
          let newIndex = 0;
          while (usedIndices.has(newIndex)) {
            newIndex++;
          }
          inputKey = `text${newIndex}`;
          usedIndices.add(newIndex);
        }

        // 獲取 return_name
        const sourceNode = nodes.find((n) => n.id === edge.source);
        let returnName = edge.label || 'output';

        if (sourceNode) {
          // 根據源節點類型設置 return_name
          if (
            sourceNode.type === 'customInput' ||
            sourceNode.type === 'input'
          ) {
            if (sourceNode.data?.fields?.[0]?.inputName) {
              returnName = sourceNode.data.fields[0].inputName;
            }
          } else if (sourceNode.type === 'browserExtensionInput') {
            const targetItem = sourceNode.data?.items?.find(
              (item) => item.id === edge.sourceHandle
            );
            if (targetItem?.name) {
              returnName = targetItem.name;
            }
          } else if (
            sourceNode.type === 'aiCustomInput' ||
            sourceNode.type === 'ai'
          ) {
            returnName = 'output';
          } else if (sourceNode.type === 'knowledgeRetrieval') {
            returnName = 'output';
          } else if (sourceNode.type === 'schedule_trigger') {
            returnName = 'trigger';
          }
        }

        newNodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };
      });

      // 只有當 node_input 真的有變化時才更新
      if (JSON.stringify(currentNodeInput) !== JSON.stringify(newNodeInput)) {
        data.updateNodeData('node_input', newNodeInput);

        // 確保內容不會因為連線更新而丟失
        setTimeout(() => {
          if (contentProtectionRef.current) {
            console.log('連線更新後恢復保護的內容');
            setTextToCombine(contentProtectionRef.current);
            setEditorContent(contentProtectionRef.current);

            if (data && typeof data.updateNodeData === 'function') {
              data.updateNodeData(
                'textToCombine',
                contentProtectionRef.current
              );
            }
          }
        }, 100);
      }
    }
  }, [edges, id, data, nodes, getCurrentContent]);

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-96'>
        {/* Header section */}
        <div className='bg-[#dbeafe] p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='w-6 h-6 flex items-center justify-center text-white mr-2'>
                <IconBase type='combine_text' />
              </div>
              <span className='font-medium'>Combine Text</span>
            </div>
            {connectionCount > 0 && (
              <span className='text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full'>
                已連線
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className='bg-white p-4'>
          <div className='mb-2'>
            <div className='flex items-center justify-between'>
              <label className='block text-sm text-gray-700 font-bold'>
                Compose
              </label>
              <div className='group relative'>
                <button
                  onClick={copyToClipboard}
                  className='px-3 py-1  text-white rounded-md transition-colors text-sm flex items-center space-x-1'>
                  <img
                    src={CopytIncon}
                    alt='Copy Icon'
                    className='text-white'
                    width={16}
                    height={16}
                  />
                </button>
                {/* Tooltip */}
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[10000]'>
                  複製
                  {/* 箭頭 */}
                  <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800'></div>
                </div>
              </div>
            </div>

            {/* Tab 切換器 */}
            <div className='flex mb-4 bg-gray-100 rounded-lg p-1 mt-2'>
              <button
                onClick={() => handleTabChange('editor')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'editor'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                Editor
              </button>
              <button
                onClick={() => handleTabChange('preview')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                Preview
              </button>
            </div>

            {/* 內容區域 */}
            <div className='relative'>
              {activeTab === 'editor' ? (
                <CombineTextEditor
                  key={`editor-${isInitialized}`}
                  ref={textareaRef}
                  value={isInitialized ? undefined : textToCombine}
                  onChange={handleTextChange}
                  onTagInsert={handleTagInsert}
                  placeholder='點擊此處編輯內容...'
                  className='bg-gray-900 text-white border-gray-300'
                  flowId={getFlowId()}
                  initialHtmlContent={editorHtmlContent}
                  shouldShowPanel={connectionCount > 0}
                  showInputPanel={showInputPanel}
                  onShowPanel={handleShowPanel}
                  style={{
                    minHeight: '220px',
                    maxHeight: '400px',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              ) : (
                <div
                  ref={previewRef}
                  className='font-mono text-sm bg-gray-100 text-gray-800 p-3 rounded border'
                  style={{
                    fontFamily:
                      'Monaco, Menlo, Consolas, "Courier New", monospace',
                    minHeight: '220px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere'
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}>
                  <pre
                    className='whitespace-pre-wrap'
                    style={{
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                    {(() => {
                      let content = getCurrentContent();

                      // 如果預覽內容為空，使用多種方式嘗試恢復
                      if (!content) {
                        console.warn('預覽內容為空，嘗試恢復...');

                        // 嘗試從保護內容恢復
                        if (lastValidContentRef.current) {
                          content = lastValidContentRef.current;
                          console.log(
                            '使用最後有效內容:',
                            content.substring(0, 100)
                          );

                          // 異步更新狀態
                          setTimeout(() => {
                            setTextToCombine(content);
                            setEditorContent(content);
                            if (
                              data &&
                              typeof data.updateNodeData === 'function'
                            ) {
                              data.updateNodeData('textToCombine', content);
                            }
                          }, 0);
                        } else if (contentProtectionRef.current) {
                          content = contentProtectionRef.current;
                          console.log(
                            '使用保護內容:',
                            content.substring(0, 100)
                          );

                          // 異步更新狀態
                          setTimeout(() => {
                            setTextToCombine(content);
                            setEditorContent(content);
                            if (
                              data &&
                              typeof data.updateNodeData === 'function'
                            ) {
                              data.updateNodeData('textToCombine', content);
                            }
                          }, 0);
                        }
                      }

                      console.log(
                        'Preview 最終顯示內容:',
                        content?.substring(0, 100)
                      );
                      return content || '內容載入中...';
                    })()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='text'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      <Handle
        type='source'
        position={Position.Right}
        id='output'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      {showInputPanel && connectionCount > 0 && activeTab === 'editor' && (
        <div className='fixed inset-0 z-[9999]'>
          {/* 透明背景層 */}
          <div
            className='absolute inset-0 bg-transparent pointer-events-auto'
            onClick={closeInputPanel}
          />

          {/* 面板內容 */}
          <div
            ref={inputPanelRef}
            className='absolute bg-white rounded-lg shadow-xl w-80 flex flex-col pointer-events-auto border border-gray-200 z-10'
            style={{
              left: `${(data?.position?.x || 0) - 320}px`,
              top: `${data?.position?.y || 0}px`,
              maxHeight: '400px'
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* 標題欄 - 固定在頂部 */}
            <div className='flex items-center justify-between border-b p-2 flex-shrink-0'>
              {/* 搜尋框 */}
              <div className='relative flex-1 mr-2'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <circle
                      cx='11'
                      cy='11'
                      r='8'></circle>
                    <line
                      x1='21'
                      y1='21'
                      x2='16.65'
                      y2='16.65'></line>
                  </svg>
                </div>
                <input
                  type='text'
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder='Search...'
                  className='w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <button
                onClick={closeInputPanel}
                className='text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <line
                    x1='18'
                    y1='6'
                    x2='6'
                    y2='18'></line>
                  <line
                    x1='6'
                    y1='6'
                    x2='18'
                    y2='18'></line>
                </svg>
              </button>
            </div>

            {/* 節點列表 - 可滾動區域 */}
            <div
              className='flex-1 overflow-y-auto p-4 min-h-0'
              style={{
                maxHeight: 'calc(400px - 60px)'
              }}
              onWheelCapture={(e) => {
                e.stopPropagation();
              }}
              onMouseDownCapture={(e) => e.stopPropagation()}>
              <span className='mb-3 block text-sm font-medium text-gray-700'>
                Input
              </span>
              <div className='flex flex-col items-start'>
                {filteredNodes.map((nodeInfo, index) => (
                  <div
                    key={`${nodeInfo.id}-${index}`}
                    className='flex items-center px-3 py-2 rounded cursor-pointer text-white text-sm font-medium hover:opacity-80 transition-opacity mr-2 mb-2 w-full'
                    style={{ backgroundColor: nodeInfo.color }}
                    onClick={() => handleTagClick(nodeInfo)}
                    onDragStart={(e) => handleTagDragStart(e, nodeInfo)}
                    draggable
                    title='點擊插入或拖拽到文字區域'>
                    <span className='truncate'>{nodeInfo.name}</span>
                  </div>
                ))}

                {filteredNodes.length === 0 && (
                  <div className='text-gray-500 text-sm text-center py-8 w-full'>
                    {filterText ? '沒有找到符合的節點' : '沒有連線的節點'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(CombineTextNode);
