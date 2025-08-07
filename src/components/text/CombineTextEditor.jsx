import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react';

const CombineTextEditor = forwardRef(
  (
    {
      value,
      onChange,
      onCompositionStart,
      onCompositionEnd,
      onKeyDown,
      placeholder,
      className,
      flowId,
      onTagInsert,
      initialHtmlContent,
      shouldShowPanel,
      showInputPanel,
      onShowPanel,
      ...props
    },
    ref
  ) => {
    const editorRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // 關鍵修改：不再通過 state 管理內容，而是直接操作 DOM
    const isUpdatingFromExternal = useRef(false);
    const lastReportedValue = useRef('');

    // 預設內容生成
    const generateDefaultContent = useCallback(() => {
      return JSON.stringify(
        {
          flow_id: flowId || 'default-flow-id',
          func_id: '',
          data: ''
        },
        null,
        2
      );
    }, [flowId]);

    // 獲取編輯器的純文字內容（替換標籤為其代碼，排除x按鈕）
    const getEditorTextContent = useCallback(() => {
      if (!editorRef.current) return '';

      let content = '';
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) {
          // 跳過刪除按鈕的文字內容
          if (node.parentElement?.classList?.contains('delete-btn')) {
            continue;
          }
          content += node.textContent;
        } else if (node.classList && node.classList.contains('inline-tag')) {
          const tagData = node.getAttribute('data-tag-data');
          if (tagData) {
            content += tagData;
          }
        }
      }

      return content;
    }, []);

    // 處理內容變更 - 重新設計，避免重新設置 DOM 內容
    const handleContentChange = useCallback(() => {
      if (isComposing || isRestoring || isUpdatingFromExternal.current) return;

      const textContent = getEditorTextContent();

      // 只有當內容真的變化時才通知父組件
      if (textContent !== lastReportedValue.current) {
        lastReportedValue.current = textContent;

        if (onChange) {
          onChange({
            target: {
              value: textContent
            }
          });
        }
      }
    }, [onChange, getEditorTextContent, isComposing, isRestoring]);

    // 設置游標到指定位置
    const setCursorPosition = useCallback((x, y) => {
      if (!editorRef.current) return;

      let range;

      // 使用 document.caretRangeFromPoint 獲取精確位置
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
      } else if (document.caretPositionFromPoint) {
        const caretPos = document.caretPositionFromPoint(x, y);
        if (caretPos) {
          range = document.createRange();
          range.setStart(caretPos.offsetNode, caretPos.offset);
          range.collapse(true);
        }
      }

      if (range && editorRef.current.contains(range.startContainer)) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }

      // 降級方案：設置到編輯器末尾
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return false;
    }, []);

    // 在游標位置插入標籤
    const insertTagAtCursor = useCallback(
      (tagInfo) => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        let range;

        // 確保編輯器有焦點
        if (!editorRef.current.contains(document.activeElement)) {
          editorRef.current.focus();
        }

        // 獲取當前選擇範圍
        if (selection.rangeCount === 0) {
          range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
        } else {
          range = selection.getRangeAt(0);
          if (!editorRef.current.contains(range.startContainer)) {
            range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
          }
        }

        // 創建新標籤
        const newTag = {
          id: Date.now(),
          name: tagInfo.name,
          data: tagInfo.data || tagInfo.code,
          color: tagInfo.color
        };

        setTags((prev) => [...prev, newTag]);

        // 創建標籤元素
        const tagElement = document.createElement('span');
        tagElement.className = 'inline-tag';
        tagElement.setAttribute('data-tag-id', newTag.id);
        tagElement.setAttribute('data-tag-data', newTag.data);
        tagElement.style.cssText = `
          display: inline-block;
          background-color: ${newTag.color};
          color: white;
          padding: 4px 8px;
          margin: 2px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        `;
        tagElement.contentEditable = false;

        // 創建標籤內容
        const tagContent = document.createElement('span');
        tagContent.textContent = newTag.name;
        tagElement.appendChild(tagContent);

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.style.cssText =
          'margin-left: 6px; cursor: pointer; font-weight: bold;';
        tagElement.appendChild(deleteBtn);

        // 插入標籤
        range.deleteContents();
        range.insertNode(tagElement);

        // 插入空格
        const spaceNode = document.createTextNode('\u00A0');
        tagElement.after(spaceNode);

        // 將游標移到空格後面
        range.setStartAfter(spaceNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        // 通知內容變更
        handleContentChange();

        // 通知父組件標籤已插入
        if (onTagInsert) {
          onTagInsert(newTag);
        }

        editorRef.current.focus();
      },
      [onTagInsert, handleContentChange]
    );

    // 刪除標籤
    const removeTag = useCallback(
      (tagId) => {
        const numericTagId =
          typeof tagId === 'string' ? parseInt(tagId) : tagId;
        setTags((prev) => prev.filter((tag) => tag.id !== numericTagId));
        setSelectedTag((prev) => (prev?.id === numericTagId ? null : prev));

        // 刪除 DOM 中的標籤元素
        const tagElement = document.querySelector(
          `[data-tag-id="${numericTagId}"]`
        );
        if (tagElement) {
          const selection = window.getSelection();
          const range = document.createRange();

          range.setStartBefore(tagElement);
          range.collapse(true);

          const nextNode = tagElement.nextSibling;
          tagElement.remove();

          if (
            nextNode &&
            nextNode.nodeType === Node.TEXT_NODE &&
            /^[\u00A0\s]*$/.test(nextNode.nodeValue)
          ) {
            nextNode.remove();
          }

          selection.removeAllRanges();
          selection.addRange(range);

          handleContentChange();
        }
      },
      [handleContentChange]
    );

    // 暴露給父組件的方法
    useImperativeHandle(ref, () => ({
      insertTagAtCursor: (tagData) => {
        insertTagAtCursor(tagData);
      },
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
      getValue: () => {
        return getEditorTextContent();
      },
      get innerHTML() {
        return editorRef.current ? editorRef.current.innerHTML : '';
      },
      set innerHTML(content) {
        if (editorRef.current) {
          isUpdatingFromExternal.current = true;
          editorRef.current.innerHTML = content;
          setTimeout(() => {
            isUpdatingFromExternal.current = false;
          }, 100);
        }
      }
    }));

    // 處理編輯器點擊事件
    const handleEditorClick = useCallback(
      (e) => {
        const tagElement = e.target.closest('.inline-tag');

        if (tagElement) {
          // 點擊標籤的邏輯
          const tagId = parseInt(tagElement.getAttribute('data-tag-id'));
          const tagData = tagElement.getAttribute('data-tag-data');

          if (e.target.classList.contains('delete-btn')) {
            e.preventDefault();
            e.stopPropagation();
            removeTag(tagId);
            return;
          } else {
            // 點擊標籤進行複製
            e.preventDefault();
            e.stopPropagation();

            if (tagData) {
              navigator.clipboard
                .writeText(tagData)
                .then(() => {
                  const originalBg = tagElement.style.backgroundColor;
                  tagElement.style.backgroundColor = '#10B981';
                  setTimeout(() => {
                    tagElement.style.backgroundColor = originalBg;
                  }, 200);
                })
                .catch(() => {
                  // 降級方案
                  const textArea = document.createElement('textarea');
                  textArea.value = tagData;
                  textArea.style.position = 'fixed';
                  textArea.style.left = '-999999px';
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  try {
                    document.execCommand('copy');
                  } catch (err) {
                    console.error('複製失敗:', err);
                  }
                  document.body.removeChild(textArea);
                  editorRef.current?.focus();
                });
            }

            // 更新選中狀態
            const currentTag = tags.find((tag) => tag.id === tagId);
            const isCurrentlySelected = selectedTag?.id === tagId;

            document.querySelectorAll('.inline-tag').forEach((tag) => {
              tag.style.boxShadow = '';
            });

            if (isCurrentlySelected) {
              setSelectedTag(null);
            } else if (currentTag) {
              setSelectedTag(currentTag);
              tagElement.style.boxShadow = '0 0 0 2px #3b82f6';
            }
            return;
          }
        }

        // 點擊空白區域的邏輯
        setSelectedTag(null);
        document.querySelectorAll('.inline-tag').forEach((tag) => {
          tag.style.boxShadow = '';
        });

        // 設置游標位置
        const rect = editorRef.current.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        editorRef.current.focus();
        setCursorPosition(x, y);

        // Panel邏輯處理
        if (shouldShowPanel && onShowPanel) {
          if (showInputPanel) {
            onShowPanel(false);
          } else {
            setTimeout(() => {
              onShowPanel(true);
            }, 100);
          }
        }
      },
      [
        tags,
        selectedTag,
        removeTag,
        shouldShowPanel,
        showInputPanel,
        onShowPanel,
        setCursorPosition
      ]
    );

    // 處理鍵盤事件
    const handleKeyDown = useCallback(
      (e) => {
        if (onKeyDown) {
          onKeyDown(e);
          if (e.defaultPrevented) {
            return;
          }
        }

        // Ctrl+C 複製選中標籤
        if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedTag) {
          e.preventDefault();
          navigator.clipboard.writeText(selectedTag.data);
          return;
        }

        // 刪除鍵處理
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (selectedTag) {
            e.preventDefault();
            removeTag(selectedTag.id);
            return;
          }

          const selection = window.getSelection();
          if (!selection.rangeCount) return;

          const range = selection.getRangeAt(0);
          if (!range.collapsed) return;

          let tagToDelete = null;

          if (e.key === 'Backspace') {
            const container = range.startContainer;
            const offset = range.startOffset;

            if (container.nodeType === Node.TEXT_NODE) {
              if (
                offset === 0 &&
                container.previousSibling?.classList?.contains('inline-tag')
              ) {
                tagToDelete = container.previousSibling;
              }
            } else {
              if (offset > 0) {
                const prevNode = container.childNodes[offset - 1];
                if (prevNode?.classList?.contains('inline-tag')) {
                  tagToDelete = prevNode;
                }
              }
            }
          } else if (e.key === 'Delete') {
            const container = range.endContainer;
            const offset = range.endOffset;

            if (container.nodeType === Node.TEXT_NODE) {
              if (
                offset === container.textContent.length &&
                container.nextSibling?.classList?.contains('inline-tag')
              ) {
                tagToDelete = container.nextSibling;
              }
            } else {
              if (offset < container.childNodes.length) {
                const nextNode = container.childNodes[offset];
                if (nextNode?.classList?.contains('inline-tag')) {
                  tagToDelete = nextNode;
                }
              }
            }
          }

          if (tagToDelete) {
            e.preventDefault();
            const tagId = parseInt(tagToDelete.getAttribute('data-tag-id'));
            removeTag(tagId);
          }
        }
      },
      [selectedTag, removeTag, onKeyDown]
    );

    // IME 處理
    const handleCompositionStart = useCallback(
      (e) => {
        setIsComposing(true);
        if (onCompositionStart) {
          onCompositionStart(e);
        }
      },
      [onCompositionStart]
    );

    const handleCompositionEnd = useCallback(
      (e) => {
        setIsComposing(false);
        setTimeout(() => {
          handleContentChange();
        }, 0);
        if (onCompositionEnd) {
          onCompositionEnd(e);
        }
      },
      [onCompositionEnd, handleContentChange]
    );

    // 處理輸入
    const handleInput = useCallback(
      (e) => {
        if (!isComposing && !isRestoring && !isUpdatingFromExternal.current) {
          // 使用 setTimeout 來延遲處理，避免阻塞輸入
          setTimeout(() => {
            handleContentChange();
          }, 0);
        }
      },
      [isComposing, isRestoring, handleContentChange]
    );

    // 自動調整高度
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const resizeObserver = new ResizeObserver(() => {
        editor.style.height = 'auto';
        const scrollHeight = Math.max(editor.scrollHeight, 60);
        editor.style.height = `${Math.min(scrollHeight, 400)}px`;
      });

      resizeObserver.observe(editor);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // 處理初始 HTML 內容恢復
    useEffect(() => {
      if (initialHtmlContent && editorRef.current && !isInitialized) {
        setIsRestoring(true);
        isUpdatingFromExternal.current = true;

        editorRef.current.innerHTML = initialHtmlContent;
        lastReportedValue.current = getEditorTextContent();

        const tagElements = editorRef.current.querySelectorAll('.inline-tag');
        const restoredTags = [];
        tagElements.forEach((element) => {
          const tagId = parseInt(element.getAttribute('data-tag-id'));
          const tagData = element.getAttribute('data-tag-data');
          if (!isNaN(tagId) && tagData) {
            const tagNameElement = element.querySelector(
              'span:not(.delete-btn)'
            );
            const tagName = tagNameElement
              ? tagNameElement.textContent.trim()
              : 'Tag';

            restoredTags.push({
              id: tagId,
              data: tagData,
              name: tagName
            });
          }
        });
        setTags(restoredTags);
        setIsInitialized(true);

        setTimeout(() => {
          setIsRestoring(false);
          isUpdatingFromExternal.current = false;
        }, 100);
      }
    }, [initialHtmlContent, isInitialized, getEditorTextContent]);

    // 初始化預設內容
    useEffect(() => {
      if (
        !initialHtmlContent &&
        editorRef.current &&
        (!value || value === '') &&
        editorRef.current.textContent === '' &&
        !isInitialized
      ) {
        const defaultContent = generateDefaultContent();
        isUpdatingFromExternal.current = true;
        editorRef.current.textContent = defaultContent;
        lastReportedValue.current = defaultContent;
        setIsInitialized(true);

        setTimeout(() => {
          isUpdatingFromExternal.current = false;
          handleContentChange();
        }, 100);
      }
    }, [
      value,
      generateDefaultContent,
      handleContentChange,
      initialHtmlContent,
      isInitialized
    ]);

    // 處理外部 value 變更 - 只在必要時更新 DOM
    useEffect(() => {
      if (
        isInitialized &&
        value !== undefined &&
        value !== lastReportedValue.current &&
        !isUpdatingFromExternal.current &&
        !isFocused
      ) {
        // 只在失去焦點時才從外部更新內容

        isUpdatingFromExternal.current = true;
        editorRef.current.textContent = value;
        lastReportedValue.current = value;

        setTimeout(() => {
          isUpdatingFromExternal.current = false;
        }, 100);
      }
    }, [value, isInitialized, isFocused]);

    // 聚焦處理
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const handleFocus = () => setIsFocused(true);
      const handleBlur = () => {
        setIsFocused(false);
        // 失焦時確保最後一次更新
        setTimeout(() => {
          if (!isUpdatingFromExternal.current) {
            handleContentChange();
          }
        }, 0);
      };

      editor.addEventListener('focus', handleFocus);
      editor.addEventListener('blur', handleBlur);

      return () => {
        editor.removeEventListener('focus', handleFocus);
        editor.removeEventListener('blur', handleBlur);
      };
    }, [handleContentChange]);

    // 拖動控制
    useEffect(() => {
      if (isFocused) {
        const findReactFlowNode = (element) => {
          let current = element;
          while (current && !current.classList?.contains('react-flow__node')) {
            current = current.parentElement;
          }
          return current;
        };

        const reactFlowNode = findReactFlowNode(editorRef.current);

        if (reactFlowNode) {
          reactFlowNode._originalClassName = reactFlowNode.className;
          reactFlowNode.classList.add('nodrag');
        }

        return () => {
          if (reactFlowNode && reactFlowNode._originalClassName) {
            reactFlowNode.className = reactFlowNode._originalClassName;
            delete reactFlowNode._originalClassName;
          }
        };
      }
    }, [isFocused]);

    // 滾輪事件處理
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const handleWheelCapture = (e) => {
        if (isFocused && (e.target === editor || editor.contains(e.target))) {
          e.stopPropagation();

          const isAtTop = editor.scrollTop <= 0;
          const isAtBottom =
            Math.abs(
              editor.scrollTop + editor.clientHeight - editor.scrollHeight
            ) <= 1;

          if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
            e.preventDefault();
          }
        }
      };

      const preventZoom = (e) => {
        if (
          isFocused &&
          (e.ctrlKey || e.metaKey) &&
          (e.target === editor || editor.contains(e.target))
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener('wheel', handleWheelCapture, {
        passive: false,
        capture: true
      });
      document.addEventListener('wheel', preventZoom, {
        passive: false,
        capture: true
      });

      return () => {
        document.removeEventListener('wheel', handleWheelCapture, {
          passive: false,
          capture: true
        });
        document.removeEventListener('wheel', preventZoom, {
          passive: false,
          capture: true
        });
      };
    }, [isFocused]);

    return (
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onClick={handleEditorClick}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className={`
          w-full 
          border 
          border-gray-300 
          rounded 
          p-3 
          text-sm 
          resize-none 
          overflow-auto 
          min-h-[60px] 
          max-h-[400px]
          font-mono
          ${isFocused ? 'z-50 shadow-md border-blue-400' : ''} 
          ${className}
        `}
        style={{
          fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          ...props.style
        }}
        data-placeholder={placeholder}
        {...props}
      />
    );
  }
);

CombineTextEditor.displayName = 'CombineTextEditor';

export default CombineTextEditor;
