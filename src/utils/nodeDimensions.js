// 節點尺寸計算工具函數

/**
 * 動態計算節點尺寸，考慮節點內容
 * @param {Object} node - 節點對象
 * @returns {Object} - {width, height}
 */
export const calculateNodeDimensions = (node) => {
  const baseWidth = 256;
  const baseHeight = 120;

  switch (node.type) {
    case 'customInput': {
      // 根據欄位數量調整高度
      const fieldCount = node.data?.fields?.length || 1;
      return {
        width: baseWidth,
        height: Math.max(baseHeight + 60, baseHeight + fieldCount * 80)
      };
    }

    case 'aiCustomInput':
      return {
        width: baseWidth,
        height: baseHeight + 100 // 220
      };

    case 'browserExtensionInput': {
      // 根據項目數量動態調整高度
      const itemCount = node.data?.items?.length || 1;
      return {
        width: baseWidth,
        height: Math.max(baseHeight + 130, baseHeight + 60 + itemCount * 120)
      };
    }

    case 'browserExtensionOutput': {
      // 根據輸入 handle 數量動態調整高度
      const handleCount = node.data?.inputHandles?.length || 1;
      return {
        width: baseWidth,
        height: Math.max(baseHeight + 80, baseHeight + 30 + handleCount * 50)
      };
    }

    case 'line_webhook_input':
      return {
        width: 320, // Line 節點較寬
        height: baseHeight + 60 // 180
      };

    case 'line_send_message':
      return {
        width: 320, // Line 節點較寬
        height: baseHeight + 80 // 200
      };

    case 'ifElse':
      return {
        width: baseWidth,
        height: baseHeight + 60 // 180
      };

    case 'knowledgeRetrieval':
      return {
        width: baseWidth,
        height: baseHeight + 40 // 160
      };

    case 'end':
      return {
        width: baseWidth,
        height: baseHeight + 20 // 140
      };

    case 'webhook': {
      // 根據是否有 URL 調整高度
      const hasUrl = node.data?.webhookUrl;
      return {
        width: baseWidth,
        height: hasUrl ? baseHeight + 60 : baseHeight + 40 // 180 : 160
      };
    }

    case 'http':
      return {
        width: baseWidth,
        height: baseHeight + 40 // 160
      };

    case 'timer':
      return {
        width: baseWidth,
        height: baseHeight + 80 // 200
      };

    case 'event':
      return {
        width: baseWidth,
        height: baseHeight + 60 // 180
      };

    default:
      return {
        width: baseWidth * 0.78, // 200
        height: baseHeight - 20 // 100
      };
  }
};

/**
 * 獲取所有節點類型的基本尺寸映射
 * 用於 dagre 自動排版時的快速查找
 */
export const getNodeDimensionsMap = () => {
  return {
    customInput: { width: 256, height: 200 },
    aiCustomInput: { width: 256, height: 220 },
    browserExtensionInput: { width: 256, height: 320 },
    browserExtensionOutput: { width: 256, height: 280 },
    ifElse: { width: 256, height: 180 },
    knowledgeRetrieval: { width: 256, height: 160 },
    end: { width: 256, height: 140 },
    webhook: { width: 256, height: 180 },
    http: { width: 256, height: 160 },
    timer: { width: 256, height: 200 },
    event: { width: 256, height: 180 },
    line_webhook_input: { width: 320, height: 180 },
    line_send_message: { width: 320, height: 200 },
    default: { width: 200, height: 100 }
  };
};

/**
 * 根據排版方向調整間距參數
 * @param {string} direction - 排版方向 (TB, BT, LR, RL)
 * @returns {Object} - dagre 佈局配置
 */
export const getLayoutConfig = (direction) => {
  const baseConfig = {
    rankdir: direction,
    align: 'UL', // 對齊方式，減少交叉
    ranker: 'tight-tree', // 使用緊密樹狀排列，減少交叉
    marginx: 100,
    marginy: 100
  };

  switch (direction) {
    case 'LR': // 左到右
      return {
        ...baseConfig,
        align: 'UL', // 上左對齊
        nodesep: 120, // 增加垂直間距
        edgesep: 80, // 增加邊緣間距
        ranksep: 200, // 大幅增加水平間距
        marginx: 120,
        marginy: 120,
        acyclicer: 'greedy', // 使用貪婪算法減少循環
        ranker: 'tight-tree' // 緊密樹狀排列
      };

    case 'RL': // 右到左
      return {
        ...baseConfig,
        align: 'UR', // 上右對齊
        nodesep: 120,
        edgesep: 80,
        ranksep: 200,
        marginx: 120,
        marginy: 120,
        acyclicer: 'greedy',
        ranker: 'tight-tree'
      };

    case 'TB': // 上到下（默認）
      return {
        ...baseConfig,
        align: 'UL', // 上左對齊
        nodesep: 150, // 增加水平間距，避免寬節點交叉
        edgesep: 60,
        ranksep: 140, // 增加垂直間距
        marginx: 120,
        marginy: 100,
        acyclicer: 'greedy',
        ranker: 'tight-tree'
      };

    case 'BT': // 下到上
      return {
        ...baseConfig,
        align: 'DL', // 下左對齊
        nodesep: 150,
        edgesep: 60,
        ranksep: 140,
        marginx: 120,
        marginy: 100,
        acyclicer: 'greedy',
        ranker: 'tight-tree'
      };

    default:
      return {
        ...baseConfig,
        align: 'UL',
        nodesep: 120,
        edgesep: 60,
        ranksep: 140,
        marginx: 100,
        marginy: 100,
        acyclicer: 'greedy',
        ranker: 'tight-tree'
      };
  }
};

/**
 * 計算節點最小所需空間
 * @param {Array} nodes - 節點數組
 * @returns {Object} - {totalWidth, totalHeight, avgWidth, avgHeight}
 */
export const calculateCanvasSpace = (nodes) => {
  if (!nodes || nodes.length === 0) {
    return { totalWidth: 0, totalHeight: 0, avgWidth: 0, avgHeight: 0 };
  }

  let totalWidth = 0;
  let totalHeight = 0;

  nodes.forEach((node) => {
    const dimensions = calculateNodeDimensions(node);
    totalWidth += dimensions.width;
    totalHeight += dimensions.height;
  });

  return {
    totalWidth,
    totalHeight,
    avgWidth: totalWidth / nodes.length,
    avgHeight: totalHeight / nodes.length
  };
};

/**
 * 預估自動排版所需的畫布尺寸
 * @param {Array} nodes - 節點數組
 * @param {string} direction - 排版方向
 * @returns {Object} - {estimatedWidth, estimatedHeight}
 */
export const estimateLayoutCanvasSize = (nodes, direction = 'TB') => {
  if (!nodes || nodes.length === 0) {
    return { estimatedWidth: 800, estimatedHeight: 600 };
  }

  const canvasSpace = calculateCanvasSpace(nodes);
  const layoutConfig = getLayoutConfig(direction);

  // 基於方向計算預估尺寸
  if (direction === 'LR' || direction === 'RL') {
    // 水平排列：寬度較大，高度較小
    return {
      estimatedWidth:
        canvasSpace.totalWidth +
        (nodes.length - 1) * layoutConfig.ranksep +
        layoutConfig.marginx * 2,
      estimatedHeight:
        canvasSpace.avgHeight * Math.ceil(Math.sqrt(nodes.length)) +
        layoutConfig.marginy * 2
    };
  } else {
    // 垂直排列：高度較大，寬度較小
    return {
      estimatedWidth:
        canvasSpace.avgWidth * Math.ceil(Math.sqrt(nodes.length)) +
        layoutConfig.marginx * 2,
      estimatedHeight:
        canvasSpace.totalHeight +
        (nodes.length - 1) * layoutConfig.ranksep +
        layoutConfig.marginy * 2
    };
  }
};

/**
 * 檢測節點重疊
 * @param {Array} nodes - 節點數組
 * @returns {Array} - 重疊的節點對
 */
export const detectNodeOverlaps = (nodes) => {
  const overlaps = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      const dim1 = calculateNodeDimensions(node1);
      const dim2 = calculateNodeDimensions(node2);

      // 計算節點邊界
      const rect1 = {
        left: node1.position.x,
        right: node1.position.x + dim1.width,
        top: node1.position.y,
        bottom: node1.position.y + dim1.height
      };

      const rect2 = {
        left: node2.position.x,
        right: node2.position.x + dim2.width,
        top: node2.position.y,
        bottom: node2.position.y + dim2.height
      };

      // 檢查重疊
      if (
        !(
          rect1.right < rect2.left ||
          rect2.right < rect1.left ||
          rect1.bottom < rect2.top ||
          rect2.bottom < rect1.top
        )
      ) {
        overlaps.push({
          node1: node1.id,
          node2: node2.id,
          severity: calculateOverlapSeverity(rect1, rect2)
        });
      }
    }
  }

  return overlaps;
};

/**
 * 計算重疊嚴重程度
 * @param {Object} rect1 - 第一個矩形
 * @param {Object} rect2 - 第二個矩形
 * @returns {number} - 重疊面積
 */
const calculateOverlapSeverity = (rect1, rect2) => {
  const overlapWidth =
    Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
  const overlapHeight =
    Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top);
  return overlapWidth * overlapHeight;
};

/**
 * 分析連線複雜度並建議最佳排版方向
 * @param {Array} nodes - 節點數組
 * @param {Array} edges - 邊緣數組
 * @returns {Object} - 分析結果和建議
 */
export const analyzeConnectionComplexity = (nodes, edges) => {
  const analysis = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    crossingPotential: {
      TB: 0,
      LR: 0,
      BT: 0,
      RL: 0
    },
    recommendations: []
  };

  // 計算每個方向的潛在交叉數量
  const directions = ['TB', 'LR', 'BT', 'RL'];

  directions.forEach((direction) => {
    let crossingScore = 0;

    // 簡化的交叉預測算法
    edges.forEach((edge1, i) => {
      edges.forEach((edge2, j) => {
        if (i >= j) return;

        const source1 = nodes.find((n) => n.id === edge1.source);
        const target1 = nodes.find((n) => n.id === edge1.target);
        const source2 = nodes.find((n) => n.id === edge2.source);
        const target2 = nodes.find((n) => n.id === edge2.target);

        if (!source1 || !target1 || !source2 || !target2) return;

        // 根據方向計算潛在交叉
        if (direction === 'TB' || direction === 'BT') {
          // 垂直排列時，檢查水平位置關係
          const horizontalCrossing =
            (source1.position?.x < source2.position?.x &&
              target1.position?.x > target2.position?.x) ||
            (source1.position?.x > source2.position?.x &&
              target1.position?.x < target2.position?.x);
          if (horizontalCrossing) crossingScore += 1;
        } else {
          // 水平排列時，檢查垂直位置關係
          const verticalCrossing =
            (source1.position?.y < source2.position?.y &&
              target1.position?.y > target2.position?.y) ||
            (source1.position?.y > source2.position?.y &&
              target1.position?.y < target2.position?.y);
          if (verticalCrossing) crossingScore += 1;
        }
      });
    });

    analysis.crossingPotential[direction] = crossingScore;
  });

  // 生成建議
  const bestDirection = Object.keys(analysis.crossingPotential).reduce((a, b) =>
    analysis.crossingPotential[a] < analysis.crossingPotential[b] ? a : b
  );

  analysis.recommendedDirection = bestDirection;

  // 添加具體建議
  if (analysis.edgeCount > analysis.nodeCount * 1.5) {
    analysis.recommendations.push('複雜連線：建議使用樹狀排列減少交叉');
  }

  if (analysis.nodeCount > 10) {
    analysis.recommendations.push('大型流程：建議分階段排版或使用分層佈局');
  }

  const maxCrossing = Math.max(...Object.values(analysis.crossingPotential));
  if (maxCrossing > 5) {
    analysis.recommendations.push('高交叉風險：考慮重構流程或手動調整');
  }

  return analysis;
};

/**
 * 優化的排版配置，根據連線複雜度動態調整
 * @param {string} direction - 排版方向
 * @param {Object} complexity - 連線複雜度分析結果
 * @returns {Object} - 優化的 dagre 配置
 */
export const getOptimizedLayoutConfig = (direction, complexity) => {
  const baseConfig = getLayoutConfig(direction);

  // 根據複雜度調整配置
  if (complexity.edgeCount > complexity.nodeCount * 2) {
    // 高密度連線：增加間距
    baseConfig.nodesep = Math.round(baseConfig.nodesep * 1.3);
    baseConfig.ranksep = Math.round(baseConfig.ranksep * 1.2);
    baseConfig.edgesep = Math.round(baseConfig.edgesep * 1.5);
  }

  if (complexity.crossingPotential[direction] > 3) {
    // 高交叉風險：進一步增加間距
    baseConfig.nodesep = Math.round(baseConfig.nodesep * 1.2);
    baseConfig.ranksep = Math.round(baseConfig.ranksep * 1.3);

    // 使用更嚴格的對齊
    if (direction === 'TB') baseConfig.align = 'UL';
    if (direction === 'LR') baseConfig.align = 'UL';
    if (direction === 'BT') baseConfig.align = 'DL';
    if (direction === 'RL') baseConfig.align = 'UR';
  }

  // 如果節點數量很多，增加邊距
  if (complexity.nodeCount > 15) {
    baseConfig.marginx = Math.round(baseConfig.marginx * 1.4);
    baseConfig.marginy = Math.round(baseConfig.marginy * 1.4);
  }

  // 如果有很多交叉，使用更保守的排版策略
  const totalCrossings = Object.values(complexity.crossingPotential).reduce(
    (a, b) => a + b,
    0
  );
  if (totalCrossings > 10) {
    baseConfig.ranker = 'longest-path'; // 使用最長路徑算法
    baseConfig.nodesep = Math.round(baseConfig.nodesep * 1.5);
    baseConfig.ranksep = Math.round(baseConfig.ranksep * 1.4);
  }

  return baseConfig;
};

/**
 * 驗證排版質量
 * @param {Array} nodes - 排版後的節點數組
 * @param {string} direction - 排版方向
 * @returns {Object} - 質量報告
 */
export const validateLayoutQuality = (nodes, direction) => {
  const overlaps = detectNodeOverlaps(nodes);
  const canvasSize = estimateLayoutCanvasSize(nodes, direction);

  return {
    hasOverlaps: overlaps.length > 0,
    overlapCount: overlaps.length,
    overlaps: overlaps,
    canvasSize: canvasSize,
    nodeCount: nodes.length,
    quality:
      overlaps.length === 0
        ? 'excellent'
        : overlaps.length <= 2
        ? 'good'
        : overlaps.length <= 5
        ? 'acceptable'
        : 'poor'
  };
};
