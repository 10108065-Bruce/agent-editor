import React, { useState, useEffect, useRef } from 'react';
import { runHistoryAPIService } from '../services/RunHistoryAPIServie';
import successIcon from '../assets/icon-success.png';
import failedIcon from '../assets/icon-fail.png';
import skipIcon from '../assets/icon-status-skip.png';
import detailIcon from '../assets/icon-detail.png';
import FlowEditor from './FlowEditor';
import IconBase from '../components/icons/IconBase';
import { tokenService } from '../services/TokenService';
import { formatISOToNumeric } from '../utils/timeUtils';
// JSON 樹狀檢視器元件
const JsonTreeViewer = ({ data, name = 'root', defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // 判斷資料類型
  const getType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  // 取得值的顯示內容
  const getPreview = (value, isFullDisplay = false) => {
    const type = getType(value);
    switch (type) {
      case 'null':
        return 'null';
      case 'string':
        // 如果是完整顯示模式，直接返回完整字串
        if (isFullDisplay) {
          return `"${value}"`;
        }
        // 摺疊時仍顯示預覽
        return value.length > 50
          ? `"${value.substring(0, 50)}..."`
          : `"${value}"`;
      case 'number':
      case 'boolean':
        return String(value);
      case 'array':
        return `Array(${value.length})`;
      case 'object':
        return `Object(${Object.keys(value).length})`;
      default:
        return String(value);
    }
  };

  // 取得值的顏色
  const getValueColor = (value) => {
    const type = getType(value);
    switch (type) {
      case 'null':
        return 'text-gray-500';
      case 'string':
        return 'text-green-600';
      case 'number':
        return 'text-blue-600';
      case 'boolean':
        return 'text-purple-600';
      default:
        return 'text-gray-800';
    }
  };

  const type = getType(data);
  const isExpandable = type === 'object' || type === 'array';

  // 如果是簡單值，直接顯示（完整內容，支援換行）
  if (!isExpandable) {
    return (
      <div className='flex items-start py-1'>
        <span className='text-gray-700 font-medium mr-2 flex-shrink-0'>
          {name}:
        </span>
        <span
          className={`${getValueColor(data)} break-all whitespace-pre-wrap`}>
          {getPreview(data, true)}
        </span>
      </div>
    );
  }

  // 取得子項目
  const entries =
    type === 'array'
      ? data.map((item, index) => [index, item])
      : Object.entries(data);

  return (
    <div className='py-1'>
      <div className='flex items-center group'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='mr-1 text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0'>
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </button>
        <span className='text-gray-700 font-medium mr-2'>{name}:</span>
        <span className='text-gray-500 text-sm'>
          {isExpanded ? (type === 'array' ? '[' : '{') : getPreview(data)}
        </span>
      </div>
      {isExpanded && (
        <div className='ml-6 pl-3 pb'>
          {entries.map(([key, value]) => (
            <JsonTreeViewer
              key={key}
              name={key}
              data={value}
              defaultExpanded={false}
            />
          ))}
          <div className='text-gray-500 text-sm -ml-3'>
            {type === 'array' ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  );
};

const RunHistoryView = () => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodeId, setExpandedNodeId] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [ioDialogOpen, setIoDialogOpen] = useState(false);
  const [selectedNodeIO, setSelectedNodeIO] = useState(null);
  const [showFlowEditor, setShowFlowEditor] = useState(true);
  const hasLoadedRef = useRef(false);

  const flowEditorRef = useRef(null);
  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allRuns, setAllRuns] = useState([]); // 儲存所有載入的執行記錄
  const scrollContainerRef = useRef(null); // 用於監聽滾動的容器

  // 當前選擇的執行記錄的 snapshot
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const workFlowId = tokenService.getWorkFlowId();

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadHistory();
      hasLoadedRef.current = true;
    }
  }, []);

  // 監聽滾動事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loadingMore || !hasMore || activeTab !== 'previous') return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // 當滾動到底部附近時（距離底部 100px）
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreHistory();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, activeTab]);

  const loadHistory = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await runHistoryAPIService.getRunHistory(workFlowId, page);

      if (page === 1) {
        // 第一頁：設置初始資料
        setHistoryData(data);
        setAllRuns(data.data || []);
        setHasMore(data.has_more || false);

        // 先清空 snapshot
        setCurrentSnapshot(null);

        // 自動選擇第一筆記錄的 snapshot
        if (
          data &&
          data.data &&
          data.data.length > 0 &&
          data.data[0].workflow_snapshot
        ) {
          // 使用 setTimeout 確保清空後再設置新的 snapshot
          setTimeout(() => {
            if (data?.data?.[0]?.workflow_snapshot) {
              setCurrentSnapshot(data.data[0].workflow_snapshot);
            }
          }, 100);
        }
      } else {
        // 後續頁面：追加資料
        setAllRuns((prevRuns) => [...prevRuns, ...(data.data || [])]);
        setHasMore(data.has_more || false);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error(`載入失敗，第 ${page} 頁:`, error);
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const loadMoreHistory = async () => {
    if (!hasMore || loadingMore) return;
    await loadHistory(currentPage + 1);
  };

  const toggleNodeExpand = (nodeId, runId) => {
    const key = `${runId}_${nodeId}`;
    setExpandedNodeId(expandedNodeId === key ? null : key);
  };

  // 處理雙擊 previous run 項目
  const handleRunDoubleClick = (run) => {
    // 先清空 snapshot
    setCurrentSnapshot(null);

    setTimeout(() => {
      // 切換到 current tab
      setActiveTab('current');

      // 更新 current snapshot
      if (run.workflow_snapshot) {
        setCurrentSnapshot(run.workflow_snapshot);
      }
    }, 100);

    // 更新 historyData，將選中的 run 設為第一筆資料
    setHistoryData((prev) => ({
      ...prev,
      data: [
        run,
        ...(prev?.data || []).filter((r) => r.request_id !== run.request_id)
      ]
    }));
  };

  const handleViewNodeIO = (nodeData, nodeName, nodeId) => {
    const ioData = runHistoryAPIService.getNodeIO(nodeData);
    setSelectedNodeIO({ nodeName, nodeId, data: ioData });
    setIoDialogOpen(true);
  };

  const closeIODialog = () => {
    setIoDialogOpen(false);
    setSelectedNodeIO(null);
  };

  const getStatusIcon = (status) => {
    if (status === 'skipped') {
      return (
        <img
          src={skipIcon}
          alt='skipped'
          width={20}
          height={20}
          className='max-w-full max-h-full object-contain'
        />
      );
    } else if (status === 'success' || status === true) {
      return (
        <img
          src={successIcon}
          alt='success'
          width={20}
          height={20}
          className='max-w-full max-h-full object-contain'
        />
      );
    } else {
      return (
        <img
          src={failedIcon}
          alt='failed'
          width={20}
          height={20}
          className='max-w-full max-h-full object-contain'
        />
      );
    }
  };

  const getIconType = (operator) => {
    if (!operator) return 'input';

    // 轉換為小寫進行比對
    const operatorLower = operator.toLowerCase();

    const iconMap = {
      ai: 'ai',
      browser: 'browser',
      knowledge: 'knowledge',
      line: 'line',
      extract: 'ai',
      aim: 'aim',
      http: 'http',
      schedule: 'schedule',
      webhook_input: 'webhook_input',
      webhook_output: 'webhook_output',
      webhook: 'webhook_output',
      combine: 'combine_text',
      router: 'router_switch',
      speech: 'speech_to_text',
      flow_check: 'flow_check',
      input: 'input'
    };

    // 尋找第一個匹配的關鍵字
    const matchedKey = Object.keys(iconMap).find((key) =>
      operatorLower.includes(key)
    );

    return matchedKey ? iconMap[matchedKey] : 'input'; // 預設使用 input 圖示
  };
  const getNodeIcon = (nodeType) => {
    return (
      <span className='text-lg'>
        {<IconBase type={getIconType(nodeType)} /> || (
          <IconBase type={getIconType('flow_check')} />
        )}
      </span>
    );
  };

  const getNodeDisplayId = (nodeId) => {
    if (!nodeId) return '';
    const lastThree = nodeId.slice(-3);
    return lastThree;
  };

  const formatRunData = (run) => {
    if (!run) return null;

    // 擷取 flow_check 資料
    let flowCheck = null;
    let nodes = [];

    if (run.nodes_execution_summary) {
      nodes = [...run.nodes_execution_summary];
    }

    // 從 flow_check 擷取狀態
    if (run.flow_check) {
      flowCheck = {
        node_id: 'flow_check',
        display_name: 'Flow Check',
        operator: 'flow_check',
        status: run.flow_check.is_valid ? 'success' : 'failed',
        is_valid: run.flow_check.is_valid,
        error: !run.flow_check.is_valid
          ? {
              message: 'Flow validation failed',
              details: run.flow_check.failures || []
            }
          : null
      };
    }

    return {
      ...run,
      flowCheck,
      nodes
    };
  };

  // 格式化時間，轉換為純數字格式的本地時間
  // 格式: YYYY-MM-DD HH:mm:ss (24小時制)
  const formatTime = (timeString) => {
    return formatISOToNumeric(timeString);
  };

  // 將毫秒轉換為秒，保留兩位小數
  const formatDuration = (durationMs) => {
    if (!durationMs && durationMs !== 0) return '0 s';
    return `${(durationMs / 1000).toFixed(2)} s`;
  };

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='max-w-4xl h-[80vh] flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ced1] mx-auto mb-4'></div>
            <p className='text-white'>載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentRun =
    historyData && historyData.data && historyData.data[0]
      ? formatRunData(historyData.data[0])
      : null;
  const previousRuns = allRuns.map((run) => formatRunData(run));

  const initialTitle =
    historyData &&
    historyData.data.length &&
    historyData.data[0] &&
    historyData.data[0].flow_name
      ? historyData.data[0].flow_name
      : '  ';

  return (
    <div className='fixed top-16 left-0 right-0 bottom-0 flex z-50'>
      {/* 左側：FlowEditor（唯讀模式） */}
      {showFlowEditor && (
        <div className='flex-1 bg-gray-50 relative'>
          <FlowEditor
            ref={flowEditorRef}
            initialTitle={initialTitle}
            isLocked={true}
            runhistory={true}
            runHistorySnapshot={currentSnapshot}
            metaData={historyData?.data[0]}
            isCurrentHistoryView={activeTab === 'current'}
          />
        </div>
      )}

      {/* 右側：Run History 面板 */}
      <div
        className={`${
          showFlowEditor ? 'w-[480px]' : 'flex-1'
        } bg-white shadow-2xl flex flex-col overflow-hidden`}>
        {/* Tabs */}
        <div className='flex justify-center px-6 py-3'>
          <div className='inline-flex rounded-lg'>
            <button
              onClick={() => setActiveTab('current')}
              disabled={!currentRun}
              style={
                currentRun
                  ? {}
                  : {
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    }
              }
              className={`px-10 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'current'
                  ? 'bg-[#00ced1] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}>
              Current Run
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              disabled={previousRuns.length === 0}
              style={
                previousRuns.length > 0
                  ? {}
                  : {
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    }
              }
              className={`px-10 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'previous'
                  ? 'bg-[#00ced1] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}>
              Previous Runs
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className='flex-1 overflow-auto p-2'
          ref={scrollContainerRef}>
          {/* Current Run */}
          {activeTab === 'current' &&
            (currentRun ? (
              <div>
                {/* 時間資訊卡片 */}
                <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
                  <div className='flex items-center gap-2 mb-4'>
                    {getStatusIcon(currentRun.status)}
                    <span className='text-lg font-semibold text-gray-800'>
                      {formatTime(currentRun.start_time)}
                    </span>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm font-bold text-gray-600'>
                        Start Time:
                      </span>
                      <span className='text-sm font-medium text-gray-800'>
                        {formatTime(currentRun.start_time)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm font-bold text-gray-600'>
                        End Time:
                      </span>
                      <span className='text-sm font-medium text-gray-800'>
                        {formatTime(currentRun.end_time)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm font-bold text-gray-600'>
                        Duration:
                      </span>
                      <span className='text-sm font-medium text-gray-800'>
                        {formatDuration(currentRun.total_duration_ms)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 節點列表 */}
                <div className='space-y-2'>
                  {/* Flow Check 節點 */}
                  {currentRun.flowCheck && (
                    <div key='flow_check'>
                      <div
                        onClick={() =>
                          toggleNodeExpand('flow_check', currentRun.request_id)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                          currentRun.flowCheck.status === 'failed'
                            ? 'bg-red-50 hover:bg-red-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}>
                        {getStatusIcon(currentRun.flowCheck.is_valid)}
                        {getNodeIcon('flow_check')}
                        <div className='flex-1 min-w-0'>
                          <div className='font-bold text-gray-800 text-sm'>
                            {currentRun.flowCheck.display_name}
                          </div>
                          {currentRun.flowCheck.error && (
                            <div className='text-xs text-red-600 mt-1 truncate'>
                              {currentRun.flowCheck.error.message}
                            </div>
                          )}
                        </div>
                        <svg
                          className={`w-4 h-4 mr-2 text-gray-400 transition-transform flex-shrink-0 ${
                            expandedNodeId ===
                            `${currentRun.request_id}_flow_check`
                              ? 'rotate-180'
                              : ''
                          }`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>

                      {/* Flow Check 展開內容 */}
                      {expandedNodeId ===
                        `${currentRun.request_id}_flow_check` && (
                        <div className='mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm'>
                          <div className='space-y-2'>
                            <div>
                              <div className='text-xs font-medium text-gray-700 mb-1'>
                                狀態:{' '}
                                {currentRun.flowCheck.is_valid
                                  ? 'Valid'
                                  : 'Invalid'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 其他節點 */}
                  {currentRun.nodes.map((node) => (
                    <div key={node.node_id}>
                      <div
                        onClick={() =>
                          toggleNodeExpand(node.node_id, currentRun.request_id)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                          node.status === 'failed'
                            ? 'bg-red-50 hover:bg-red-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}>
                        {getStatusIcon(node.status)}
                        {getNodeIcon(node.operator)}
                        <div className='flex-1 min-w-0'>
                          <div className='font-bold text-gray-800 text-sm'>
                            {node.display_name}
                          </div>
                          {node.error && (
                            <div className='text-xs text-red-600 mt-1 truncate'>
                              {node.error}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // 直接調用 FlowEditor 的 focusNode 方法
                            if (
                              flowEditorRef.current &&
                              flowEditorRef.current.focusNode
                            ) {
                              setTimeout(() => {
                                flowEditorRef.current.focusNode(node.node_id);
                              }, 100);
                            }
                          }}
                          className='text-xs text-gray-500 border border-gray-300 rounded-full px-2 py-1 hover:bg-gray-100 hover:text-[#00ced1] hover:border-[#00ced1] transition-all cursor-pointer'
                          title='點擊聚焦到此節點'>
                          {getNodeDisplayId(node.node_id)}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewNodeIO(
                              node,
                              node.display_name,
                              node.node_id
                            );
                          }}
                          className='text-[#00ced1] hover:text-[#00b8bb] transition-colors p-1'>
                          <img
                            src={detailIcon}
                            className='w-5 h-5'
                            alt='view io'
                          />
                        </button>
                        <svg
                          className={`w-4 h-4 mr-2 text-gray-400 transition-transform flex-shrink-0 ${
                            expandedNodeId ===
                            `${currentRun.request_id}_${node.node_id}`
                              ? 'rotate-180'
                              : ''
                          }`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>

                      {/* 節點展開內容 */}
                      {expandedNodeId ===
                        `${currentRun.request_id}_${node.node_id}` && (
                        <div
                          className={`mt-2 p-3 rounded-lg border text-sm ${
                            node.status === 'failed'
                              ? 'bg-red-100 border-red-200'
                              : 'bg-gray-100 border-gray-200'
                          }`}>
                          <div className='space-y-2'>
                            <div>
                              <div className='text-xs font-medium text-gray-700 mb-1'>
                                節點 ID: {node.node_id}
                              </div>
                            </div>
                            <div>
                              <div className='text-xs font-medium text-gray-700 mb-1'>
                                狀態: {node.status}
                              </div>
                            </div>
                            <div>
                              <div className='text-xs font-medium text-gray-700 mb-1'>
                                執行時間: {formatDuration(node.duration_ms)}
                              </div>
                            </div>
                            {node.error && (
                              <div>
                                <div className='text-xs font-medium text-gray-700 mb-1'>
                                  錯誤訊息:
                                </div>
                                <div className='text-xs text-red-700'>
                                  {node.error}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-500 mt-10'>
                尚無執行記錄
              </div>
            ))}

          {/* Previous Runs */}
          {activeTab === 'previous' && previousRuns && (
            <div className='space-y-4'>
              {previousRuns.map((run) => (
                <div
                  key={run.request_id}
                  className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                  <div
                    onClick={() => handleRunDoubleClick(run)}
                    onDoubleClick={() => handleRunDoubleClick(run)}
                    className='p-4 cursor-pointer hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4 flex-1'>
                        {getStatusIcon(run.status)}
                        <div>
                          <div className='font-medium text-gray-800'>
                            {/* 檢查 start_time 是否存在 */}
                            {formatTime(run.start_time)}
                          </div>
                          <div className='text-sm text-gray-500'>
                            Duration: {formatDuration(run.total_duration_ms)}
                          </div>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform -rotate-90`}
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              {/* 載入更多的指示器 */}
              {loadingMore && (
                <div className='text-center py-4'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ced1] mx-auto mb-2'></div>
                  <p className='text-gray-600 text-sm'>載入更多</p>
                </div>
              )}

              {/* 沒有更多資料的提示 */}
              {!hasMore && previousRuns.length > 0 && (
                <div className='text-center py-4'>
                  <p className='text-gray-500 text-sm'>已載入所有資料</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Node I/O Dialog */}
      {ioDialogOpen && selectedNodeIO && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]'
          onClick={closeIODialog}>
          <div
            className='bg-white rounded-lg shadow-2xl w-[95%] max-w-5xl h-[80vh] flex flex-col'
            onClick={(e) => e.stopPropagation()}>
            {/* Dialog Header */}
            <div className='flex items-center justify-between p-6 pb-2 pt-3 border-b border-gray-200'>
              <div>
                <p className='text-sm text-gray-500 mt-1 font-bold flex items-center gap-2'>
                  {<IconBase type={getIconType(selectedNodeIO.nodeId)} />}
                  {selectedNodeIO.nodeName}
                  {selectedNodeIO.nodeId && (
                    <span className='ml-2 text-xs text-gray-400'>
                      ({getNodeDisplayId(selectedNodeIO.nodeId)})
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeIODialog}
                className='text-gray-400 hover:text-gray-600 transition-colors'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Dialog Content */}
            <div className='flex-1 p-6 min-h-0'>
              <div className='grid grid-cols-2 gap-6 h-full'>
                {/* INPUTS */}
                <div className='flex flex-col min-h-0'>
                  <h4 className='text-sm font-semibold text-gray-700 mb-4 uppercase flex-shrink-0'>
                    INPUTS
                  </h4>
                  <div className='flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto min-h-0'>
                    <pre className='text-xs whitespace-pre-wrap break-words'>
                      <JsonTreeViewer
                        data={selectedNodeIO.data?.inputs || {}}
                        name='inputs'
                        defaultExpanded={true}
                      />
                    </pre>
                  </div>
                </div>

                {/* OUTPUTS */}
                <div className='flex flex-col min-h-0'>
                  <h4 className='text-sm font-semibold text-gray-700 mb-4 uppercase flex-shrink-0'>
                    OUTPUTS
                  </h4>
                  <div className='flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto min-h-0'>
                    <pre className='text-xs whitespace-pre-wrap break-words'>
                      <JsonTreeViewer
                        data={selectedNodeIO.data?.outputs || {}}
                        name='outputs'
                        defaultExpanded={true}
                      />
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunHistoryView;
